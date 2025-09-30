// Simple in-memory card ledger and top-up service (stubbed for dev)
// In production, replace with a persistent store + real swap + ledger.

type Tx = {
  id: string;
  type: 'topup' | 'spend';
  amount: number; // USDC for spend/topup (post-swap)
  currency: 'USDC';
  time: number; // epoch seconds
  desc?: string;
  ref?: string; // signature or external reference
  meta?: Record<string, any>;
};

type Ledger = { balance: number; txs: Tx[] };

const ledgers = new Map<string, Ledger>();

function nowSec() { return Math.floor(Date.now() / 1000); }
function makeId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function ensureLedger(pubkey: string): Ledger {
  let l = ledgers.get(pubkey);
  if (!l) { l = { balance: 0, txs: [] }; ledgers.set(pubkey, l); }
  return l;
}

export function getCardBalance(pubkey: string) {
  return ensureLedger(pubkey).balance;
}

export function listCardTransactions(pubkey: string) {
  return ensureLedger(pubkey).txs.slice().sort((a, b) => b.time - a.time);
}

// Naive on-chain verification stub; replace with RPC checks
export async function verifyDopeDeposit(_pubkey: string, signature: string | undefined) {
  // Accept non-empty signature for dev; in prod, verify transfer to vault PDA.
  if (!signature || typeof signature !== 'string' || signature.length < 16) {
    return false;
  }
  return true;
}

export type Quote = { dopeIn: number; usdcOut: number; price: number; fee: number; slippage: number };

// Simple quoting: 1 DOPE ~= 1 USDC minus 0.5% fee, slippage 0.5% assumed
export function quoteDopeToUsdc(amountDope: number): Quote {
  const price = 1.0;
  const gross = amountDope * price;
  const fee = Math.max(0, gross * 0.005);
  const slip = Math.max(0, gross * 0.005);
  const usdcOut = Math.max(0, gross - fee - slip);
  return { dopeIn: amountDope, usdcOut, price, fee, slippage: slip };
}

export async function topupCard(pubkey: string, amountDope: number, signature?: string) {
  if (!pubkey) throw new Error('pubkey required');
  if (!Number.isFinite(amountDope) || amountDope <= 0) throw new Error('invalid amount');
  const ok = await verifyDopeDeposit(pubkey, signature);
  if (!ok) throw new Error('deposit not verified');
  const q = quoteDopeToUsdc(amountDope);
  const ledger = ensureLedger(pubkey);
  ledger.balance += q.usdcOut;
  const tx: Tx = {
    id: makeId(),
    type: 'topup',
    amount: q.usdcOut,
    currency: 'USDC',
    time: nowSec(),
    desc: `Top-up ${amountDope} DOPE → ${q.usdcOut.toFixed(2)} USDC`,
    ref: signature,
    meta: { dopeIn: amountDope, quote: q },
  };
  ledger.txs.push(tx);
  return { credited: q.usdcOut, quote: q, tx };
}

export async function spendFromCard(pubkey: string, amountUsdc: number, desc?: string) {
  if (!pubkey) throw new Error('pubkey required');
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) throw new Error('invalid amount');
  const ledger = ensureLedger(pubkey);
  if (ledger.balance < amountUsdc) throw new Error('insufficient balance');
  ledger.balance -= amountUsdc;
  const tx: Tx = { id: makeId(), type: 'spend', amount: amountUsdc, currency: 'USDC', time: nowSec(), desc };
  ledger.txs.push(tx);
  return { remaining: ledger.balance, tx };
}

// For tests/dev reset
export function __resetLedger(pubkey?: string) {
  if (pubkey) ledgers.delete(pubkey); else ledgers.clear();
}

