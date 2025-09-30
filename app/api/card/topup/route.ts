export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { topupCard, quoteDopeToUsdc } from "../../../../backend/card-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pubkey = String(body?.pubkey || "");
    const amount = Number(body?.amount || 0);
    const signature = body?.signature ? String(body.signature) : undefined;
    if (!pubkey) return Response.json({ error: "pubkey required" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "invalid amount" }, { status: 400 });
    const res = await topupCard(pubkey, amount, signature);
    return Response.json({ ok: true, ...res });
  } catch (e: any) {
    return Response.json({ error: e?.message || "topup failed" }, { status: 500 });
  }
}

export async function GET() {
  // Allow simple quoting via query: ?amount=1.23
  const amount = 0;
  const q = quoteDopeToUsdc(amount);
  return Response.json({ ok: true, quote: q });
}

