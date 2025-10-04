export const dynamic = "force-dynamic";

import { rateLimit } from '../../../../lib/rateLimit';
import { PublicKey } from '@solana/web3.js';

function normalizeMint(m: string): string {
  const s = m.trim().toLowerCase();
  if (s === 'sol' || s === 'wsol') return 'So11111111111111111111111111111111111111112';
  if (s === 'btc') return '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'; // renBTC (legacy) on Solana
  if (s === 'eth') return '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8'; // soETH (Wormhole)
  return m;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = (req.headers as any).get?.('x-forwarded-for') || 'anon';
    if (!rateLimit(`swapq:${ip}`, { capacity: 50, refillPerSec: 1 })) {
      return Response.json({ error: 'rate limit' }, { status: 429 });
    }
  let inputMint = searchParams.get('in');
  let outputMint = searchParams.get('out');
  const amountAtomicStr = searchParams.get('amountAtomic');
  const amountStr = searchParams.get('amount') || '0';
  const amount = Number(amountStr);
  const swapMode = (searchParams.get('swapMode') || 'ExactIn') as 'ExactIn'|'ExactOut';
  const onlyDirectRoutes = searchParams.get('onlyDirectRoutes');
  const maxAccounts = searchParams.get('maxAccounts');
  const restrictDexes = searchParams.get('restrictDexes');
  if (!inputMint || !outputMint) return Response.json({ error: 'in/out required' }, { status: 400 });
  inputMint = normalizeMint(inputMint);
  outputMint = normalizeMint(outputMint);
  // Validate SPL mint addresses early for clearer UX
  try { new PublicKey(inputMint); } catch { return Response.json({ error: 'invalid input mint address' }, { status: 400 }); }
  try { new PublicKey(outputMint); } catch { return Response.json({ error: 'invalid output mint address' }, { status: 400 }); }
    // Accept either amountAtomic or amount (UI amount). Caller should scale correctly for ExactOut.
    const atomic = amountAtomicStr ? Number(amountAtomicStr) : Math.floor(amount * 10 ** 9);
    if (!(atomic > 0)) return Response.json({ error: 'amount required' }, { status: 400 });
  if (!(atomic > 0)) return Response.json({ error: 'atomic amount invalid' }, { status: 400 });
  const qp = new URLSearchParams({ inputMint, outputMint, amount: String(atomic), swapMode });
  if (onlyDirectRoutes != null) qp.set('onlyDirectRoutes', onlyDirectRoutes);
  if (maxAccounts != null) qp.set('maxAccounts', maxAccounts);
  if (restrictDexes != null) qp.set('restrictDexes', restrictDexes);
  const url = `https://quote-api.jup.ag/v6/quote?${qp.toString()}`;
    let r = await fetch(url, { cache: 'no-store' });
    let j = await r.json();
    if (!r.ok) return Response.json({ error: j?.error || j?.message || `HTTP ${r.status}` }, { status: r.status });
    let best = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : null;
    // If user restricted DEXes (e.g., Pump) and no route found, retry without restriction as a fallback
    if (!best && (onlyDirectRoutes != null || maxAccounts != null || restrictDexes != null)) {
      const qp2 = new URLSearchParams({ inputMint, outputMint, amount: String(atomic), swapMode });
      // keep other general knobs but drop restrictDexes to broaden search
      if (onlyDirectRoutes != null) qp2.set('onlyDirectRoutes', onlyDirectRoutes);
      if (maxAccounts != null) qp2.set('maxAccounts', maxAccounts);
      const url2 = `https://quote-api.jup.ag/v6/quote?${qp2.toString()}`;
      r = await fetch(url2, { cache: 'no-store' });
      j = await r.json();
      if (r.ok) best = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : null;
    }
    return Response.json(best || { ok: true, empty: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'quote failed' }, { status: 500 });
  }
}

