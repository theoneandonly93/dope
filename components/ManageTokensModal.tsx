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
      <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white">
        <h2 className="text-lg font-semibold mb-4">Manage Tokens</h2>
        <input
          type="text"
          className="w-full mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
          placeholder="Search tokens by name, symbol, or mint"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map(token => (
            <div key={token.mint} className="flex items-center gap-3 p-2 rounded-lg border border-white/10">
              <img src={token.logo || "/logo-192.png"} alt={token.symbol} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <span className="font-semibold">{token.name} <span className="text-xs text-white/60">{token.symbol}</span></span>
                <span className="block text-xs text-white/40">{token.mint}</span>
              </div>
              <button
                className={`btn px-2 py-1 text-xs ${shownTokens.includes(token.mint) ? "bg-green-600" : "bg-white/10"}`}
                onClick={() => onToggle(token.mint)}
              >{shownTokens.includes(token.mint) ? "On" : "Off"}</button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <input
            type="text"
            className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
            placeholder="Add token by mint address"
            value={customMint}
            onChange={e => setCustomMint(e.target.value)}
          />
          <button className="btn w-full mb-2" onClick={() => customMint && onAdd(customMint)}>Add Token</button>
        </div>
        <button className="btn w-full mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
