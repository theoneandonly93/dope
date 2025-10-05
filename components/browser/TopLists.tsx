"use client";
import React, { useEffect, useState } from "react";

export default function TopLists() {
  const [gainers, setGainers] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://api.dexscreener.io/latest/dex/tokens/solana");
        const j = await r.json();
        const pairs = Array.isArray(j?.pairs) ? j.pairs : [];
        const sorted = pairs.slice().sort((a:any,b:any)=>Number(b.priceChange?.h24||0)-Number(a.priceChange?.h24||0));
        if (!cancelled) {
          setGainers(sorted.slice(0,5));
          setLosers(sorted.slice(-5).reverse());
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  const Card = ({ title, items, pos }:{ title:string; items:any[]; pos:boolean }) => (
    <div className="rounded-2xl bg-[#111] border border-white/10 p-3">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        {items.map((p:any,i:number)=>{
          const ch = Number(p.priceChange?.h24||0);
          const changeColor = ch>0?"text-green-400":"text-red-400";
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={p.info?.imageUrl || '/logo-192.png'} className="w-6 h-6 rounded-full" />
                <div className="text-sm">{p.baseToken?.symbol || 'Token'}</div>
              </div>
              <div className={`text-sm ${changeColor}`}>{ch.toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div className="mt-6 grid grid-cols-1 gap-2">
      <Card title="Top Gainers" items={gainers} pos={true} />
      <Card title="Top Losers" items={losers} pos={false} />
    </div>
  );
}
