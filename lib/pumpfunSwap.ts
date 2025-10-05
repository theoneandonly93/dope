import { Connection, PublicKey, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getRpcEndpoints } from "./wallet";

const PUMP_FUN_BASE = "https://pumpportal.fun/api"; // base; quote assumed at /swap/quote

function getRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    (Array.isArray(getRpcEndpoints()) && getRpcEndpoints()[0]) ||
    "https://api.mainnet-beta.solana.com"
  );
}

export async function getQuote(fromMint: string, toMint: string, amountIn: number) {
  try {
    const url = `${PUMP_FUN_BASE}/swap/quote?from=${encodeURIComponent(fromMint)}&to=${encodeURIComponent(toMint)}&amount=${encodeURIComponent(String(amountIn))}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("Pump.fun quote error:", e);
    return null;
  }
}

type WalletLike = {
  publicKey: PublicKey;
  signTransaction?: (tx: any) => Promise<any>;
};

// Execute a swap using either a wallet adapter (with signTransaction) or a raw Keypair
export async function executeSwap(
  signer: WalletLike | Keypair,
  fromMint: string,
  toMint: string,
  amount: number
) {
  const conn = new Connection(getRpcUrl(), { commitment: "confirmed" } as any);
  const quote = await getQuote(fromMint, toMint, amount);
  if (!quote || !(quote.tx || quote.swapTransaction || quote.transaction)) throw new Error("No transaction from router");
  const b64 = quote.tx || quote.swapTransaction || quote.transaction;
  const raw = Buffer.from(b64, "base64");
  let isV0 = true;
  let vtx: VersionedTransaction | null = null;
  let leg: Transaction | null = null;
  try {
    vtx = VersionedTransaction.deserialize(raw);
  } catch {
    isV0 = false;
    leg = Transaction.from(raw);
  }

  // Ensure blockhash where needed
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  if (isV0 && vtx) {
    // usually already compiled; proceed
  } else if (leg) {
    leg.recentBlockhash = blockhash;
  }

  const hasAdapter = (signer as WalletLike).signTransaction && (signer as WalletLike).publicKey;
  let sig: string;
  if (hasAdapter) {
    const wallet = signer as WalletLike;
    if (isV0 && vtx) {
      const signed = await wallet.signTransaction!(vtx);
      sig = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: false, maxRetries: 3 });
    } else if (leg) {
      leg.feePayer = wallet.publicKey;
      const signed = await wallet.signTransaction!(leg);
      sig = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: false, maxRetries: 3 });
    } else {
      throw new Error("Unsupported transaction format");
    }
  } else {
    const kp = signer as Keypair;
    if (isV0 && vtx) {
      vtx.sign([kp]);
      sig = await conn.sendRawTransaction(vtx.serialize(), { skipPreflight: false, maxRetries: 3 });
    } else if (leg) {
      leg.sign(kp);
      sig = await conn.sendRawTransaction(leg.serialize(), { skipPreflight: false, maxRetries: 3 });
    } else {
      throw new Error("Unsupported transaction format");
    }
  }
  await conn.confirmTransaction({ signature: sig, lastValidBlockHeight, blockhash }, "confirmed");
  return sig;
}
