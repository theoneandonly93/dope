export type FairbrixStats = {
  unpaid: number;
  totalPayouts: number;
  workers: number;
  updated: number;
};

export async function fetchFairbrixStats(addr: string): Promise<FairbrixStats | null> {
  if (!addr) return null;
  try {
    const r = await fetch(`https://fairbrixscan.com/api/address/${addr}`, { cache: 'no-store' });
    const j = await r.json();
    const stats: FairbrixStats = {
      unpaid: Number(j?.unpaid) || 0,
      totalPayouts: Number(j?.totalPayouts) || 0,
      workers: Array.isArray(j?.workers) ? j.workers.length : Number(j?.workers) || 0,
      updated: Date.now(),
    };
    return stats;
  } catch {
    return null;
  }
}

const KEY = 'fairbrix:payout_address';

export function getStoredFairbrixAddress(): string | null {
  try { if (typeof window === 'undefined') return null; return localStorage.getItem(KEY); } catch { return null; }
}
export function setStoredFairbrixAddress(addr: string) {
  try { if (typeof window === 'undefined') return; localStorage.setItem(KEY, addr); } catch {}
}
