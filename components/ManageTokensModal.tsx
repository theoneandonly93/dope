import React, { useState } from "react";

export default function ManageTokensModal({ tokens, shownTokens, onToggle, onAdd, onClose }: {
  tokens: Array<{ mint: string; name: string; symbol: string; logo?: string }>;
  shownTokens: string[];
  onToggle: (mint: string) => void;
  onAdd: (mint: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [customMint, setCustomMint] = useState("");
  const filtered = tokens.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.mint.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="rounded-xl p-3 w-full max-w-xs border border-white/10 bg-black text-white shadow-lg" style={{margin: '0 auto'}}>
        <h2 className="text-base font-semibold mb-2 text-center">Manage Tokens</h2>
        <input
          type="text"
          className="w-full mb-2 bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white text-sm"
          placeholder="Search tokens"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {filtered.map(token => (
            <div key={token.mint} className="flex items-center gap-2 p-1 rounded border border-white/10">
              <img src={token.logo || "/logo-192.png"} alt={token.symbol} className="w-7 h-7 rounded-full" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm truncate">{token.name} <span className="text-xs text-white/60">{token.symbol}</span></span>
                <span className="block text-xs text-white/40 truncate">{token.mint}</span>
              </div>
              <button
                className={`btn px-2 py-1 text-xs min-w-[40px] ${shownTokens.includes(token.mint) ? "bg-green-600" : "bg-white/10"}`}
                onClick={() => onToggle(token.mint)}
              >{shownTokens.includes(token.mint) ? "On" : "Off"}</button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="text"
            className="w-full mb-1 bg-white/5 border border-white/10 rounded px-2 py-1 outline-none text-white text-sm"
            placeholder="Add token by mint address"
            value={customMint}
            onChange={e => setCustomMint(e.target.value)}
          />
          <button className="btn w-full mb-1 text-xs py-1" onClick={() => customMint && onAdd(customMint)}>Add Token</button>
        </div>
        <button className="btn w-full mt-1 text-xs py-1" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
