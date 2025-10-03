export const dynamic = "force-dynamic";

type Body = {
  inputMint: string;
  outputMint: string;
  amount?: number; // UI amount (optional if amountAtomic provided)
  amountAtomic?: number; // direct atomic units
  slippageBps?: number;
  userPublicKey: string;
  swapMode?: 'ExactIn' | 'ExactOut';
  wrapAndUnwrapSol?: boolean;
  // Advanced routing params
  onlyDirectRoutes?: boolean | string;
  maxAccounts?: number | string;
  restrictDexes?: string; // comma-separated
  // Platform fee
  platformFeeBps?: number;
  feeAccount?: string;
};

const DECIMALS: Record<string, number> = {
  // Common mints
  So11111111111111111111111111111111111111112: 9, // SOL (wSOL mint used by aggregator)
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 6, // USDC
};

function getDecimals(mint: string) {
  return DECIMALS[mint] ?? 9; // default to 9 if unknown
}

import { rateLimit } from '../../../../lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = (req.headers as any).get?.('x-forwarded-for') || 'anon';
    if (!rateLimit(`swapp:${ip}`, { capacity: 20, refillPerSec: 0.5 })) {
      return Response.json({ error: 'rate limit' }, { status: 429 });
    }
    const b: Body = await req.json();
  const { inputMint, outputMint, amount, amountAtomic, userPublicKey } = b;
    const slippageBps = typeof b.slippageBps === 'number' ? b.slippageBps : 50;
    const swapMode = (b.swapMode || 'ExactIn') as 'ExactIn' | 'ExactOut';
    const wrapAndUnwrapSol = b.wrapAndUnwrapSol !== false; // default true
    if (!inputMint || !outputMint || !userPublicKey) return Response.json({ error: 'inputMint/outputMint/userPublicKey required' }, { status: 400 });
  if (!(amountAtomic > 0) && !(amount && amount > 0)) return Response.json({ error: 'amount or amountAtomic required' }, { status: 400 });

    const inDec = getDecimals(inputMint);
    const outDec = getDecimals(outputMint);
  const ui = amountAtomic
      ? (swapMode === 'ExactOut' ? (amountAtomic / Math.pow(10, outDec)) : (amountAtomic / Math.pow(10, inDec)))
      : Math.max(0, amount || 0);
  const atomic = amountAtomic
      ? Math.floor(amountAtomic)
      : Math.floor(ui * Math.pow(10, swapMode === 'ExactOut' ? outDec : inDec));

    // 1) Quote
    const qParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount: String(atomic),
      slippageBps: String(slippageBps),
      swapMode,
    });
    if (b.onlyDirectRoutes != null) qParams.set('onlyDirectRoutes', String(b.onlyDirectRoutes));
    if (b.maxAccounts != null) qParams.set('maxAccounts', String(b.maxAccounts));
    if (b.restrictDexes != null) qParams.set('restrictDexes', String(b.restrictDexes));
    const qUrl = `https://quote-api.jup.ag/v6/quote?${qParams.toString()}`;
    const qr = await fetch(qUrl, { cache: 'no-store' });
    const quote = await qr.json();
    if (!qr.ok || !quote?.data || !Array.isArray(quote.data) || quote.data.length === 0) {
      return Response.json({ error: quote?.error || 'no route found' }, { status: 400 });
    }
    const route = quote.data[0];

    // 2) Swap transaction
    const sr = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: route,
        userPublicKey,
        wrapAndUnwrapSol,
        slippageBps,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 0,
        ...(b.platformFeeBps && b.feeAccount ? { platformFeeBps: b.platformFeeBps, feeAccount: b.feeAccount } : {}),
      }),
    });
    const swap = await sr.json();
    if (!sr.ok) return Response.json({ error: swap?.error || `swap failed ${sr.status}` }, { status: 400 });
    const tx = swap?.swapTransaction;
    if (!tx) return Response.json({ error: 'no swapTransaction' }, { status: 400 });
    return Response.json({ swapTransaction: tx, route });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'prepare failed' }, { status: 500 });
  }
}

