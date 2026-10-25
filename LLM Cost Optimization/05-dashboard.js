// 05-dashboard.js  -- STEP 5: pull the four running totals into one page.
// Reads results/*.json (written by passes 1-4) and writes a self-contained
// results/dashboard.html. No server, no fetch, no backend. Open the file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'results');

const PASSES = [
  ['01-naive',   'Naive'],
  ['02-cached',  'Cached'],
  ['03-routed',  'Cached + Routed'],
  ['04-batched', 'Cached + Routed + Batched'],
];

const data = PASSES.map(([file, label]) => {
  const p = path.join(dir, `${file}.json`);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${file}.json. Run that pass first.`);
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return { label, cost: j.totals.cost, tokens: j.totals, calls: j.rows.length };
});

const baseline = data[0].cost;
const final = data[data.length - 1].cost;
const pctOff = ((1 - final / baseline) * 100).toFixed(1);
const factor = (baseline / final).toFixed(1);

const rows = data.map(d => `
      <tr>
        <td>${d.label}</td>
        <td class="n">${d.calls}</td>
        <td class="n">${d.tokens.cache_creation_input_tokens.toLocaleString()}</td>
        <td class="n">${d.tokens.cache_read_input_tokens.toLocaleString()}</td>
        <td class="n">${d.tokens.input_tokens.toLocaleString()}</td>
        <td class="n">${d.tokens.output_tokens.toLocaleString()}</td>
        <td class="n money">$${d.cost.toFixed(4)}</td>
        <td class="n">${d.cost === baseline ? 'baseline' : '-' + ((1 - d.cost / baseline) * 100).toFixed(1) + '%'}</td>
      </tr>`).join('');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>LLM Cost Engineering: four levers, measured</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;padding:40px;background:#0f1419;color:#e6e6e6}
  .wrap{max-width:980px;margin:0 auto}
  h1{font-size:26px;margin:0 0 4px;font-weight:600}
  .sub{color:#8b98a5;font-size:14px;margin-bottom:28px}
  .headline{display:flex;gap:40px;margin:24px 0 32px;padding:20px 24px;background:#171d24;border-radius:10px;border:1px solid #232b34}
  .headline div span{display:block}
  .k{font-size:12px;color:#8b98a5;text-transform:uppercase;letter-spacing:.06em}
  .v{font-size:30px;font-weight:600;color:#4ade80;margin-top:4px}
  .card{background:#171d24;border:1px solid #232b34;border-radius:10px;padding:22px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:9px 10px;text-align:left;border-bottom:1px solid #232b34}
  th{color:#8b98a5;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  .n{text-align:right;font-variant-numeric:tabular-nums}
  .money{color:#4ade80;font-weight:600}
  .foot{color:#8b98a5;font-size:12px;margin-top:8px;line-height:1.6}
</style></head><body><div class="wrap">
  <h1>LLM Cost Engineering: four levers, measured</h1>
  <div class="sub">Every figure below is computed from the <code>usage</code> object the Claude API returned on each call. Nothing here is estimated.</div>

  <div class="headline">
    <div><span class="k">Naive baseline</span><span class="v" style="color:#f87171">$${baseline.toFixed(4)}</span></div>
    <div><span class="k">All three levers</span><span class="v">$${final.toFixed(4)}</span></div>
    <div><span class="k">Reduction</span><span class="v">${pctOff}%</span></div>
    <div><span class="k">Cheaper by</span><span class="v">${factor}x</span></div>
  </div>

  <div class="card"><canvas id="c" height="120"></canvas></div>

  <div class="card">
    <table>
      <thead><tr>
        <th>Pass</th><th class="n">Calls</th><th class="n">Cache writes</th><th class="n">Cache reads</th>
        <th class="n">Uncached input</th><th class="n">Output</th><th class="n">Cost</th><th class="n">vs baseline</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="foot">Token columns are raw API response fields: <code>cache_creation_input_tokens</code>, <code>cache_read_input_tokens</code>, <code>input_tokens</code>, <code>output_tokens</code>.<br>
    Rates: Sonnet 5 $2.00 in / $10.00 out, Haiku 4.5 $1.00 in / $5.00 out per MTok. Cache read 0.1x base, 5m write 1.25x, 1h write 2.0x. Batch usage at 50%.</div>
  </div>
</div>
<script>
const D = ${JSON.stringify(data.map(d => ({ label: d.label, cost: +d.cost.toFixed(6) })))};
new Chart(document.getElementById('c'), {
  type: 'bar',
  data: { labels: D.map(d => d.label),
    datasets: [{ data: D.map(d => d.cost),
      backgroundColor: ['#f87171','#fbbf24','#60a5fa','#4ade80'], borderRadius: 6, barPercentage: .62 }] },
  options: { plugins: { legend: { display: false },
      tooltip: { callbacks: { label: c => '$' + c.parsed.y.toFixed(4) } } },
    scales: { y: { beginAtZero: true, ticks: { color: '#8b98a5', callback: v => '$' + v.toFixed(2) }, grid: { color: '#232b34' } },
              x: { ticks: { color: '#8b98a5' }, grid: { display: false } } } }
});
</script></body></html>`;

fs.writeFileSync(path.join(dir, 'dashboard.html'), html);
console.log('\nFOUR-PASS SUMMARY');
data.forEach(d => console.log(`  ${d.label.padEnd(28)} $${d.cost.toFixed(4)}`));
console.log(`\n  Reduction vs naive: ${pctOff}%   (${factor}x cheaper)`);
console.log(`\nWrote results/dashboard.html  -- open it in a browser.`);
