export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get('in');
    const outputMint = searchParams.get('out');
    const amountStr = searchParams.get('amount') || '0';
    const amount = Number(amountStr);
    if (!inputMint || !outputMint) return Response.json({ error: 'in/out required' }, { status: 400 });
    if (!(amount > 0)) return Response.json({ error: 'amount required' }, { status: 400 });

    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(inputMint)}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(String(Math.floor(amount * 10 ** 9)))}`;
    const r = await fetch(url, { cache: 'no-store' });
    const j = await r.json();
    if (!r.ok) return Response.json({ error: j?.error || `HTTP ${r.status}` }, { status: r.status });
    const best = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : null;
    return Response.json(best || { ok: true, empty: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'quote failed' }, { status: 500 });
  }
}

