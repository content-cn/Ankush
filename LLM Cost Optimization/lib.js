// lib.js  -- shared plumbing for all four passes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { costOf, RATES } from './pricing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SONNET = 'claude-sonnet-5';
export const HAIKU = 'claude-haiku-4-5-20251001';

// Same cap on every pass so the comparison is fair.
export const MAX_TOKENS = 250;

export const client = new Anthropic();

export function loadPolicy(file = 'policy.md') {
  return fs.readFileSync(path.join(__dirname, 'data', file), 'utf8');
}

export function loadTickets() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tickets.json'), 'utf8'));
}

export const INSTRUCTION =
  'You are a customer support assistant. Answer the ticket using ONLY the policy ' +
  'document below. Be concise: 3 sentences maximum. If the policy does not cover ' +
  'the question, say so and recommend escalation.';

// <demo:naive>
/**
 * System prompt WITHOUT caching. The whole policy is resent and reprocessed every call.
 */
export function systemNaive(policy) {
  return [{ type: 'text', text: `${INSTRUCTION}\n\n<policy>\n${policy}\n</policy>` }];
}
// </demo:naive>

// <demo:cached>
/**
 * System prompt WITH an explicit cache breakpoint on the policy block.
 *
 * The breakpoint goes on the LAST block that is identical across requests.
 * The ticket text lives in `messages`, i.e. AFTER the breakpoint, so it never
 * invalidates the cached prefix. Automatic (top-level) caching would place the
 * breakpoint on the last cacheable block, which here is the ticket itself, and
 * would therefore write a fresh entry on every request and never read one.
 */
export function systemCached(policy, ttl = null) {
  const cache_control = ttl ? { type: 'ephemeral', ttl } : { type: 'ephemeral' };
  return [
    { type: 'text', text: INSTRUCTION },
    { type: 'text', text: `<policy>\n${policy}\n</policy>`, cache_control },
  ];
}
// </demo:cached>

export function userMessage(ticket) {
  return [{ role: 'user', content: `Ticket ${ticket.id}: ${ticket.text}` }];
}

/** Accumulates real token counts and real dollars across a pass. */
export class Ledger {
  constructor(passName) {
    this.pass = passName;
    this.rows = [];
    this.totals = {
      input_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      output_tokens: 0,
      cost: 0,
    };
  }

  add(ticketId, model, usage, { batched = false } = {}) {
    const cost = costOf(model, usage, { batched });
    this.totals.input_tokens += usage.input_tokens ?? 0;
    this.totals.cache_creation_input_tokens += usage.cache_creation_input_tokens ?? 0;
    this.totals.cache_read_input_tokens += usage.cache_read_input_tokens ?? 0;
    this.totals.output_tokens += usage.output_tokens ?? 0;
    this.totals.cost += cost;
    const row = {
      ticketId,
      model: RATES[model].label,
      batched,
      input_tokens: usage.input_tokens ?? 0,
      cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      cost,
    };
    this.rows.push(row);
    return row;
  }

  /** One console line per ticket, showing the raw API fields side by side with the running total. */
  print(row, index, total) {
    const tag = row.batched ? 'BATCH' : 'SYNC ';
    console.log(
      `[${String(index + 1).padStart(2, '0')}/${total}] ${row.ticketId} ${tag} ${row.model.padEnd(9)} ` +
      `write=${String(row.cache_creation_input_tokens).padStart(6)} ` +
      `read=${String(row.cache_read_input_tokens).padStart(6)} ` +
      `in=${String(row.input_tokens).padStart(4)} ` +
      `out=${String(row.output_tokens).padStart(4)} ` +
      `| $${row.cost.toFixed(6)}  running $${this.totals.cost.toFixed(4)}`
    );
  }

  save() {
    const dir = path.join(__dirname, 'results');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${this.pass}.json`);
    fs.writeFileSync(file, JSON.stringify({ pass: this.pass, totals: this.totals, rows: this.rows }, null, 2));
    console.log(`\n=== ${this.pass.toUpperCase()} TOTAL: $${this.totals.cost.toFixed(4)} ===`);
    console.log(`Tokens  write=${this.totals.cache_creation_input_tokens}  read=${this.totals.cache_read_input_tokens}  in=${this.totals.input_tokens}  out=${this.totals.output_tokens}`);
    console.log(`Saved -> results/${this.pass}.json`);
    return file;
  }
}
