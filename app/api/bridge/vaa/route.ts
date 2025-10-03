import { NextResponse } from 'next/server';
import { rateLimit } from '../../../../lib/rateLimit';

// Guardian REST API base (mainnet). Allow override via env for self-hosted guardians or testing.
const GUARDIAN_API_BASE = process.env.GUARDIAN_API_BASE || 'https://wormhole-v2-mainnet-api.certus.one';

// GET /api/bridge/vaa?chain=<chainId>&emitter=<emitterAddress>&sequence=<sequence>
// Returns
//  { pending: true } while VAA not yet available
//  { pending: false, vaa: base64String } once available
//  { error: string } on unrecoverable failure
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = (req.headers as any).get?.('x-forwarded-for') || 'anon';
  if (!rateLimit(`vaa:${ip}`, { capacity: 30, refillPerSec: 0.5 })) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  const chain = searchParams.get('chain');
  const emitter = searchParams.get('emitter');
  const sequence = searchParams.get('sequence');

  if (!chain || !emitter || !sequence) {
    return NextResponse.json({ error: 'Missing chain, emitter, or sequence' }, { status: 400 });
  }

  // Basic validation (numbers & hex)
  if (!/^\d+$/.test(chain)) {
    return NextResponse.json({ error: 'Invalid chain id' }, { status: 400 });
  }
  if (!/^[0-9a-fA-F]+$/.test(emitter)) {
    return NextResponse.json({ error: 'Invalid emitter address format (expected hex)' }, { status: 400 });
  }
  if (!/^\d+$/.test(sequence)) {
    return NextResponse.json({ error: 'Invalid sequence' }, { status: 400 });
  }

  const url = `${GUARDIAN_API_BASE.replace(/\/$/, '')}/v1/signed_vaa/${chain}/${emitter}/${sequence}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) {
      return NextResponse.json({ pending: true }, { status: 200 });
    }
    if (!res.ok) {
      return NextResponse.json({ pending: true }, { status: 200 });
    }
    // Expected response body shape: { vaaBytes: base64 }
    const json = await res.json();
    const vaa = json.vaaBytes || json.vaa || null;
    if (!vaa) {
      return NextResponse.json({ pending: true }, { status: 200 });
    }
    return NextResponse.json({ pending: false, vaa });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Guardian fetch failed' }, { status: 500 });
  }
}
