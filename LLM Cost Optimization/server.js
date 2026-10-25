// server.js -- local UI server for the cost engineering demo.
//
// The browser cannot call the Anthropic API directly: the key would be exposed
// in page source and the request would be blocked by CORS anyway. So this small
// server holds the key, runs the passes, and streams each response's usage
// object to the page as it arrives.
//
// Nothing here computes cost. All pricing lives in pricing.js and all pass
// logic lives in runners.js, shared with the CLI scripts.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PASSES } from './runners.js';
import { loadTickets, loadPolicy, systemCached, client, SONNET, HAIKU } from './lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4178;
const RESULTS = path.join(__dirname, 'results');

const PASS_FILES = {
  naive: '01-naive', cached: '02-cached', routed: '03-routed', batched: '04-batched',
};

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

// Where each pass's defining code lives. The UI reads these regions straight
// from disk at request time, so what it displays is provably the code that runs.
const SOURCE_REGIONS = {
  naive:   { file: 'lib.js',     tag: 'naive'   },
  cached:  { file: 'lib.js',     tag: 'cached'  },
  routed:  { file: 'runners.js', tag: 'routed'  },
  batched: { file: 'runners.js', tag: 'batched' },
};

function readRegion(key) {
  const r = SOURCE_REGIONS[key];
  if (!r) return null;
  const src = fs.readFileSync(path.join(__dirname, r.file), 'utf8');
  const open = src.indexOf(`// <demo:${r.tag}>`);
  const close = src.indexOf(`// </demo:${r.tag}>`);
  if (open === -1 || close === -1) return null;
  const body = src.slice(src.indexOf('\n', open) + 1, close).replace(/\s+$/, '');
  const indent = Math.min(...body.split('\n').filter(l => l.trim())
    .map(l => l.match(/^ */)[0].length));
  return { file: r.file, code: body.split('\n').map(l => l.slice(indent)).join('\n') };
}

const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

/** Which passes already have saved results, so the page can restore on reload. */
function savedResults() {
  const out = {};
  for (const [key, file] of Object.entries(PASS_FILES)) {
    const p = path.join(RESULTS, `${file}.json`);
    if (fs.existsSync(p)) {
      try { out[key] = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { }
    }
  }
  return out;
}

/** Pre-flight: key, document sizes against each model's minimum, ticket shape. */
async function preflight() {
  const checks = [];
  const push = (ok, label, detail = '') => checks.push({ ok, label, detail });

  try {
    const r = await client.messages.create({
      model: HAIKU, max_tokens: 5, messages: [{ role: 'user', content: 'ping' }],
    });
    push(true, 'API key works', `test call returned ${r.usage.output_tokens} output tokens`);
  } catch (e) {
    push(false, 'API key check failed', e.message);
    return { checks, ready: false };
  }

  const measure = async (file) => {
    const policy = loadPolicy(file);
    const system = systemCached(policy).map(({ cache_control, ...b }) => b);
    const { input_tokens } = await client.messages.countTokens({
      model: SONNET, system, messages: [{ role: 'user', content: 'x' }],
    });
    return input_tokens;
  };

  let fullTokens = 0, shortTokens = 0;
  try {
    fullTokens = await measure('policy.md');
    push(fullTokens >= 4096, 'Policy document clears the Haiku 4.5 minimum of 4,096 tokens',
         `${fullTokens.toLocaleString()} tokens`);
  } catch (e) {
    push(false, 'Could not read data/policy.md', e.message);
  }

  try {
    shortTokens = await measure('policy-short.md');
    push(shortTokens > 1024 && shortTokens < 4096,
         'Short document sits between the two minimums',
         `${shortTokens.toLocaleString()} tokens, needs to be above 1,024 and below 4,096`);
  } catch {
    push(false, 'data/policy-short.md missing', 'run: npm run shortdoc');
  }

  const tickets = loadTickets();
  const bs = tickets.filter(t => t.priority === 'backlog' && t.complexity === 'simple').length;
  const bj = tickets.filter(t => t.priority === 'backlog' && t.complexity === 'judgment').length;
  push(tickets.length >= 40 && tickets.length <= 50, 'Ticket count is in the 40 to 50 range',
       `${tickets.length} tickets`);
  push(new Set(tickets.map(t => t.id)).size === tickets.length, 'Ticket ids are unique');
  push(bs >= 9 && bj >= 9, 'Batch slice is large enough for batching to win',
       `${bs} Haiku and ${bj} Sonnet, both need at least 9`);

  return {
    checks,
    ready: checks.every(c => c.ok),
    workload: {
      policyTokens: fullTokens,
      shortTokens,
      tickets: tickets.length,
      simple: tickets.filter(t => t.complexity === 'simple').length,
      judgment: tickets.filter(t => t.complexity === 'judgment').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      backlog: tickets.filter(t => t.priority === 'backlog').length,
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // --- API ---
  if (url.pathname === '/api/preflight') {
    try { return json(res, 200, await preflight()); }
    catch (e) { return json(res, 500, { error: e.message }); }
  }

  if (url.pathname === '/api/source') {
    const region = readRegion(url.searchParams.get('pass'));
    return region ? json(res, 200, region) : json(res, 404, { error: 'no such region' });
  }

  if (url.pathname === '/api/state') {
    const tickets = loadTickets();
    return json(res, 200, {
      results: savedResults(),
      workload: {
        tickets: tickets.length,
        simple: tickets.filter(t => t.complexity === 'simple').length,
        judgment: tickets.filter(t => t.complexity === 'judgment').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        backlog: tickets.filter(t => t.priority === 'backlog').length,
      },
    });
  }

  if (url.pathname === '/api/reset') {
    for (const f of Object.values(PASS_FILES)) {
      const p = path.join(RESULTS, `${f}.json`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    return json(res, 200, { ok: true });
  }

  if (url.pathname === '/api/run') {
    const key = url.searchParams.get('pass');
    const runner = PASSES[key];
    if (!runner) return json(res, 400, { error: `unknown pass: ${key}` });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const send = (e) => res.write(`data: ${JSON.stringify(e)}\n\n`);

    try {
      const ledger = await runner(send);
      if (ledger?.save) {
        // Reuse the CLI's writer so both surfaces produce the same files.
        const orig = console.log;
        console.log = () => {};
        try { ledger.save(); } finally { console.log = orig; }
      }
      send({ type: 'complete' });
    } catch (e) {
      send({ type: 'error', message: e.message });
    }
    return res.end();
  }

  // --- static ---
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  const full = path.join(__dirname, 'ui', path.normalize(file).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(path.join(__dirname, 'ui')) || !fs.existsSync(full)) {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'text/plain' });
  fs.createReadStream(full).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  Cost engineering console running`);
  console.log(`  http://localhost:${PORT}\n`);
});
