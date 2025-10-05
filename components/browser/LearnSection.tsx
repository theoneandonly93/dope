"use client";
import React from "react";

const LEARN = [
  { title: 'Solana 101', href: '#' },
  { title: 'Sui 101', href: '#' },
  { title: 'Staking 101', href: '#' },
  { title: 'Building on DopelgangaChain', href: '#' },
];

export default function LearnSection() {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-2">Learn</h3>
      <div className="space-y-2">
        {LEARN.map((l,i)=>(
          <a key={i} href={l.href} className="block rounded-2xl bg-[#111] border border-white/10 px-3 py-2 text-sm hover:bg-[#171717]">{l.title}</a>
        ))}
      </div>
    </div>
  );
}
