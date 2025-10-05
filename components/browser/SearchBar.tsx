"use client";
import React, { useState } from "react";

export default function SearchBar({ onSubmit, onSuggest }: { onSubmit: (q: string) => void; onSuggest?: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) onSubmit(q.trim()); }}
      className="w-full flex items-center gap-2 bg-[#111] border border-white/10 rounded-2xl px-3 py-2"
    >
      <span className="text-white/60">🔎</span>
      <input
        value={q}
        onChange={(e)=>{ setQ(e.target.value); onSuggest?.(e.target.value); }}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Sites, tokens, URL"
      />
      {q && (
        <button type="button" className="text-white/50 hover:text-white text-xs" onClick={()=>setQ("")}>Clear</button>
      )}
    </form>
  );
}
