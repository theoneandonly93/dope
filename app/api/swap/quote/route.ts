export const dynamic = "force-dynamic";

import { rateLimit } from '../../../../lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = (req.headers as any).get?.('x-forwarded-for') || 'anon';
    if (!rateLimit(`swapq:${ip}`, { capacity: 50, refillPerSec: 1 })) {
      return Response.json({ error: 'rate limit' }, { status: 429 });
    }
    const inputMint = searchParams.get('in');
    const outputMint = searchParams.get('out');
  const amountAtomicStr = searchParams.get('amountAtomic');
  const amountStr = searchParams.get('amount') || '0';
  const amount = Number(amountStr);
    if (!inputMint || !outputMint) return Response.json({ error: 'in/out required' }, { status: 400 });
    // Accept either amountAtomic or amount (UI amount)
    const atomic = amountAtomicStr ? Number(amountAtomicStr) : Math.floor(amount * 10 ** 9);
    if (!(atomic > 0)) return Response.json({ error: 'amount required' }, { status: 400 });
  if (!(atomic > 0)) return Response.json({ error: 'atomic amount invalid' }, { status: 400 });
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(String(atomic))}`;
    const r = await fetch(url, { cache: 'no-store' });
    const j = await r.json();
    if (!r.ok) return Response.json({ error: j?.error || `HTTP ${r.status}` }, { status: r.status });
    const best = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : null;
    return Response.json(best || { ok: true, empty: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'quote failed' }, { status: 500 });
  }
}

