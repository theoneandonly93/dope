import { PublicKey } from '@solana/web3.js';
import { getConnection } from './wallet';

// Simple in-memory caches (non-persistent). Could be replaced with IndexedDB/localStorage later.
const decimalsCache = new Map<string, number>();
const metadataFetches = new Map<string, Promise<number>>();

// Common well-known decimals
const WELL_KNOWN: Record<string, number> = {
  'So11111111111111111111111111111111111111112': 9, // wSOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
  'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33': 9, // DOPE
};

export async function getTokenDecimals(mint: string): Promise<number> {
  if (decimalsCache.has(mint)) return decimalsCache.get(mint)!;
  if (WELL_KNOWN[mint] !== undefined) {
    decimalsCache.set(mint, WELL_KNOWN[mint]);
    return WELL_KNOWN[mint];
  }
  if (metadataFetches.has(mint)) return metadataFetches.get(mint)!;
  const conn = getConnection();
  const p = (async () => {
    try {
      const info = await conn.getParsedAccountInfo(new PublicKey(mint));
      // @ts-ignore
      const dec = info?.value?.data?.parsed?.info?.decimals ?? 9;
      decimalsCache.set(mint, dec);
      return dec;
    } catch {
      decimalsCache.set(mint, 9);
      return 9;
    } finally {
      metadataFetches.delete(mint);
    }
  })();
  metadataFetches.set(mint, p);
  return p;
}

export function clearTokenMetadataCache() {
  decimalsCache.clear();
  metadataFetches.clear();
}
