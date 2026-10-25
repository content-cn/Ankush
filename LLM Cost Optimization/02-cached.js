// 02-cached.js -- CLI wrapper.
import { runCached } from './runners.js';
import { cliReporter } from './cli-report.js';
await cliReporter(runCached, [
  'Watch ticket 01: the write column is non-zero and it costs MORE than a pass-1 ticket.',
  'Watch ticket 02 onward: the write column drops to 0 and the read column takes over.',
]);
