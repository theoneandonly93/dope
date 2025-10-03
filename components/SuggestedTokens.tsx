"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Simple static suggestions (can be replaced with dynamic trending API later)
const SUGGESTED = [
  { mint: '4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts', symbol: 'DWT', name: 'Dope Wallet Token', logo: '/logo-192.png', desc: 'Utility token inside the Dope ecosystem.' },
  { mint: '5ncWhK2wWS2UzmhkVYaEJ5ESENcoeMCTsvEXcmQepump', symbol: 'JBAG', name: 'Jbag', logo: '/jbag.jpg', desc: 'Community meme token.' },
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', logo: '/sol.png', desc: 'Native Solana token.' },
  { mint: 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33', symbol: 'DOPE', name: 'Dopelganga', logo: '/logo-192.png', desc: 'Core Dopelganga token.' }
];

interface SuggestedTokensProps {
  onSelect?: (mint: string) => void;
  prices?: Record<string, number>; // optional external prices (USD)
  balances?: Record<string, number>; // optional balances to disable sell (future use)
}

export default function SuggestedTokens({ onSelect, prices: externalPrices, balances }: SuggestedTokensProps) {
  const [prices, setPrices] = useState<Record<string, number>>(externalPrices || {});
  useEffect(() => { if (externalPrices) setPrices(externalPrices); }, [externalPrices]);

  // Lightweight internal fetch for SOL + DOPE when not provided (demo purpose only)
  useEffect(() => {
    if (externalPrices) return; // parent supplied
    (async () => {
      try {
        const ids = [
          { id: 'solana', mint: 'So11111111111111111111111111111111111111112' },
          { id: 'dope', mint: 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33' }
        ];
        const qs = ids.map(i=>i.id).join(',');
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${qs}&vs_currencies=usd`);
        const j = await r.json();
        const next: Record<string, number> = {};
        ids.forEach(i => { const v = j?.[i.id]?.usd; if (v) next[i.mint] = v; });
        setPrices(p => ({ ...p, ...next }));
      } catch {}
    })();
  }, [externalPrices]);
  return (
    <div className="glass rounded-2xl p-4 border border-white/10 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Suggested Tokens</h2>
        <Link href="/tokens" className="text-xs underline text-white/60 hover:text-white">View All</Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {SUGGESTED.map(tok => (
          <div key={tok.mint} className="flex flex-col items-center gap-1" title={tok.desc}>
            <button
              className="rounded-xl p-2 bg-white/5 hover:bg-white/10 border border-white/10 transition flex flex-col items-center w-full"
              onClick={() => {
                // Open details only (no forced buy mode)
                try { window.dispatchEvent(new CustomEvent('dope:token-detail', { detail: { mint: tok.mint, name: tok.name } })); } catch {}
                onSelect?.(tok.mint);
              }}
            >
              <img src={tok.logo} alt={tok.symbol} className="w-8 h-8 rounded-full mb-1" />
              <span className="text-[11px] font-semibold text-white/80 leading-tight flex flex-col items-center">
                {tok.symbol}
                {prices[tok.mint] && (
                  <span className="mt-0.5 px-1 py-0.5 rounded bg-black/50 text-[9px] text-white/60 font-normal">
                    ${prices[tok.mint].toLocaleString(undefined,{maximumFractionDigits:2})}
                  </span>
                )}
              </span>
            </button>
            <button
              className="text-[10px] text-green-400 hover:text-green-300 mt-1"
              onClick={() => {
                // Explicit buy intent triggers auto buy mode
                try { window.dispatchEvent(new CustomEvent('dope:token-detail', { detail: { mint: tok.mint, name: tok.name, intent: 'buy' } })); } catch {}
              }}
            >Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}
