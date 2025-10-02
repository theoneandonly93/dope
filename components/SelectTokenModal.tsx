import React from "react";

export default function SelectTokenModal({ tokens, onSelect, onClose }: {
  tokens: Array<{ mint: string; name: string; symbol: string; logo?: string; balance: number }>,
  onSelect: (mint: string) => void,
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white">
        <h2 className="text-lg font-semibold mb-4">Select Token to Send</h2>
        <div className="space-y-2">
          {tokens.map(token => (
            <button
              key={token.mint}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/10"
              onClick={() => onSelect(token.mint)}
              disabled={token.balance <= 0}
            >
              <img src={token.logo || "/logo-192.png"} alt={token.symbol} className="w-8 h-8 rounded-full" />
              <div className="flex flex-col text-left">
                <span className="font-semibold">{token.name} <span className="text-xs text-white/60">{token.symbol}</span></span>
                <span className="text-xs text-green-400">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              </div>
            </button>
          ))}
        </div>
        <button className="btn w-full mt-4" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
