// Global configuration constants (can be overridden with NEXT_PUBLIC_ env vars)
// Default input mint/symbol used when initiating a Buy flow (e.g. paying with SOL by default)
export const DEFAULT_BUY_INPUT_MINT = process.env.NEXT_PUBLIC_DEFAULT_BUY_INPUT_MINT || 'So11111111111111111111111111111111111111112';
export const DEFAULT_BUY_INPUT_SYMBOL = process.env.NEXT_PUBLIC_DEFAULT_BUY_INPUT_SYMBOL || 'SOL';

// Default percent of balance to prefill when opening a swap in buy/sell quick actions
export const DEFAULT_PREFILL_PERCENT = Number(process.env.NEXT_PUBLIC_DEFAULT_PREFILL_PERCENT || 25); // 25%
