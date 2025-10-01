
import { PublicKey, Keypair, Connection, Transaction } from "@solana/web3.js";

// Jupiter API endpoints
const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";

export type SwapQuote = {
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  routes: any[];
  mintIn: string;
  mintOut: string;
};

/**
 * Get a swap quote for SOL <-> SPL or SPL <-> SPL
 * @param {string} inputMint - Mint address of input token (SOL: So11111111111111111111111111111111111111112)
 * @param {string} outputMint - Mint address of output token
 * @param {number} amount - Amount in smallest units (lamports or token decimals)
 * @param {number} slippageBps - Slippage in basis points (default 50 = 0.5%)
 */
export async function getQuote(inputMint: string, outputMint: string, amount: number, slippageBps = 50): Promise<SwapQuote> {
  const url = `${JUPITER_QUOTE_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Jupiter quote");
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error("No swap route found");
  return {
    inAmount: data.inAmount,
    outAmount: data.outAmount,
    priceImpactPct: data.priceImpactPct,
    routes: data.routes,
    mintIn: inputMint,
    mintOut: outputMint,
  };
}

/**
 * Execute a swap using Jupiter API
 * @param {Connection} connection - Solana connection
 * @param {Keypair} ownerKeypair - User's wallet keypair
 * @param {SwapQuote} quote - Quote object from getQuote
 * @returns {Promise<string>} - Transaction signature
 */
export async function swap({ connection, ownerKeypair, quote }: {
  connection: Connection,
  ownerKeypair: Keypair,
  quote: SwapQuote,
}): Promise<string> {
  const swapRes = await fetch(JUPITER_SWAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route: quote.routes[0],
      userPublicKey: ownerKeypair.publicKey.toString(),
      wrapUnwrapSol: true,
      feeAccount: null,
    }),
  });
  if (!swapRes.ok) throw new Error("Failed to fetch Jupiter swap transaction");
  const swapTx = await swapRes.json();
  const tx = Transaction.from(Buffer.from(swapTx.swapTransaction, "base64"));
  tx.sign(ownerKeypair);
  const txid = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(txid);
  return txid;
}

// Utility: SOL mint address
export const SOL_MINT = "So11111111111111111111111111111111111111112";

// Example usage:
// const quote = await getQuote(SOL_MINT, USDC_MINT, amountInLamports);
// const txid = await swap({ connection, ownerKeypair, quote });
