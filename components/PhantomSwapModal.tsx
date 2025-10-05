"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";
import { getConnection } from "../lib/wallet";
import { getTokenDecimals } from "../lib/tokenMetadataCache";
import { getQuote as pumpQuote, executeSwap as pumpExecute } from "../lib/pumpfunSwap";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";

type Props = { open: boolean; onClose: () => void };

function normalizeMint(m: string): string {
  const s = (m || '').trim().toLowerCase();
  if (s === 'sol' || s === 'wsol') return 'So11111111111111111111111111111111111111112';
  if (s === 'btc') return '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E';
  if (s === 'eth') return '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8';
  return m;
}

function isValidBase58(m: string) { try { new PublicKey(m); return true; } catch { return false; } }

export default function PhantomSwapModal({ open, onClose }: Props) {
  const { keypair, unlocked, unlock, tryBiometricUnlock } = useWallet() as any;
  const [fromMint, setFromMint] = useState<string>('So11111111111111111111111111111111111111112'); // SOL
  const [toMint, setToMint] = useState<string>('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [priceImpact, setPriceImpact] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<any[]>([]);
  const [err, setErr] = useState<string>("");
  const [showFromEdit, setShowFromEdit] = useState(false);
  const [showToEdit, setShowToEdit] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("https://api.pump.fun/trending").then(r=>r.json()).then((d:any)=>{
      const list = Array.isArray(d) ? d.slice(0,5) : [];
      setTrending(list);
    }).catch(()=>setTrending([]));
  }, [open]);

  const handleQuote = async (v: string) => {
    setAmountIn(v);
    setErr("");
    setAmountOut("");
    setPriceImpact("");
    const n = Number(v);
    if (!(n>0)) return;
    if (!isValidBase58(normalizeMint(fromMint)) || !isValidBase58(normalizeMint(toMint))) { setErr('Invalid mint'); return; }
    try {
      const inDec = await getTokenDecimals(normalizeMint(fromMint));
      const outDec = await getTokenDecimals(normalizeMint(toMint));
      // Use Pump.fun quote endpoint (amount in UI units)
      const q = await pumpQuote(normalizeMint(fromMint), normalizeMint(toMint), n);
      if (!q) throw new Error('No route');
      const outRaw = q?.outAmountAtomic || q?.outAmount || 0;
      setAmountOut((outRaw/Math.pow(10, outDec)).toLocaleString(undefined,{ maximumFractionDigits: 6 }));
      const pi = q?.priceImpactPct ?? q?.priceImpact ?? null;
      if (pi != null) setPriceImpact(((Number(pi)||0)*100).toFixed(2)+"%");
    } catch (e:any) {
      setErr(e?.message || 'Quote failed');
    }
  };

  const handleSwap = async () => {
    if (!unlocked || !keypair) { setShowUnlock(true); return; }
    setLoading(true); setErr("");
    try {
      const sig = await pumpExecute({ publicKey: keypair.publicKey, signTransaction: async (tx:any) => { tx.sign([keypair]); return tx; } }, normalizeMint(fromMint), normalizeMint(toMint), Number(amountIn));
      try { window.dispatchEvent(new CustomEvent('swap-complete', { detail: { fromMint, toMint, amount: Number(amountIn), signature: sig } })); } catch {}
      onClose();
    } catch (e:any) {
      setErr(e?.message || 'Swap failed');
    } finally { setLoading(false); }
  };

  const TokenEdit = ({ label, value, onChange, show, setShow }: any) => (
    <div className="mt-2">
      {!show && <button type="button" className="text-[11px] underline text-white/60" onClick={()=>setShow(true)}>Change {label}</button>}
      {show && (
        <div className="flex gap-2 items-center">
          <input value={value}
            onChange={(e)=>onChange(e.target.value.trim())}
            placeholder="Paste SPL mint (base58)"
            className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[12px] font-mono outline-none" />
          <button className="btn btn-xs" onClick={()=>setShow(false)}>Done</button>
        </div>
      )}
    </div>
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#111] text-white w-full sm:w-[420px] rounded-t-3xl sm:rounded-2xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Swap</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-1">You Pay</div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amountIn}
              onChange={(e)=>handleQuote(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))}
              className="bg-transparent text-3xl outline-none w-full"
            />
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-white/40">Mint</div>
              <div className="font-mono text-[10px] max-w-[200px] truncate" title={fromMint}>{fromMint}</div>
            </div>
          </div>
          <TokenEdit label="From" value={fromMint} onChange={setFromMint} show={showFromEdit} setShow={setShowFromEdit} />
        </div>
        <div className="flex justify-center mb-3">
          <button className="bg-[#222] p-2 rounded-full hover:bg-[#333]" onClick={()=>{ const a = fromMint; setFromMint(toMint); setToMint(a); setAmountOut(""); if (amountIn) handleQuote(amountIn); }}>⇅</button>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-2">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-1">You Receive</div>
          <div className="flex items-center justify-between gap-2">
            <input type="text" readOnly value={amountOut} placeholder="0" className="bg-transparent text-3xl outline-none w-full" />
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-white/40">Mint</div>
              <div className="font-mono text-[10px] max-w-[200px] truncate" title={toMint}>{toMint}</div>
            </div>
          </div>
          <TokenEdit label="To" value={toMint} onChange={(m:string)=>{ setToMint(m); setAmountOut(""); if (amountIn) handleQuote(amountIn); }} show={showToEdit} setShow={setShowToEdit} />
          {priceImpact && <div className="text-[11px] text-white/50 mt-2">Price Impact: {priceImpact}</div>}
        </div>
        {err && <div className="text-[12px] text-red-400 mb-2">{err}</div>}
        <button onClick={handleSwap} disabled={loading || !amountIn} className="bg-gradient-to-r from-purple-500 to-indigo-500 w-full py-3 rounded-xl font-semibold disabled:opacity-50">
          {loading ? 'Swapping…' : 'Swap'}
        </button>
        {trending.length>0 && (
          <div className="mt-6">
            <h3 className="text-sm text-gray-400 mb-2">Trending Tokens</h3>
            <div className="space-y-3">
              {trending.map((t:any, i:number) => (
                <button key={i} type="button" onClick={()=>{ const m = t.mint || t.address || t.tokenAddress || t.symbol || ''; if (m) { setToMint(m); setAmountOut(''); if (amountIn) handleQuote(amountIn); } }} className="w-full flex justify-between items-center bg-[#181818] rounded-xl px-3 py-2 hover:bg-[#202020]">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.logoURI || t.image || '/logo-192.png'} alt={t.symbol || 'token'} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-semibold">{t.symbol || t.ticker || 'Token'}</span>
                  </div>
                  <div className="text-sm text-gray-300">{t.priceUsd ? `$${t.priceUsd}` : '—'}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {showUnlock && (
          // Lazy-load UnlockModal to avoid circular dep typing here
          React.createElement(require('./UnlockModal').default, { onUnlock: async (p:string)=>{ await unlock(p); setShowUnlock(false); }, onBiometricUnlock: async ()=>{ const ok = await tryBiometricUnlock(); if (ok) setShowUnlock(false); return ok; }, onClose: ()=>setShowUnlock(false) })
        )}
      </div>
    </div>
  );
}
