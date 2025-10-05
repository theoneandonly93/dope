"use client";
import React, { useEffect, useMemo, useState } from "react";
import { fetchMarketData } from "../../lib/marketData";

type Chain = "solana" | "dopelganga";

async function fetchDexScreenerSolana() {
  const r = await fetch("https://api.dexscreener.io/latest/dex/tokens/solana", { cache: "no-store" });
  const j = await r.json();
  return Array.isArray(j?.pairs) ? j.pairs.slice(0, 10) : [];
}

async function fetchDopelgangaTrending(): Promise<Array<{ mint: string; name: string; symbol: string; logo?: string; price?: number; change24h?: number }>> {
  try {
    const list = await fetch("/tokenlist.json", { cache: "no-store" }).then(r=>r.json()).catch(()=>[]);
    const mints: string[] = Array.isArray(list) ? list.map((t:any)=>t.mint).filter(Boolean) : [];
    if (mints.length === 0) return [];
    const md = await fetchMarketData(mints.slice(0, 50), false, { useProxy: true }).catch(()=>[]);
    const map: Record<string, any> = {};
    (md||[]).forEach((d:any)=>{ map[d.mint] = d; });
    // Small priority boost for first-party tokens
    const priority = new Set([
      "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33", // DOPE
      "4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts", // DWT
      "5ncWhK2wWS2UzmhkVYaEJ5ESENcoeMCTsvEXcmQepump"  // JBAG
    ]);
    const scored = (list as any[]).map(t => {
      const d = map[t.mint] || {};
      const ch = d.change24h || 0;
      const vol = d.volume24h || 0;
      const score = (vol > 0 ? Math.log10(vol + 1) : 0) + ch/10 + (priority.has(t.mint) ? 2 : 0);
      return { ...t, price: d.price, change24h: ch, _score: score };
    });
    scored.sort((a,b)=> (b._score||0) - (a._score||0));
    return scored.slice(0, 10).map(t => ({ mint: t.mint, name: t.name, symbol: t.symbol, logo: t.logo, price: t.price, change24h: t.change24h }));
  } catch { return []; }
}

export default function TrendingTokens({ onOpenToken }: { onOpenToken: (mint: string)=>void }) {
  const [chain, setChain] = useState<Chain>("solana");
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let iv: any;
    const load = async () => {
      try {
        setErr("");
        if (chain === "solana") {
          const pairs = await fetchDexScreenerSolana();
          setItems(pairs);
        } else {
          const toks = await fetchDopelgangaTrending();
          setItems(toks);
        }
      } catch(e:any) { setErr(e?.message || "Failed"); }
    };
    load();
    iv = setInterval(load, 15_000);
    return () => { if (iv) clearInterval(iv); };
  }, [chain]);

  const header = useMemo(() => chain === 'solana' ? 'Trending on Solana' : 'Trending on Dopelganga', [chain]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{header}</h3>
        <div className="flex gap-1">
          <button onClick={()=>setChain('solana')} className={`text-[11px] px-2 py-1 rounded-full border ${chain==='solana'? 'bg-white/15 border-white/30':'bg-white/5 border-white/10 text-white/70'}`}>Solana</button>
          <button onClick={()=>setChain('dopelganga')} className={`text-[11px] px-2 py-1 rounded-full border ${chain==='dopelganga'? 'bg-white/15 border-white/30':'bg-white/5 border-white/10 text-white/70'}`}>Dopelganga</button>
        </div>
      </div>
      {err && <div className="text-xs text-red-400">{err}</div>}
      <div className="space-y-2">
        {chain === 'solana' && items.map((p:any, i:number) => {
          const price = Number(p.priceUsd||0);
          const ch = Number(p.priceChange?.h24||0);
          const changeColor = ch>0?"text-green-400":ch<0?"text-red-400":"text-white/70";
          const name = p.baseToken?.symbol || p.baseToken?.name || "Token";
          const mint = p.baseToken?.address || "";
          return (
            <button key={i} className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-2xl px-3 py-2"
              onClick={()=> mint && onOpenToken(mint)}
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.info?.imageUrl || "/logo-192.png"} className="w-8 h-8 rounded-full" alt={name} />
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-[11px] text-white/60">${price.toLocaleString(undefined,{maximumFractionDigits:6})}</div>
                </div>
              </div>
              <div className={`text-sm ${changeColor}`}>{ch.toFixed(2)}%</div>
            </button>
          );
        })}

        {chain === 'dopelganga' && items.map((t:any, i:number) => {
          const price = Number(t.price||0);
          const ch = Number(t.change24h||0);
          const changeColor = ch>0?"text-green-400":ch<0?"text-red-400":"text-white/70";
          const name = t.symbol || t.name || 'Token';
          const mint = t.mint;
          return (
            <button key={i} className="w-full flex items-center justify-between bg-[#111] border border-white/10 rounded-2xl px-3 py-2"
              onClick={()=> mint && onOpenToken(mint)}
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logo || "/logo-192.png"} className="w-8 h-8 rounded-full" alt={name} />
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-[11px] text-white/60">${price ? price.toLocaleString(undefined,{maximumFractionDigits:6}) : '—'}</div>
                </div>
              </div>
              <div className={`text-sm ${changeColor}`}>{isNaN(ch) ? '—' : ch.toFixed(2)+ '%'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
