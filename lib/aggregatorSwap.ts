import { PublicKey, VersionedTransaction, Transaction } from "@solana/web3.js";
import { getQuote as pumpQuote, executeSwap as pumpExecute, PumpQuoteOptions } from "./pumpfunSwap";
import { getConnection } from "./wallet";
import { getTokenDecimals } from "./tokenMetadataCache";

export type AggregatorSource = "pumpfun" | "jupiter:raydium" | "jupiter";

export type AggregatedQuote = {
  source: AggregatorSource;
  inMint: string;
  outMint: string;
  inAmountUi: number;
  outAmountAtomic: number; // denominated in out token decimals
  priceImpactPct?: number;
  // For Jupiter execution we might need to recall restriction used
  restrictDexes?: string;
};

export type AggregateQuoteOpts = {
  slippagePct?: number;
  slippageBps?: number;
  priorityFeeMicrolamports?: number;
  tipSol?: number;
};

async function jupiterQuote({ inMint, outMint, amountAtomic, restrictDexes }: { inMint: string; outMint: string; amountAtomic: number; restrictDexes?: string; }) {
  const qs = new URLSearchParams({ in: inMint, out: outMint, amountAtomic: String(amountAtomic), swapMode: "ExactIn" });
  if (restrictDexes) qs.set("restrictDexes", restrictDexes);
  try {
    const r = await fetch(`/api/swap/quote?${qs.toString()}`, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok || !j || !j.outAmount) return null;
    return j as any;
  } catch {
    return null;
  }
}

export async function getAggregatedQuote(inMint: string, outMint: string, amountUi: number, opts?: AggregateQuoteOpts): Promise<{ best: AggregatedQuote | null; candidates: AggregatedQuote[]; }>{
  const [inDec, outDec] = await Promise.all([
    getTokenDecimals(inMint).catch(() => 9),
    getTokenDecimals(outMint).catch(() => 9),
  ]);
  const amountAtomic = Math.floor(amountUi * Math.pow(10, inDec));
  if (!(amountAtomic > 0)) return { best: null, candidates: [] };

  const candidates: AggregatedQuote[] = [];
  // 1) Pump.fun
  try {
    const q = await pumpQuote(inMint, outMint, amountUi, {
      slippagePct: opts?.slippagePct,
      slippageBps: opts?.slippageBps,
      priorityFeeMicrolamports: opts?.priorityFeeMicrolamports,
      tipSol: opts?.tipSol,
    } as PumpQuoteOptions);
    if (q && (q.outAmountAtomic || q.outAmount)) {
      const out = Number(q.outAmountAtomic ?? q.outAmount) || 0;
      const pi = typeof q.priceImpactPct === 'number' ? q.priceImpactPct : (typeof q.priceImpact === 'number' ? q.priceImpact : undefined);
      candidates.push({ source: "pumpfun", inMint, outMint, inAmountUi: amountUi, outAmountAtomic: out, priceImpactPct: pi });
    }
  } catch {}

  // 2) Jupiter (Raydium-only)
  try {
    const jq = await jupiterQuote({ inMint, outMint, amountAtomic, restrictDexes: "raydium" });
    if (jq && jq.outAmount) {
      candidates.push({ source: "jupiter:raydium", inMint, outMint, inAmountUi: amountUi, outAmountAtomic: Number(jq.outAmount) || 0, priceImpactPct: jq.priceImpactPct, restrictDexes: "raydium" });
    }
  } catch {}

  // 3) Jupiter (any)
  try {
    const jq = await jupiterQuote({ inMint, outMint, amountAtomic });
    if (jq && jq.outAmount) {
      candidates.push({ source: "jupiter", inMint, outMint, inAmountUi: amountUi, outAmountAtomic: Number(jq.outAmount) || 0, priceImpactPct: jq.priceImpactPct });
    }
  } catch {}

  if (candidates.length === 0) return { best: null, candidates: [] };
  // Choose the highest outAmountAtomic
  const best = candidates.slice().sort((a, b) => b.outAmountAtomic - a.outAmountAtomic)[0];
  return { best, candidates };
}

type WalletLike = { publicKey: PublicKey; signTransaction?: (tx: any) => Promise<any> };

export async function executeAggregatedSwap({ signer, fromMint, toMint, amountUi, opts }: { signer: WalletLike; fromMint: string; toMint: string; amountUi: number; opts?: AggregateQuoteOpts; }): Promise<string> {
  const { best } = await getAggregatedQuote(fromMint, toMint, amountUi, opts);
  if (!best) throw new Error("No route available");
  if (best.source === "pumpfun") {
    return await pumpExecute(signer, fromMint, toMint, amountUi, opts as any);
  }
  // Jupiter paths: ask server to prepare swap, then sign and send
  const inDec = await getTokenDecimals(fromMint).catch(()=>9);
  const amountAtomic = Math.floor(amountUi * Math.pow(10, inDec));
  const body: any = {
    inputMint: fromMint,
    outputMint: toMint,
    amountAtomic,
    slippageBps: opts?.slippageBps ?? (opts?.slippagePct != null ? Math.round(opts.slippagePct * 100) : 50),
    userPublicKey: signer.publicKey.toString(),
    swapMode: 'ExactIn',
  };
  if (best.restrictDexes) body.restrictDexes = best.restrictDexes;

  const r = await fetch('/api/swap/prepare', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'Prepare failed');
  const b64 = j?.swapTransaction as string;
  if (!b64) throw new Error('No transaction');
  const raw = Buffer.from(b64, 'base64');
  let tx: VersionedTransaction | Transaction;
  try {
    tx = VersionedTransaction.deserialize(raw);
  } catch {
    tx = Transaction.from(raw);
  }
  const signed = await signer.signTransaction?.(tx) as any;
  const conn = getConnection();
  const sig = await conn.sendRawTransaction((signed || (tx as any)).serialize());
  await conn.confirmTransaction(sig, 'confirmed');
  return sig;
}
