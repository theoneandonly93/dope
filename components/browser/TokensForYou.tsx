"use client";
import React, { useEffect, useState } from "react";
import { useWalletOptional } from "../WalletProvider";

export default function TokensForYou({ onOpenToken }: { onOpenToken: (mint: string)=>void }) {
  const wallet = useWalletOptional();
  const [tokens, setTokens] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!wallet?.address) throw new Error("no wallet");
        const res = await fetch(`/api/wallet/${wallet.address}/balances`);
        const j = await res.json();
        const list = (j?.tokens||[]).sort((a:any,b:any)=>b.uiAmount - a.uiAmount).slice(0,8);
        if (!cancelled) setTokens(list);
      } catch {
        // Fallback to tokenlist
        try {
          const list = await fetch('/tokenlist.json').then(r=>r.json());
          setTokens(Array.isArray(list) ? list.slice(0,8) : []);
        } catch { setTokens([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [wallet?.address]);
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Tokens For You</h3>
        <a href="/tokens" className="text-xs text-white/70 underline">See More</a>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tokens.map((t:any, i:number) => (
          <button key={i} onClick={()=>onOpenToken(t.mint)} className="rounded-2xl bg-[#111] border border-white/10 p-3 text-left">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.logo || '/logo-192.png'} className="w-7 h-7 rounded-full" alt={t.symbol||'token'} />
              <div className="text-sm font-semibold truncate">{t.symbol || t.name || 'Token'}</div>
            </div>
            {typeof t.uiAmount === 'number' && <div className="text-[11px] text-white/60 mt-1">Bal: {t.uiAmount.toLocaleString(undefined,{maximumFractionDigits:4})}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
