// Pluggable card-ledger gateway (provider-agnostic scaffold)

export type LedgerProvider = 'memory' | 'generic';

function provider(): LedgerProvider {
  const p = (process.env.CARD_LEDGER_PROVIDER || 'memory').toLowerCase();
  return (p === 'generic') ? 'generic' : 'memory';
}

function base() {
  const u = process.env.CARD_LEDGER_BASE_URL;
  if (!u) throw new Error('CARD_LEDGER_BASE_URL not set');
  return u.replace(/\/$/, '');
}

async function fetchJson(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  headers.set('content-type', 'application/json');
  const key = process.env.CARD_LEDGER_API_KEY || '';
  if (key) headers.set('authorization', `Bearer ${key}`);
  const res = await fetch(`${base()}${path}`, { ...init, headers });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(json?.error || `ledger ${res.status}`);
  return json;
}

export async function ledgerCredit(pubkey: string, usdc: number, meta?: Record<string, any>) {
  if (provider() === 'memory') return { ok: true } as any;
  return await fetchJson('/ledger/credit', { method: 'POST', body: JSON.stringify({ pubkey, amount: usdc, currency: 'USDC', meta }) });
}

export async function ledgerDebit(pubkey: string, usdc: number, meta?: Record<string, any>) {
  if (provider() === 'memory') return { ok: true } as any;
  return await fetchJson('/ledger/debit', { method: 'POST', body: JSON.stringify({ pubkey, amount: usdc, currency: 'USDC', meta }) });
}

export async function ledgerBalance(pubkey: string) {
  if (provider() === 'memory') return null; // signal use of local
  return await fetchJson(`/ledger/balance?pubkey=${encodeURIComponent(pubkey)}`);
}

export async function ledgerTransactions(pubkey: string) {
  if (provider() === 'memory') return null;
  return await fetchJson(`/ledger/transactions?pubkey=${encodeURIComponent(pubkey)}`);
}

