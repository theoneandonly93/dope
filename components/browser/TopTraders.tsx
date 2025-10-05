"use client";
import React, { useEffect, useState } from "react";

export default function TopTraders() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false; let iv:any;
    const load = async () => {
      try {
        const r = await fetch("https://public-api.birdeye.so/public/trending?sort_by=pnl&direction=desc", { headers: { 'x-chain': 'solana' } as any });
        const j = await r.json();
        if (!cancelled) setItems(Array.isArray(j?.data) ? j.data.slice(0,5) : []);
      } catch { if (!cancelled) setItems([]); }
    };
    load();
    iv = setInterval(load, 10_000);
    return () => { cancelled = true; if (iv) clearInterval(iv); };
  }, []);
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Top Traders</h3>
        <a href="#" className="text-xs text-white/70 underline">See More</a>
      </div>
      <div className="space-y-2">
        {items.map((w:any,i:number)=>{
          const pnl = Number(w.pnl||0);
          const color = pnl>=0?"text-green-400":"text-red-400";
          return (
            <div key={i} className="flex items-center justify-between bg-[#111] border border-white/10 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10" />
                <div className="text-sm font-mono truncate max-w-[180px]">{w.address||'wallet'}</div>
              </div>
              <div className={`text-sm ${color}`}>{pnl.toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
