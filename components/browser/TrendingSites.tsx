"use client";
import React from "react";

const SITES = [
  { name: 'Jupiter', url: 'https://jup.ag', icon: '/logo-192.png' },
  { name: 'Pump.fun', url: 'https://pump.fun', icon: '/logo-192.png' },
  { name: 'DexScreener', url: 'https://dexscreener.com/solana', icon: '/logo-192.png' },
  { name: 'Dopelganga', url: 'https://dopelganga.com', icon: '/logo-192.png' },
  { name: 'GhostFi', url: 'https://ghostfi.app', icon: '/logo-192.png' },
];

export default function TrendingSites({ onOpen }: { onOpen: (url: string)=>void }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Trending Sites</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SITES.map(s => (
          <button key={s.url} onClick={()=>onOpen(s.url)} className="rounded-2xl bg-[#111] border border-white/10 p-3 text-left">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.icon} className="w-7 h-7 rounded-lg" alt={s.name} />
              <div className="text-sm font-semibold truncate">{s.name}</div>
            </div>
            <div className="text-[11px] text-white/60 mt-1">Tap to open</div>
          </button>
        ))}
      </div>
    </div>
  );
}
