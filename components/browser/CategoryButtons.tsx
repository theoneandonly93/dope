"use client";
import React from "react";

const cats = [
  { key: "tokens", label: "Tokens" },
  { key: "foryou", label: "Tokens for You" },
  { key: "top", label: "Top Lists" },
  { key: "traders", label: "Top Traders" },
  { key: "sites", label: "Trending Sites" },
  { key: "learn", label: "Learn" },
  { key: "rig", label: "Rig Rentals" },
];

export default function CategoryButtons({ active, onChange }: { active: string; onChange: (k: string)=>void }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {cats.map(c => (
        <button key={c.key}
          onClick={()=>onChange(c.key)}
          className={`rounded-xl px-3 py-2 text-sm border ${active===c.key?"bg-white/15 border-white/30":"bg-white/5 border-white/10 text-white/70"}`}
        >{c.label}</button>
      ))}
    </div>
  );
}
