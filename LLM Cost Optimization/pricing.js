// pricing.js
// Rates in USD per million tokens.
// Source: https://platform.claude.com/docs/en/build-with-claude/prompt-caching  (Pricing table)
//         https://platform.claude.com/docs/en/build-with-claude/batch-processing (Pricing table)
// Verified against the docs before recording. If a rate changes, change it HERE only.

export const RATES = {
  'claude-sonnet-5': {
    label: 'Sonnet 5',
    input: 2.00,        // base input
    write5m: 2.50,      // 1.25x base
    write1h: 4.00,      // 2.00x base
    read: 0.20,         // 0.10x base
    output: 10.00,
  },
  'claude-haiku-4-5-20251001': {
    label: 'Haiku 4.5',
    input: 1.00,
    write5m: 1.25,
    write1h: 2.00,
    read: 0.10,
    output: 5.00,
  },
};

// The Batch API charges 50% of standard prices on ALL usage, and the caching
// multipliers stack with it. So: compute the normal cost, then halve it.
export const BATCH_MULTIPLIER = 0.5;

/**
 * Turn one API response's `usage` object into a dollar figure.
 * Every input to this function comes from the API response. Nothing is estimated.
 */
export function costOf(model, usage, { batched = false } = {}) {
  const r = RATES[model];
  if (!r) throw new Error(`No rate card for model: ${model}`);

  // usage.cache_creation splits writes by TTL. Fall back to the flat field
  // (which is the sum) and assume 5m if the breakdown is absent.
  const write5m = usage.cache_creation?.ephemeral_5m_input_tokens
    ?? (usage.cache_creation ? 0 : (usage.cache_creation_input_tokens ?? 0));
  const write1h = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;

  const dollars =
    ((usage.input_tokens ?? 0) * r.input +
     write5m * r.write5m +
     write1h * r.write1h +
     (usage.cache_read_input_tokens ?? 0) * r.read +
     (usage.output_tokens ?? 0) * r.output) / 1_000_000;

  return batched ? dollars * BATCH_MULTIPLIER : dollars;
}

export function usd(n) {
  return `$${n.toFixed(6)}`;
}
