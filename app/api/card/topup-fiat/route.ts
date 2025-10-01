export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { topupCardFiat } from "../../../../backend/card-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pubkey = String(body?.pubkey || "");
    const amountUsd = Number(body?.amountUsd || 0);
    const provider = (String(body?.provider || "").toLowerCase() === 'apple') ? 'apple' : 'google';
    const token = body?.token ? String(body.token) : undefined;
    if (!pubkey) return Response.json({ error: "pubkey required" }, { status: 400 });
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) return Response.json({ error: "invalid amount" }, { status: 400 });
    const res = await topupCardFiat(pubkey, amountUsd, provider, token);
    return Response.json({ ok: true, ...res });
  } catch (e: any) {
    return Response.json({ error: e?.message || "fiat topup failed" }, { status: 500 });
  }
}

