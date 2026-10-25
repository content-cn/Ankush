// 03b-trap.js -- CLI wrapper for the document length trap.
import { runTrap } from './runners.js';

await runTrap(e => {
  if (e.type === 'start') {
    console.log('THE DOCUMENT LENGTH TRAP');
    console.log('Minimum cacheable prefix: Sonnet 5 = 1,024 tokens, Haiku 4.5 = 4,096 tokens.');
    console.log(e.detail);
  }
  if (e.type === 'probe') {
    if (e.attempt === 1) console.log(`\n--- ${e.probe}. ${e.label} ---`);
    console.log(
      `  request ${e.attempt}:  cache_creation_input_tokens=${String(e.cacheCreation).padStart(6)}   ` +
      `cache_read_input_tokens=${String(e.cacheRead).padStart(6)}   ` +
      `-> ${e.cached ? 'CACHED' : 'NOT CACHED (silently)'}`
    );
  }
  if (e.type === 'done') {
    console.log('\nB is the trap: no error, no warning, both fields at zero, and the routing');
    console.log('step would have quietly saved nothing on every simple ticket.\n');
  }
});
