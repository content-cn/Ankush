// runners.js
// Single source of truth for the four passes plus the trap.
// Both the CLI scripts and the local UI server call these, so there is no way
// for the two surfaces to drift apart on what they measure or what they charge.
import {
  client, loadPolicy, loadTickets, systemNaive, systemCached, userMessage,
  SONNET, HAIKU, MAX_TOKENS, Ledger,
} from './lib.js';

const noop = () => {};

/** The model's actual reply, so every row on screen carries real generated text. */
const answerOf = (msg) =>
  (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

/** PASS 1: full policy resent every ticket. Sonnet 5. Sequential. No caching. */
export async function runNaive(emit = noop) {
  const policy = loadPolicy();
  const tickets = loadTickets();
  const ledger = new Ledger('01-naive');

  emit({ type: 'start', pass: '01-naive', label: 'Naive', total: tickets.length,
         detail: 'Sonnet 5 · caching off · batching off' });

  for (const [i, t] of tickets.entries()) {
    const t0 = Date.now();
    const res = await client.messages.create({
      model: SONNET, max_tokens: MAX_TOKENS,
      system: systemNaive(policy), messages: userMessage(t),
    });
    emit({ type: 'row', index: i, ticket: t, ms: Date.now() - t0,
           answer: answerOf(res),
           row: ledger.add(t.id, SONNET, res.usage), usage: res.usage,
           running: ledger.totals.cost });
  }

  emit({ type: 'done', pass: '01-naive', totals: ledger.totals });
  return ledger;
}

/** PASS 2: identical to pass 1 except the policy block carries cache_control. */
export async function runCached(emit = noop) {
  const policy = loadPolicy();
  const tickets = loadTickets();
  const ledger = new Ledger('02-cached');

  emit({ type: 'start', pass: '02-cached', label: 'Cached', total: tickets.length,
         detail: 'Sonnet 5 · caching on (5m) · batching off' });

  // Sequential on purpose: a cache entry only becomes available once the first
  // response has begun, so parallel requests would miss it.
  for (const [i, t] of tickets.entries()) {
    const t0 = Date.now();
    const res = await client.messages.create({
      model: SONNET, max_tokens: MAX_TOKENS,
      system: systemCached(policy), messages: userMessage(t),
    });
    emit({ type: 'row', index: i, ticket: t, ms: Date.now() - t0,
           answer: answerOf(res),
           row: ledger.add(t.id, SONNET, res.usage), usage: res.usage,
           running: ledger.totals.cost });
  }

  emit({ type: 'done', pass: '02-cached', totals: ledger.totals });
  return ledger;
}

/** PASS 3: caching plus routing on the ticket's own complexity tag. */
export async function runRouted(emit = noop) {
  const policy = loadPolicy();
  const tickets = loadTickets();
  const ledger = new Ledger('03-routed');
  const simple = tickets.filter(t => t.complexity === 'simple').length;

  emit({ type: 'start', pass: '03-routed', label: 'Cached + Routed', total: tickets.length,
         detail: `${simple} simple to Haiku 4.5 · ${tickets.length - simple} judgment to Sonnet 5` });

  for (const [i, t] of tickets.entries()) {
    // <demo:routed>
    // The routing signal is a tag already on the ticket. No classifier call,
    // no extra token, no extra cost. A cheap classification model would work
    // the same way if the tag were not already there.
    const model = t.complexity === 'simple' ? HAIKU : SONNET;
    // </demo:routed>
    const t0 = Date.now();
    const res = await client.messages.create({
      model, max_tokens: MAX_TOKENS,
      system: systemCached(policy), messages: userMessage(t),
    });
    emit({ type: 'row', index: i, ticket: t, ms: Date.now() - t0,
           answer: answerOf(res),
           row: ledger.add(t.id, model, res.usage), usage: res.usage,
           running: ledger.totals.cost });
  }

  emit({ type: 'done', pass: '03-routed', totals: ledger.totals });
  return ledger;
}

/**
 * PASS 4: caching plus routing plus batching.
 * Urgent tickets stay synchronous. Backlog tickets go into one Message Batch
 * with a 1h cache TTL, because a batch can sit longer than the 5m default.
 */
export async function runBatched(emit = noop) {
  const policy = loadPolicy();
  const tickets = loadTickets();
  const ledger = new Ledger('04-batched');

  const urgent = tickets.filter(t => t.priority === 'urgent');
  const backlog = tickets.filter(t => t.priority === 'backlog');
  const pick = t => (t.complexity === 'simple' ? HAIKU : SONNET);

  emit({ type: 'start', pass: '04-batched', label: 'Cached + Routed + Batched',
         total: tickets.length,
         detail: `${urgent.length} urgent stay synchronous · ${backlog.length} backlog in one batch job` });

  for (const [i, t] of urgent.entries()) {
    const model = pick(t);
    const t0 = Date.now();
    const res = await client.messages.create({
      model, max_tokens: MAX_TOKENS,
      system: systemCached(policy), messages: userMessage(t),
    });
    emit({ type: 'row', index: i, ticket: t, ms: Date.now() - t0,
           answer: answerOf(res),
           row: ledger.add(t.id, model, res.usage), usage: res.usage,
           running: ledger.totals.cost });
  }

  // <demo:batched>
  // One batch job instead of one call per ticket. Batch usage is charged at
  // 50% of standard prices, and that stacks on top of caching and routing.
  //
  // ttl '1h' rather than the 5m default: a batch is asynchronous and can sit
  // longer than five minutes, so the short cache can expire before the job
  // even starts running.
  const requests = backlog.map(t => ({
    custom_id: t.id,
    params: {
      model: pick(t), max_tokens: MAX_TOKENS,
      system: systemCached(policy, '1h'), messages: userMessage(t),
    },
  }));

  const batch = await client.messages.batches.create({ requests });
  // </demo:batched>
  emit({ type: 'batch', phase: 'created', batchId: batch.id, count: backlog.length });

  const started = Date.now();
  let current = batch;
  while (current.processing_status !== 'ended') {
    emit({ type: 'batch', phase: 'polling', batchId: batch.id,
           minutes: +((Date.now() - started) / 60000).toFixed(1),
           counts: current.request_counts });
    await new Promise(r => setTimeout(r, 15000));
    current = await client.messages.batches.retrieve(batch.id);
  }
  emit({ type: 'batch', phase: 'ended', batchId: batch.id,
         minutes: +((Date.now() - started) / 60000).toFixed(1),
         counts: current.request_counts });

  const byId = Object.fromEntries(backlog.map(t => [t.id, t]));
  let i = urgent.length;
  const results = await client.messages.batches.results(batch.id);
  for await (const r of results) {
    if (r.result.type !== 'succeeded') {
      emit({ type: 'skip', ticketId: r.custom_id, reason: r.result.type });
      continue;
    }
    const t = byId[r.custom_id];
    const usage = r.result.message.usage;
    emit({ type: 'row', index: i++, ticket: t,
           answer: answerOf(r.result.message),
           row: ledger.add(t.id, pick(t), usage, { batched: true }), usage,
           running: ledger.totals.cost });
  }

  emit({ type: 'done', pass: '04-batched', totals: ledger.totals, batchId: batch.id });
  return ledger;
}

/**
 * The document length trap.
 * Minimum cacheable prefix is 1,024 tokens on Sonnet 5 and 4,096 on Haiku 4.5.
 * Below the minimum the request is processed without caching and no error is
 * returned: both usage fields simply come back as zero.
 */
export async function runTrap(emit = noop) {
  const short = loadPolicy('policy-short.md');
  const full = loadPolicy('policy.md');
  const question = [{ role: 'user', content: 'What is the claim window?' }];
  const probes = [
    { key: 'A', label: 'Short document on Sonnet 5', model: SONNET, policy: short, expectCached: true },
    { key: 'B', label: 'Short document on Haiku 4.5', model: HAIKU, policy: short, expectCached: false },
    { key: 'C', label: 'Full document on Haiku 4.5', model: HAIKU, policy: full, expectCached: true },
  ];

  emit({ type: 'start', pass: 'trap', label: 'Document length trap', total: probes.length * 2,
         detail: 'Same marker, same code. Only the model and the document length change.' });

  for (const p of probes) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await client.messages.create({
        model: p.model, max_tokens: 60,
        system: systemCached(p.policy), messages: question,
      });
      const u = res.usage;
      emit({ type: 'probe', probe: p.key, label: p.label, attempt,
             model: p.model === SONNET ? 'Sonnet 5' : 'Haiku 4.5',
             cacheCreation: u.cache_creation_input_tokens ?? 0,
             cacheRead: u.cache_read_input_tokens ?? 0,
             cached: ((u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)) > 0,
             usage: u });
    }
  }

  emit({ type: 'done', pass: 'trap' });
}

export const PASSES = {
  naive: runNaive,
  cached: runCached,
  routed: runRouted,
  batched: runBatched,
  trap: runTrap,
};
