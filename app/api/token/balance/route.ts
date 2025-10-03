export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "../../../../lib/wallet";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Helper to detect native SOL mint alias (Phantom uses wrapped SOL mint). We'll just treat the canonical wrapped SOL mint as native.
const WRAPPED_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pubkeyParam = searchParams.get("pubkey") || "";
    const mintParam = searchParams.get("mint") || "";
    if (!pubkeyParam || !mintParam) {
      return Response.json({ error: "pubkey and mint required" }, { status: 400 });
    }
    const owner = new PublicKey(pubkeyParam);
    const mint = new PublicKey(mintParam);
    const conn = getConnection();

    // If requesting wrapped SOL, return native SOL balance in SOL units
    if (mint.equals(WRAPPED_SOL_MINT)) {
      const lamports = await conn.getBalance(owner, { commitment: "confirmed" });
      return Response.json({ ok: true, balance: lamports / 1_000_000_000 });
    }

    // SPL token path: fetch associated token address and token amount
    try {
      const ata = await getAssociatedTokenAddress(mint, owner, false);
      const info = await conn.getParsedAccountInfo(ata, { commitment: "confirmed" });
      const parsed: any = info.value?.data;
      const tokenAmount = parsed?.parsed?.info?.tokenAmount;
      if (!tokenAmount) {
        return Response.json({ ok: true, balance: 0 });
      }
      const uiAmount = tokenAmount.uiAmount ?? (Number(tokenAmount.amount) / 10 ** Number(tokenAmount.decimals || 0));
      return Response.json({ ok: true, balance: uiAmount });
    } catch (e) {
      // If ATA doesn't exist or parsing failed, treat as zero balance
      return Response.json({ ok: true, balance: 0 });
    }
  } catch (e: any) {
    return Response.json({ error: e?.message || "unexpected error" }, { status: 500 });
  }
}
