export const dynamic = "force-dynamic";

type Body = {
  inputMint: string;
  outputMint: string;
  amount: number; // UI amount in tokens
  slippageBps?: number;
  userPublicKey: string;
};

const DECIMALS: Record<string, number> = {
  // Common mints
  So11111111111111111111111111111111111111112: 9, // SOL (wSOL mint used by aggregator)
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 6, // USDC
};

function getDecimals(mint: string) {
  return DECIMALS[mint] ?? 9; // default to 9 if unknown
}

export async function POST(req: Request) {
  try {
    const b: Body = await req.json();
    const { inputMint, outputMint, amount, userPublicKey } = b;
    const slippageBps = typeof b.slippageBps === 'number' ? b.slippageBps : 50;
    if (!inputMint || !outputMint || !userPublicKey) return Response.json({ error: 'inputMint/outputMint/userPublicKey required' }, { status: 400 });
    if (!(amount > 0)) return Response.json({ error: 'amount required' }, { status: 400 });

    const inDec = getDecimals(inputMint);
    const ui = Math.max(0, amount);
    const atomic = Math.floor(ui * Math.pow(10, inDec));

    // 1) Quote
    const qUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${atomic}&slippageBps=${slippageBps}`;
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
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 0,
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

