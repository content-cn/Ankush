// cli-report.js -- turns runner events into the terminal output.
export async function cliReporter(runner, notes = []) {
  let ledger = null;

  ledger = await runner(e => {
    if (e.type === 'start') {
      console.log(`${e.label.toUpperCase()}  |  ${e.total} tickets  |  ${e.detail}\n`);
      notes.forEach(n => console.log(n));
      if (notes.length) console.log('');
    }
    if (e.type === 'row') {
      const r = e.row;
      const tag = r.batched ? 'BATCH' : 'SYNC ';
      console.log(
        `[${String(e.index + 1).padStart(2, '0')}] ${r.ticketId} ${tag} ${r.model.padEnd(9)} ` +
        `write=${String(r.cache_creation_input_tokens).padStart(6)} ` +
        `read=${String(r.cache_read_input_tokens).padStart(6)} ` +
        `in=${String(r.input_tokens).padStart(5)} ` +
        `out=${String(r.output_tokens).padStart(4)} ` +
        `| $${r.cost.toFixed(6)}  running $${e.running.toFixed(4)}`
      );
    }
    if (e.type === 'batch') {
      if (e.phase === 'created') console.log(`\nBatch created: ${e.batchId}   requests: ${e.count}`);
      if (e.phase === 'polling') console.log(`  polling... ${e.minutes} min  |  succeeded=${e.counts.succeeded} processing=${e.counts.processing}`);
      if (e.phase === 'ended') console.log(`\nBatch ended after ${e.minutes} min.`, e.counts, '\n');
    }
    if (e.type === 'skip') console.log(`  ${e.ticketId}  ${e.reason.toUpperCase()} (not billed)`);
  });

  ledger.save();
  return ledger;
}
