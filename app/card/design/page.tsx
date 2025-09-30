"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Design = { id: string; name: string; bg: string; price: number; badge?: string };

const CLASSIC_PRICE = 5;
const METAL_PRICE = 50;

const classic: Design[] = [
  { id: 'tortoise', name: 'Tortoise', bg: 'linear-gradient(135deg,#1a1a1a,#2a1f1a)', price: CLASSIC_PRICE, badge: 'New!' },
  { id: 'glitter', name: 'Glitter', bg: 'linear-gradient(135deg,#1fb6ff,#28c76f)', price: CLASSIC_PRICE },
  { id: 'pink', name: 'Pink', bg: 'linear-gradient(135deg,#ff1791,#ff4d4d)', price: CLASSIC_PRICE },
  { id: 'mood', name: 'Mood', bg: 'radial-gradient(circle at 30% 30%, rgba(255,180,80,0.25), transparent 40%), radial-gradient(circle at 70% 70%, rgba(120,180,255,0.3), transparent 45%), linear-gradient(135deg,#0f0f0f,#252525)', price: CLASSIC_PRICE },
  { id: 'glow', name: 'Glow in the dark', bg: 'linear-gradient(135deg,#c6ff00,#a7ff00)', price: CLASSIC_PRICE },
  { id: 'black', name: 'Black', bg: 'linear-gradient(135deg,#0d0d0d,#1c1c1c)', price: CLASSIC_PRICE },
  { id: 'white', name: 'White', bg: 'linear-gradient(135deg,#ffffff,#e9e9e9)', price: CLASSIC_PRICE },
];

const metal: Design[] = [
  { id: 'aurora', name: 'Aurora', bg: 'linear-gradient(135deg,#ff8bd0,#9ad7ff)', price: METAL_PRICE },
  { id: 'graphite', name: 'Graphite', bg: 'linear-gradient(135deg,#2c2c2c,#595959)', price: METAL_PRICE },
  { id: 'titanium', name: 'Titanium', bg: 'linear-gradient(135deg,#9aa0a6,#c0c5cc)', price: METAL_PRICE },
];

function CardPreview({ d, onSelect }: { d: Design; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="w-full text-left">
      <div className="relative rounded-2xl" style={{ background: d.bg }}>
        <div className="pt-[56%]" />
        <div className="absolute inset-0 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/80">
            <div className="w-8 h-6 rounded bg-white/80 mix-blend-screen" />
            <div className="text-xs tracking-widest">$INTL13</div>
          </div>
        </div>
        {d.badge && (
          <div className="absolute left-3 bottom-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{d.badge}</div>
        )}
        <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2">
          <div className="bg-black text-white text-sm px-3 py-2 rounded-full shadow">${d.price}</div>
        </div>
      </div>
      <div className="mt-2 text-white/90 text-sm">{d.name}</div>
    </button>
  );
}

export default function DesignChooser() {
  const router = useRouter();
  const [tab, setTab] = useState<'classic' | 'metal'>('classic');

  const list = tab === 'classic' ? classic : metal;

  const apply = (d: Design) => {
    try {
      localStorage.setItem('dope_card_design', JSON.stringify({ id: d.id, name: d.name, type: tab, price: d.price, bg: d.bg }));
    } catch {}
    router.back();
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-[#0b0c10] px-4 py-3 flex items-center gap-3">
        <button aria-label="Close" onClick={()=>router.back()} className="text-2xl leading-none">×</button>
        <div className="text-xl font-semibold">Choose your style</div>
      </div>
      <div className="px-4">
        <div className="flex gap-2 mb-4">
          <button className={`px-3 py-2 rounded-full ${tab==='classic'?'bg-white text-black':'bg-white/10 text-white'}`} onClick={()=>setTab('classic')}>Classic</button>
          <button className={`px-3 py-2 rounded-full ${tab==='metal'?'bg-white text-black':'bg-white/10 text-white'}`} onClick={()=>setTab('metal')}>Metal</button>
        </div>
        <div className="space-y-6">
          {list.map((d) => (
            <CardPreview key={d.id} d={d} onSelect={()=>apply(d)} />
          ))}
        </div>
      </div>
    </div>
  );
}

