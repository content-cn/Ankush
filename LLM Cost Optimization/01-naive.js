// 01-naive.js -- CLI wrapper. Logic lives in runners.js so the UI and the
// terminal measure the same thing with the same cost maths.
import { runNaive } from './runners.js';
import { cliReporter } from './cli-report.js';
await cliReporter(runNaive);
