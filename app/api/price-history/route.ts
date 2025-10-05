import { NextRequest, NextResponse } from 'next/server';
import { mintToCoinGeckoId } from '../../../lib/marketData';

// Simple price history API using CoinGecko market_chart as a backend for known mints.
// Query: /api/price-history?mint=...&tf=1D|1W|1M|YTD|ALL
// Returns: { timestamps: number[], prices: number[] }

const TF_TO_PARAMS: Record<string, { days: string; interval?: string }> = {
  '1H': { days: '1', interval: 'minutely' },
  '1D': { days: '1', interval: 'hourly' },
  '1W': { days: '7', interval: 'hourly' },
  '1M': { days: '30', interval: 'daily' },
  'YTD': { days: '365', interval: 'daily' },
  'ALL': { days: 'max' },
};

async function fetchWithRetry(url: string, attempts = 3, backoff = 400) {
  let lastErr: any = null;
  for (let i=0;i<attempts;i++) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('upstream '+r.status);
      return await r.json();
    } catch (e) {
      lastErr = e;
      await new Promise(res => setTimeout(res, backoff * (i+1)));
    }
  }
  throw lastErr || new Error('fetch failed');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = (searchParams.get('mint') || '').trim();
    const tf = (searchParams.get('tf') || '1D').toUpperCase();
    if (!mint) return NextResponse.json({ error: 'mint required' }, { status: 400 });
    const id = mintToCoinGeckoId(mint);
    if (!id) return NextResponse.json({ timestamps: [], prices: [] });
    const p = TF_TO_PARAMS[tf] || TF_TO_PARAMS['1D'];
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${p.days}${p.interval?`&interval=${p.interval}`:''}`;
    const j = await fetchWithRetry(url);
    const prices = Array.isArray(j?.prices) ? j.prices : [];
    const timestamps: number[] = prices.map((e: any) => Math.floor((e[0] || 0) / 1000));
    const vals: number[] = prices.map((e: any) => Number(e[1] || 0));
    return NextResponse.json({ timestamps, prices: vals });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
