# LLM Cost Engineering demo

Four cost levers measured against one real workload. Every dollar figure comes
from the `usage` object the Claude API returns. Nothing is estimated.

## Before you run anything

1. Put your real policy or FAQ document at `data/policy.md` (8,000 to 12,000 tokens).
2. Rewrite the `text` field of each ticket in `data/tickets.json` to match that
   document. Leave `id`, `complexity` and `priority` alone: the counts are load-bearing.
3. `npm install`
4. `export ANTHROPIC_API_KEY="sk-ant-..."`
5. `npm run shortdoc`
6. `npm run verify`  <- every line must say PASS

## The run

| Command | What it does |
|---|---|
| `npm run pass1` | Naive. Full policy resent every ticket, Sonnet 5, sequential, no caching. |
| `npm run pass2` | Caching on. Only change: the policy block carries `cache_control`. |
| `npm run pass3` | Caching + routing. Simple tickets go to Haiku 4.5, judgment stays on Sonnet 5. |
| `npm run trap`  | The document length trap. Same marker, same doc, one model caches and one silently does not. |
| `npm run pass4` | Caching + routing + batching. Backlog slice submitted as one Message Batch with a 1h cache TTL. |
| `npm run dashboard` | Builds `results/dashboard.html` from the four results files. Open it. |

Then open the Console Cost page, filtered to this demo's API key, and check it
against the dashboard total.

## Cost

One full four-pass run over 50 tickets with a 10,000 token document is roughly
$1.60 to $1.80. Budget $8 for two rehearsals plus the take.

## Where the rates live

`pricing.js`, and nowhere else. Sonnet 5 and Haiku 4.5 rates, the caching
multipliers, and the batch discount. If a published rate changes, change it there.
