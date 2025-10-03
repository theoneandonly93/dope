export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { PublicKey, Connection } from "@solana/web3.js";
import { getConnection } from "../../../../../lib/wallet";

// Wrapped SOL canonical mint
const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

// Minimal built-in token metadata (extend as needed or wire to tokenlist.json)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; logo?: string }> = {
	[WRAPPED_SOL_MINT]: { symbol: "SOL", name: "Solana", logo: "/sol.png" },
	FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33: { symbol: "DOPE", name: "Dope", logo: "/logo-192.png" },
	"4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts": { symbol: "DWT", name: "Dope Wallet Token", logo: "/logo-192.png" },
};

type TokenBalance = {
	mint: string;
	amount: string;        // raw integer as string
	uiAmount: number;      // decimal adjusted
	decimals: number;
	symbol?: string;
	name?: string;
	logo?: string;
};

export async function GET(req: NextRequest, ctx: { params: { pubkey: string } }) {
	try {
		const ownerStr = ctx?.params?.pubkey;
		if (!ownerStr) return Response.json({ error: "pubkey required" }, { status: 400 });
		let owner: PublicKey;
		try { owner = new PublicKey(ownerStr); } catch { return Response.json({ error: "invalid pubkey" }, { status: 400 }); }

		const conn: Connection = getConnection();
		// Native SOL balance
		let lamports = 0;
		try { lamports = await conn.getBalance(owner, { commitment: "confirmed" }); } catch {}

		// Get all parsed token accounts
		let tokens: TokenBalance[] = [];
		try {
					// getParsedTokenAccountsByOwner(owner, filter, commitment?) - pass commitment as string
					const parsed = await conn.getParsedTokenAccountsByOwner(
						owner,
						{ programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") },
						"confirmed"
					);
			for (const acct of parsed.value) {
				const info: any = acct.account.data?.parsed?.info;
				const tokenAmount = info?.tokenAmount;
				const mint: string | undefined = info?.mint;
				if (!mint || !tokenAmount) continue;
				const decimals = Number(tokenAmount.decimals) || 0;
				const raw = tokenAmount.amount as string;
				let uiAmount: number = 0;
				if (typeof tokenAmount.uiAmount === 'number') uiAmount = tokenAmount.uiAmount;
				else uiAmount = Number(raw) / Math.pow(10, decimals);
				const meta = KNOWN_TOKENS[mint];
				tokens.push({ mint, amount: raw, uiAmount, decimals, symbol: meta?.symbol, name: meta?.name, logo: meta?.logo });
			}
			// Deduplicate mints by summing (should rarely be needed if consolidation done) 
			const agg: Record<string, TokenBalance> = {};
			for (const t of tokens) {
				if (!agg[t.mint]) agg[t.mint] = { ...t };
				else {
					agg[t.mint].uiAmount += t.uiAmount;
					// Sum raw amounts as BigInt to avoid precision issues
					try {
						const a = BigInt(agg[t.mint].amount);
						const b = BigInt(t.amount);
						agg[t.mint].amount = (a + b).toString();
					} catch {}
				}
			}
			tokens = Object.values(agg).sort((a, b) => (b.uiAmount - a.uiAmount));
		} catch (e) {
			// swallow; tokens array stays empty on failure
		}

		return Response.json({
			ok: true,
			native: { lamports, sol: lamports / 1_000_000_000 },
			tokens,
			fetchedAt: Date.now()
		});
	} catch (e: any) {
		return Response.json({ error: e?.message || 'unexpected error' }, { status: 500 });
	}
}