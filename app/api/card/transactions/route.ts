export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { listCardTransactions } from "../../../../backend/card-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pubkey = String(searchParams.get('pubkey') || '');
  if (!pubkey) return Response.json({ error: 'pubkey required' }, { status: 400 });
  const txs = await listCardTransactions(pubkey);
  return Response.json({ ok: true, txs });
}
