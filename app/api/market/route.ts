import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache + basic rate limiting per IP for market data proxy.
// This reduces direct CoinGecko calls from the client and centralizes backoff & error handling.

type CacheEntry = { json: any; ts: number };
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60_000; // 1 minute for aggregate
const SPARK_TTL_MS = 5 * 60_000; // 5 minutes for sparkline

// Rate limiting: allow N requests per window per IP
const RATE_LIMIT = 30; // per 60s window per IP
const rate: Record<string, { count: number; windowStart: number }> = {};

function allow(ip: string) {
  const now = Date.now();
  const w = rate[ip];
  if (!w) { rate[ip] = { count: 1, windowStart: now }; return true; }
  if (now - w.windowStart > 60_000) { rate[ip] = { count: 1, windowStart: now }; return true; }
  if (w.count >= RATE_LIMIT) return false;
  w.count += 1; return true;
}

async function fetchWithRetry(url: string, attempts = 3, backoffMs = 400): Promise<any> {
  let lastErr: any = null;
  for (let i=0;i<attempts;i++) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('upstream '+r.status);
      return await r.json();
    } catch(e:any) {
      lastErr = e;
      await new Promise(res => setTimeout(res, backoffMs * (i+1)));
    }
  }
  throw lastErr || new Error('fetch failed');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get('ids') || '').split(',').map(s=>s.trim()).filter(Boolean);
  const wantSpark = searchParams.get('spark') === '1';
  if (ids.length === 0) return NextResponse.json({ error: 'missing ids' }, { status: 400 });
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'anon';
  if (!allow(ip)) return NextResponse.json({ error: 'rate limit' }, { status: 429 });

  const baseKey = `market:${ids.sort().join('|')}`;
  const now = Date.now();
  const cached = cache[baseKey];
  if (cached && (now - cached.ts) < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, data: cached.json, cached: true });
  }
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&price_change_percentage=24h`;
    const json = await fetchWithRetry(url);
    cache[baseKey] = { json, ts: now };
    // Optionally add sparkline for each id
    if (wantSpark) {
      await Promise.all(ids.map(async(id) => {
        const sparkKey = `spark:${id}`;
        const c = cache[sparkKey];
        if (c && (now - c.ts) < SPARK_TTL_MS) return;
        try {
          const sparkUrl = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1&interval=hourly`;
          const sp = await fetchWithRetry(sparkUrl, 2, 300);
          cache[sparkKey] = { json: sp, ts: Date.now() };
        } catch {}
      }));
      const enriched = json.map((e:any) => {
        const spark = cache[`spark:${e.id}`];
        return { ...e, _spark: spark?.json?.prices || [] };
      });
      return NextResponse.json({ ok: true, data: enriched, cached: false });
    }
    return NextResponse.json({ ok: true, data: json, cached: false });
  } catch(e:any) {
    return NextResponse.json({ error: e?.message || 'upstream error' }, { status: 502 });
  }
}
