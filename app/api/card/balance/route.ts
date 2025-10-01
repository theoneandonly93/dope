export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getCardBalance } from "../../../../backend/card-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pubkey = String(searchParams.get('pubkey') || '');
  if (!pubkey) return Response.json({ error: 'pubkey required' }, { status: 400 });
  const balance = await getCardBalance(pubkey);
  return Response.json({ ok: true, balance });
}
