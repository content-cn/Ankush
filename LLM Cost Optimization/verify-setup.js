// verify-setup.js  -- run this BEFORE recording. Every line must say PASS.
import { client, loadPolicy, loadTickets, systemCached, SONNET, HAIKU, INSTRUCTION } from './lib.js';

const MIN = { [SONNET]: 1024, [HAIKU]: 4096 };  // minimum cacheable prefix, per the Claude docs
let failures = 0;

const ok = (pass, msg) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!pass) failures++;
};

// 1. API key present and working
try {
  const r = await client.messages.create({
    model: HAIKU, max_tokens: 5, messages: [{ role: 'user', content: 'ping' }],
  });
  ok(true, `API key works. Test call returned ${r.usage.output_tokens} output tokens.`);
} catch (e) {
  ok(false, `API key check failed: ${e.message}`);
}

// 2. Token count of the cached prefix, measured with the real counter (not estimated)
async function measure(file) {
  const policy = loadPolicy(file);
  // Count the cached prefix (instruction + policy). Drop the marker itself:
  // we want the token count, not the caching behaviour.
  const system = systemCached(policy).map(({ cache_control, ...b }) => b);
  const { input_tokens } = await client.messages.countTokens({
    model: SONNET,
    system,
    messages: [{ role: 'user', content: 'x' }],
  });
  // Subtract the tiny non-policy overhead to get a fair read on the cached prefix.
  return { file, tokens: input_tokens, chars: policy.length };
}

const full = await measure('policy.md');
console.log(`\npolicy.md       ${full.tokens.toLocaleString()} tokens (${full.chars.toLocaleString()} chars)`);
ok(full.tokens >= MIN[HAIKU] + 500,
   `policy.md clears the Haiku 4.5 minimum of ${MIN[HAIKU].toLocaleString()} with headroom. Target 8,000-12,000.`);
ok(full.tokens >= 8000 && full.tokens <= 12000,
   `policy.md is inside the recommended 8,000-12,000 token band (currently ${full.tokens.toLocaleString()}).`);

const short = await measure('policy-short.md');
console.log(`policy-short.md ${short.tokens.toLocaleString()} tokens (${short.chars.toLocaleString()} chars)`);
ok(short.tokens > MIN[SONNET] + 200 && short.tokens < MIN[HAIKU] - 200,
   `policy-short.md sits between ${MIN[SONNET].toLocaleString()} and ${MIN[HAIKU].toLocaleString()} tokens, which is what makes the trap visible.`);

// 3. Ticket file shape and slice sizes
const tickets = loadTickets();
const simple = tickets.filter(t => t.complexity === 'simple');
const judgment = tickets.filter(t => t.complexity === 'judgment');
const urgent = tickets.filter(t => t.priority === 'urgent');
const backlog = tickets.filter(t => t.priority === 'backlog');
const bSimple = backlog.filter(t => t.complexity === 'simple').length;
const bJudg = backlog.filter(t => t.complexity === 'judgment').length;

console.log(`\ntickets.json    ${tickets.length} tickets`);
console.log(`                complexity: ${simple.length} simple / ${judgment.length} judgment`);
console.log(`                priority:   ${urgent.length} urgent / ${backlog.length} backlog`);
console.log(`                batch slice: ${bSimple} Haiku + ${bJudg} Sonnet`);

ok(tickets.length >= 40 && tickets.length <= 50, `Ticket count is in the 40-50 range.`);
ok(new Set(tickets.map(t => t.id)).size === tickets.length, `All ticket ids are unique (required as batch custom_id).`);
ok(tickets.every(t => /^[a-zA-Z0-9_-]{1,64}$/.test(t.id)), `All ticket ids are valid custom_id values.`);
ok(simple.length > 0 && judgment.length > 0, `Both complexity classes are populated, so routing has something to route.`);
ok(bSimple >= 9 && bJudg >= 9,
   `Each model has at least 9 requests in the batch slice, so the 1h cache write is amortised and batching wins.`);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED. Safe to record.' : `${failures} CHECK(S) FAILED. Fix before recording.`}`);
process.exit(failures === 0 ? 0 : 1);
