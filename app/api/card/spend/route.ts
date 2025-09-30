export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { spendFromCard } from "../../../../backend/card-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pubkey = String(body?.pubkey || "");
    const amount = Number(body?.amount || 0);
    const desc = body?.desc ? String(body.desc) : undefined;
    if (!pubkey) return Response.json({ error: "pubkey required" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "invalid amount" }, { status: 400 });
    const res = await spendFromCard(pubkey, amount, desc);
    return Response.json({ ok: true, ...res });
  } catch (e: any) {
    return Response.json({ error: e?.message || "spend failed" }, { status: 500 });
  }
}

