// 03-routed.js -- CLI wrapper.
import { runRouted } from './runners.js';
import { cliReporter } from './cli-report.js';
await cliReporter(runRouted, [
  'Each model keeps its own cache entry, so expect exactly two writes: one per model.',
]);
