// 04-batched.js -- CLI wrapper.
import { runBatched } from './runners.js';
import { cliReporter } from './cli-report.js';
await cliReporter(runBatched);
