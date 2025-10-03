// Simple in-memory token-bucket style limiter per key (IP or composite)
// Not production hardened (no distributed store). Suitable for basic abuse protection.

interface Bucket { tokens: number; updated: number; }

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { capacity: number; refillPerSec: number }): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) { b = { tokens: opts.capacity, updated: now }; buckets.set(key, b); }
  // Refill
  const elapsed = (now - b.updated) / 1000;
  if (elapsed > 0) {
    const refill = elapsed * opts.refillPerSec;
    b.tokens = Math.min(opts.capacity, b.tokens + refill);
    b.updated = now;
  }
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}
