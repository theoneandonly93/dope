import { PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair } from "@solana/web3.js";
import { getConnection } from "./wallet";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export type BridgeRequest = {
  from: Keypair;
  mint: string;          // SPL mint or wrapped SOL mint
  amount: number;        // UI amount (already decimal adjusted)
  toChain: string;       // target chain identifier (e.g., 'eth')
  toAddress?: string;    // optional target address representation
};

export type BridgeResult = { signature: string; simulated: true };

// Minimal MVP: produce a memo transaction that encodes an intent. Real integration would:
// 1. Wrap SOL if needed
// 2. Call Wormhole token bridge program
// 3. Extract sequence + poll VAA
// 4. Redeem on target chain
export async function bridgeOut(req: BridgeRequest): Promise<BridgeResult> {
  const { from, mint, amount, toChain, toAddress } = req;
  if (amount <= 0) throw new Error("Amount must be positive");
  const conn = getConnection();
  const memoText = JSON.stringify({ v: 1, kind: "bridge-intent", mint, amount, toChain, to: toAddress || null, ts: Date.now() });
  const ix = new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(memoText, "utf8") });
  // Add a 0-lamport SystemProgram transfer to ensure stable ordering (optional)
  const noop = SystemProgram.transfer({ fromPubkey: from.publicKey, toPubkey: from.publicKey, lamports: 0 });
  const tx = new Transaction().add(noop, ix);
  const sig = await conn.sendTransaction(tx, [from]);
  return { signature: sig, simulated: true };
}
