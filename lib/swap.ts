// Swap helper (stub): DOPE -> USDC quoting and placeholders for execution

export const DOPE_MINT = (process.env.NEXT_PUBLIC_DOPE_MINT || 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33');
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export type SwapQuote = { dopeIn: number; usdcOut: number; price: number; fee: number; slippage: number };

export function quoteDopeToUsdc(amountDope: number, opts?: { feeBps?: number; slippageBps?: number }): SwapQuote {
  const feeBps = opts?.feeBps ?? 50; // 0.5%
  const slippageBps = opts?.slippageBps ?? 50; // 0.5%
  const price = 1.0; // stub rate
  const gross = amountDope * price;
  const fee = (gross * feeBps) / 10_000;
  const slippage = (gross * slippageBps) / 10_000;
  const usdcOut = Math.max(0, gross - fee - slippage);
  return { dopeIn: amountDope, usdcOut, price, fee, slippage };
}

export async function executeSwapDopeToUsdc(dopeAmount: number): Promise<{ usdcOut: number; signature: string }>
{
  // Stub execution: return quote and a fake signature
  const q = quoteDopeToUsdc(dopeAmount);
  const sig = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return { usdcOut: q.usdcOut, signature: sig };
}
