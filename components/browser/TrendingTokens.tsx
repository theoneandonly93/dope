"use client";
import React, { useEffect, useState } from "react";

async function fetchTrendingTokens() {
  // DexScreener trending tokens
  const r = await fetch("https://api.dexscreener.io/latest/dex/tokens/solana", { cache: "no-store" });
  const j = await r.json();
  return Array.isArray(j?.pairs) ? j.pairs.slice(0, 10) : [];
}

export default function TrendingTokens({ onOpenToken }: { onOpenToken: (mint: string)=>void }) {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string>("");
  useEffect(() => {
    let iv: any;
    const load = async () => { try { setItems(await fetchTrendingTokens()); setErr(""); } catch(e:any) { setErr(e?.message||"Failed"); } };
    load();
    iv = setInterval(load, 10_000);
    return () => { if (iv) clearInterval(iv); };
  }, []);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Trending Tokens</h3>
        <a href="/tokens" className="text-xs text-white/70 underline">See More</a>
      </div>
      {err && <div className="text-xs text-red-400">{err}</div>}
      <div className="space-y-2">
        {items.map((p:any, i:number) => {
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
      </div>
    </div>
  );
}
