// make-short-doc.js
// Builds data/policy-short.md by truncating data/policy.md until the token count
// lands between the Sonnet 5 minimum (1,024) and the Haiku 4.5 minimum (4,096).
// That gap is the whole point: same document, same marker, caches on one model,
// silently does not cache on the other.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { client, loadPolicy, systemCached, SONNET } from './lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = 2600;   // comfortably inside the 1,024 - 4,096 gap

const count = async (text) => {
  const system = systemCached(text).map(({ cache_control, ...b }) => b);
  const { input_tokens } = await client.messages.countTokens({
    model: SONNET, system, messages: [{ role: 'user', content: 'x' }],
  });
  return input_tokens;
};

const full = loadPolicy('policy.md');
const paras = full.split(/\n\n+/);

let take = 0, text = '', tokens = 0;
while (take < paras.length) {
  const next = paras.slice(0, take + 1).join('\n\n');
  const n = await count(next);
  if (n > TARGET) break;
  text = next; tokens = n; take++;
}

if (tokens < 1300) {
  console.error(`Truncated doc is only ${tokens} tokens, too close to the Sonnet minimum of 1,024.`);
  console.error('Split your policy into smaller paragraphs, or lower TARGET.');
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, 'data', 'policy-short.md'), text);
console.log(`Wrote data/policy-short.md  ->  ${tokens.toLocaleString()} tokens, ${take} paragraphs.`);
console.log(`Above Sonnet 5 minimum (1,024): YES`);
console.log(`Above Haiku 4.5 minimum (4,096): NO   <-- this is what the trap needs`);
