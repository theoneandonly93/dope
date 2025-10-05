"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchMarketData, debounce } from '../../lib/marketData';
import Sparkline from '../../components/Sparkline';
import { useWalletOptional } from '../../components/WalletProvider';

// Simple trending heuristic: prioritize a fixed order now (could be extended with volume API later)
// We'll load /tokenlist.json and sort placing SOL, DOPE, DWT, JBAG first then others alphabetically.
export default function TokensListingPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState<Record<string, { price: number|null; change24h: number|null; volume24h: number|null; sparkline?: Array<{t:number;p:number}> }>>({});
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [sortKey, setSortKey] = useState<'trending'|'change'|'volume'|'price'>('trending');
  const [limit, setLimit] = useState<number>(() => {
    if (typeof window === 'undefined') return 25;
    const qs = new URLSearchParams(window.location.search);
    const l = Number(qs.get('limit'));
    return l && l>0 ? l : (Number(sessionStorage.getItem('tokens:limit')) || 25);
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const wallet = useWalletOptional();

  const loadData = useCallback(async (force=false) => {
    setLoading(true);
    try {
      const listRes = await fetch('/tokenlist.json');
      const list = await listRes.json();
      setTokens(list);
      const mints = list.map((t:any)=>t.mint).filter(Boolean);
      fetchMarketData(mints.slice(0,200), true, { useProxy: true, force }).then(data => {
        const map: Record<string, any> = {};
        data.forEach(d => { map[d.mint] = { price: d.price, change24h: d.change24h, volume24h: d.volume24h, sparkline: d.sparkline }; });
        setMarket(map);
      });
      if (wallet?.address) {
        try {
          const res = await fetch(`/api/wallet/${wallet.address}/balances`);
          const j = await res.json();
          if (j?.ok) {
            const map: Record<string, number> = {};
            (j.tokens||[]).forEach((t:any) => { map[t.mint] = t.uiAmount; });
            setBalances(map);
          }
        } catch {}
      }
    } catch {
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => { loadData(false); }, [loadData]);

  // Persist limit & sort in session + URL
  useEffect(() => {
    try {
      sessionStorage.setItem('tokens:limit', String(limit));
      sessionStorage.setItem('tokens:sort', sortKey);
      const url = new URL(window.location.href);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('sort', sortKey);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [limit, sortKey]);

  // Apply sort from URL on first render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = new URLSearchParams(window.location.search);
    const s = qs.get('sort');
    if (s && ['trending','change','volume','price'].includes(s)) setSortKey(s as any);
  }, []);

  // Debounced filter effect (future: could refetch token list if server-side filtering)
  const debouncedSetFilter = useMemo(() => debounce((v:string)=>setFilter(v), 250), []);

  const priority = [
    'So11111111111111111111111111111111111111112',
    'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33',
    '4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts',
    '5ncWhK2wWS2UzmhkVYaEJ5ESENcoeMCTsvEXcmQepump'
  ];

  const trendScore = (mint: string) => {
    const m = market[mint];
    if (!m) return 0;
    const vol = m.volume24h || 0;
    const ch = m.change24h || 0;
    return (vol > 0 ? Math.log10(vol+1) : 0) + ch / 10 + (priority.indexOf(mint) !== -1 ? 2 : 0);
  };

  const filteredAll = tokens
    .filter(t => !filter || (t.symbol || t.name || '').toLowerCase().includes(filter.toLowerCase()))
    .slice();
  filteredAll.sort((a:any,b:any) => {
    if (sortKey === 'trending') return trendScore(b.mint) - trendScore(a.mint);
    if (sortKey === 'change') return (market[b.mint]?.change24h||-1e9) - (market[a.mint]?.change24h||-1e9);
    if (sortKey === 'volume') return (market[b.mint]?.volume24h||0) - (market[a.mint]?.volume24h||0);
    if (sortKey === 'price') return (market[b.mint]?.price||0) - (market[a.mint]?.price||0);
    return 0;
  });
  const filtered = filteredAll.slice(0, limit);

  return (
    <div className="pb-24 space-y-4 w-full max-w-md mx-auto px-4">
      <div className="flex items-center justify-between mt-4 gap-2">
        <h1 className="text-xl font-semibold">All Tokens</h1>
        <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white">
          <option value="trending">Trending</option>
            <option value="change">24h Change</option>
            <option value="volume">24h Volume</option>
            <option value="price">Price</option>
        </select>
        <Link href="/" className="text-xs underline text-white/60 hover:text-white">Home</Link>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search tokens"
          defaultValue={filter}
          onChange={e=>debouncedSetFilter(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm outline-none"
        />
        <button
          className="text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-white/10"
          onClick={() => loadData(true)}
          title="Force refresh market data"
        >Refresh</button>
      </div>
      {loading && <div className="text-white/50 text-xs">Loading token list…</div>}
      <ul className="space-y-2">
        {filtered.map(tok => {
          const m = market[tok.mint] as { price?: number|null; change24h?: number|null; volume24h?: number|null } | undefined;
          const price = m?.price ?? null;
          const change = m?.change24h ?? null;
          const vol = m?.volume24h ?? null;
          const spark = (market[tok.mint] as any)?.sparkline as Array<{t:number;p:number}>|undefined;
          const bal = balances[tok.mint] || 0;
          const usd = price && bal ? price * bal : null;
          const changeColor = change == null ? 'text-white/40' : change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-white/60';
          return (
            <li key={tok.mint} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <img src={tok.logo || '/logo-192.png'} alt={tok.symbol} className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-2">
                  {tok.symbol || tok.name || tok.mint.slice(0,6)}
                  {price != null && <span className="text-[10px] px-1 py-0.5 rounded bg-black/50 text-white/60">${price.toLocaleString(undefined,{maximumFractionDigits:2})}</span>}
                </div>
                <div className="text-[10px] text-white/40 font-mono truncate">{tok.mint}</div>
                <div className="text-[11px] text-white/70 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Bal: {bal ? bal.toLocaleString(undefined,{maximumFractionDigits:4}) : '0'}</span>
                  {usd && <span>${usd.toLocaleString(undefined,{maximumFractionDigits:2})}</span>}
                  {vol != null && <span className="text-white/50">Vol24h: {vol.toLocaleString(undefined,{maximumFractionDigits:0})}</span>}
                  {change != null && <span className={changeColor}>{change.toFixed(2)}%</span>}
                </div>
                <div className="mt-1">
                  <Sparkline points={spark} positive={(change||0)>=0} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="text-[10px] text-green-400 hover:text-green-300 underline"
                  onClick={() => { try { window.dispatchEvent(new CustomEvent('dope:token-detail', { detail: { mint: tok.mint, name: tok.name || tok.symbol, intent: 'buy' } })); } catch {} }}
                >Buy</button>
                <button
                  className="text-[10px] text-red-400 hover:text-red-300 underline"
                  onClick={() => { try { window.dispatchEvent(new CustomEvent('dope:token-detail', { detail: { mint: tok.mint, name: tok.name || tok.symbol, intent: 'sell' } })); } catch {} }}
                >Sell</button>
                <Link
                  href={`/token/${encodeURIComponent(tok.mint)}`}
                  className="text-[10px] text-white/70 hover:text-white underline"
                  prefetch
                >Details</Link>
              </div>
            </li>
          );
        })}
        {!loading && filtered.length===0 && <li className="text-white/40 text-xs">No tokens match your search.</li>}
      </ul>
      {filtered.length < filteredAll.length && (
        <div className="flex justify-center mt-4">
          <button
            className="btn text-xs px-4 py-2 disabled:opacity-40"
            disabled={loadingMore}
            onClick={() => { setLoadingMore(true); setTimeout(()=>{ setLimit(l=>l+25); setLoadingMore(false); }, 150); }}
          >{loadingMore ? 'Loading…' : 'Load More'}</button>
        </div>
      )}
      <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded p-2">
        Market data is provided for convenience only and may be delayed or inaccurate. Nothing on this page constitutes financial, investment, or legal advice.
      </div>
    </div>
  );
}
