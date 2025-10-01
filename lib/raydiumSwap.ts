import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { buildTransaction } from "@raydium-io/raydium-sdk";


// Fetch Raydium pool list from API
async function fetchRaydiumPools() {
  const res = await fetch("https://api.raydium.io/v2/sdk/liquidity/mainnet.json");
  if (!res.ok) throw new Error("Failed to fetch Raydium pools");
  return await res.json();
}

// Find pool config for a token pair
function findRaydiumPoolConfig(pools, tokenInMint, tokenOutMint) {
  for (const pool of Object.values(pools)) {
    const p = pool as any;
    if (
      (p.tokenMintA === tokenInMint.toBase58() && p.tokenMintB === tokenOutMint.toBase58()) ||
      (p.tokenMintA === tokenOutMint.toBase58() && p.tokenMintB === tokenInMint.toBase58())
    ) {
      return p;
    }
  }
  throw new Error("No Raydium pool found for this token pair");
}

export async function raydiumSwapAnyToken({
  connection,
  ownerKeypair,
  tokenInMint,
  tokenOutMint,
  amountIn,
  slippage = 0.5,
}) {
  const pools = await fetchRaydiumPools();
  const poolConfig = findRaydiumPoolConfig(pools, tokenInMint, tokenOutMint);
  const tokenAccountIn = await getAssociatedTokenAddress(
    new PublicKey(tokenInMint),
    ownerKeypair.publicKey
  );
  const tokenAccountOut = await getAssociatedTokenAddress(
    new PublicKey(tokenOutMint),
    ownerKeypair.publicKey
  );
  // Use Jupiter Aggregator API for SPL token swaps (recommended for Solana)
  // Docs: https://station.jup.ag/docs/apis/swap-api
  const fetch = (globalThis.fetch || require('node-fetch'));
  const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenInMint.toString()}&outputMint=${tokenOutMint.toString()}&amount=${amountIn}&slippageBps=${Math.round(slippage * 100)}`;
  const quoteRes = await fetch(quoteUrl);
  if (!quoteRes.ok) throw new Error('Failed to fetch Jupiter quote');
  const quote = await quoteRes.json();
  if (!quote.routes || quote.routes.length === 0) throw new Error('No swap route found');
  // Build swap transaction
  const swapUrl = 'https://quote-api.jup.ag/v6/swap';
  const swapRes = await fetch(swapUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: quote.routes[0],
      userPublicKey: ownerKeypair.publicKey.toString(),
      wrapUnwrapSol: true,
      feeAccount: null,
    }),
  });
  if (!swapRes.ok) throw new Error('Failed to fetch Jupiter swap transaction');
  const swapTx = await swapRes.json();
  const { Transaction } = await import('@solana/web3.js');
  const tx = Transaction.from(Buffer.from(swapTx.swapTransaction, 'base64'));
  tx.sign(ownerKeypair);
  const txid = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(txid);
  return txid;
}
