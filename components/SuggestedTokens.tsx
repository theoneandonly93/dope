"use client";
import React from 'react';
import Link from 'next/link';

// Simple static suggestions (can be replaced with dynamic trending API later)
const SUGGESTED = [
  { mint: '4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts', symbol: 'DWT', name: 'Dope Wallet Token', logo: '/logo-192.png' },
  { mint: '5ncWhK2wWS2UzmhkVYaEJ5ESENcoeMCTsvEXcmQepump', symbol: 'JBAG', name: 'Jbag', logo: '/jbag.jpg' },
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', logo: '/sol.png' },
  { mint: 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33', symbol: 'DOPE', name: 'Dopelganga', logo: '/logo-192.png' }
];

export default function SuggestedTokens({ onSelect }: { onSelect?: (mint: string) => void }) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/10 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Suggested Tokens</h2>
        <Link href="/swap" className="text-xs underline text-white/60 hover:text-white">View All</Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {SUGGESTED.map(tok => (
          <div key={tok.mint} className="flex flex-col items-center gap-1">
            <button
              className="rounded-xl p-2 bg-white/5 hover:bg-white/10 border border-white/10 transition flex flex-col items-center w-full"
              onClick={() => onSelect ? onSelect(tok.mint) : undefined}
              title={tok.name}
            >
              <img src={tok.logo} alt={tok.symbol} className="w-8 h-8 rounded-full mb-1" />
              <span className="text-[11px] font-semibold text-white/80 leading-tight">{tok.symbol}</span>
            </button>
            <Link href={`/swap?in=So11111111111111111111111111111111111111112&out=${encodeURIComponent(tok.mint)}`} className="text-[10px] text-green-400 hover:text-green-300 mt-1">Buy</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
