// Simple market data fetcher for a limited set of tokens.
// For production you'd likely expand mapping or query a unified endpoint.

export interface MarketDatum {
  mint: string;
  price: number | null;
  change24h: number | null; // percent change
  volume24h: number | null; // USD volume
  marketCap: number | null;
  fetchedAt: number;
  sparkline?: Array<{ t: number; p: number }>; // recent price points (timestamp, price)
}

// Mapping from mint to CoinGecko id with env overrides for tokens that receive distinct listings later.
// Provide NEXT_PUBLIC_DWT_COINGECKO_ID and NEXT_PUBLIC_JBAG_COINGECKO_ID to override placeholders when available.
const MINT_TO_COINGECKO: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'solana',
  'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33': process.env.NEXT_PUBLIC_DOPE_COINGECKO_ID || 'dope',
  '4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts': process.env.NEXT_PUBLIC_DWT_COINGECKO_ID || (process.env.NEXT_PUBLIC_DOPE_COINGECKO_ID || 'dope'),
  '5ncWhK2wWS2UzmhkVYaEJ5ESENcoeMCTsvEXcmQepump': process.env.NEXT_PUBLIC_JBAG_COINGECKO_ID || (process.env.NEXT_PUBLIC_DOPE_COINGECKO_ID || 'dope'),
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binancecoin'
};

// Export a safe getter for server routes
export function mintToCoinGeckoId(mint: string): string | null {
  return MINT_TO_COINGECKO[mint] || null;
}

// In-memory cache (per serverless runtime instance / client session)
// Keyed by joined sorted ids for bulk market fetch and by coin id for sparkline.
const marketCache: Record<string, { data: any; ts: number }> = {};
const sparklineCache: Record<string, { points: Array<{ t:number; p:number }>; ts: number }> = {};

const MARKET_TTL_MS = 60_000; // 1 minute
const SPARKLINE_TTL_MS = 5 * 60_000; // 5 minutes

async function fetchSparkline(id: string): Promise<Array<{ t:number; p:number }>> {
  const cached = sparklineCache[id];
  if (cached && Date.now() - cached.ts < SPARKLINE_TTL_MS) return cached.points;
  try {
    // 1 day hourly
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1&interval=hourly`;
    const r = await fetch(url, { cache: 'no-store' });
    const j = await r.json();
    const pts = Array.isArray(j?.prices) ? j.prices.map((p:any)=>({ t: p[0], p: p[1] })) : [];
    sparklineCache[id] = { points: pts, ts: Date.now() };
    return pts;
  } catch {
    return [];
  }
}

export async function fetchMarketData(mints: string[], withSparkline = false, opts: { force?: boolean; useProxy?: boolean } = {}): Promise<MarketDatum[]> {
  const ids = Array.from(new Set(mints.map(m => MINT_TO_COINGECKO[m]).filter(Boolean)));
  if (ids.length === 0) return [];
  const key = ids.sort().join('|');
  let json: any[] = [];
  const now = Date.now();
  const cached = marketCache[key];
  if (!opts.force && cached && now - cached.ts < MARKET_TTL_MS) {
    json = cached.data;
  } else {
    try {
      if (opts.useProxy) {
        const url = `/api/market?ids=${ids.join(',')}${withSparkline ? '&spark=1' : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const proxy = await res.json();
        json = proxy?.data || [];
      } else {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&price_change_percentage=24h`;
        const res = await fetch(url, { cache: 'no-store' });
        json = await res.json();
      }
      marketCache[key] = { data: json, ts: now };
    } catch {
      // fallback: keep json empty
    }
  }
  const results: MarketDatum[] = [];
  for (const m of mints) {
    const id = MINT_TO_COINGECKO[m];
    const entry = json.find((j: any) => j.id === id) || {};
    const base: MarketDatum = {
      mint: m,
      price: typeof entry.current_price === 'number' ? entry.current_price : null,
      change24h: typeof entry.price_change_percentage_24h === 'number' ? entry.price_change_percentage_24h : null,
      volume24h: typeof entry.total_volume === 'number' ? entry.total_volume : null,
      marketCap: typeof entry.market_cap === 'number' ? entry.market_cap : null,
      fetchedAt: now
    };
    if (withSparkline && id) {
      // If using proxy, sparkline may already be present under _spark
      if (opts.useProxy) {
        const ent = (json as any[]).find(e => e.id === id);
        if (ent?._spark) {
          base.sparkline = ent._spark.map((p:any)=>({ t: p[0], p: p[1] }));
        } else {
          base.sparkline = await fetchSparkline(id);
        }
      } else {
        base.sparkline = await fetchSparkline(id);
      }
    }
    results.push(base);
  }
  return results;
}

// Debounce helper (client side usage)
export function debounce<T extends (...args:any[])=>any>(fn: T, delay=300) {
  let to: any;
  return (...args: Parameters<T>) => {
    clearTimeout(to);
    to = setTimeout(()=>fn(...args), delay);
  };
}

// Helper to clear caches (could be invoked from dev console)
export function _clearMarketCaches() {
  Object.keys(marketCache).forEach(k => delete marketCache[k]);
  Object.keys(sparklineCache).forEach(k => delete sparklineCache[k]);
}
