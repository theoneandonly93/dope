"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";
import { getConnection } from "../lib/wallet";
import { getTokenDecimals } from "../lib/tokenMetadataCache";
import { getTokenInfo, normalizeMint, searchTokens } from "../lib/tokenInfo";
import { getQuote as pumpQuote, executeSwap as pumpExecute, PumpQuoteOptions } from "../lib/pumpfunSwap";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";

type Props = {
  open: boolean;
  onClose: () => void;
  initialFromMint?: string;
  initialToMint?: string;
  initialAmountIn?: string;
  variant?: 'modal' | 'inline';
  showTrending?: boolean; // control embedded trending list visibility
};

// normalizeMint moved to lib/tokenInfo

function isValidBase58(m: string) { try { new PublicKey(m); return true; } catch { return false; } }

export default function PhantomSwapModal({ open, onClose, initialFromMint, initialToMint, initialAmountIn, variant='modal', showTrending=true }: Props) {
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
  const [showSettings, setShowSettings] = useState(false);
  // Settings
  const [slippagePct, setSlippagePct] = useState<number>(1); // default 1%
  const [priorityFee, setPriorityFee] = useState<number>(0); // micro-lamports per CU
  const [tipSol, setTipSol] = useState<number>(0);
  const [minReceived, setMinReceived] = useState<string>("");
  const [fromInfo, setFromInfo] = useState<any>(null);
  const [toInfo, setToInfo] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    fetch("https://api.pump.fun/trending").then(r=>r.json()).then((d:any)=>{
      const list = Array.isArray(d) ? d.slice(0,5) : [];
      setTrending(list);
    }).catch(()=>setTrending([]));
  }, [open]);

  // Apply initial mints when opening
  useEffect(() => {
    if (!open) return;
    if (initialFromMint && isValidBase58(normalizeMint(initialFromMint))) setFromMint(initialFromMint);
    if (initialToMint && isValidBase58(normalizeMint(initialToMint))) setToMint(initialToMint);
    // set initial amount if provided
    if (initialAmountIn && initialAmountIn !== amountIn) {
      setAmountIn(initialAmountIn);
      handleQuote(initialAmountIn);
    } else if (amountIn) {
      handleQuote(amountIn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialFromMint, initialToMint]);

  // Resolve token info for display
  useEffect(() => {
    getTokenInfo(fromMint).then(setFromInfo).catch(()=>setFromInfo(null));
  }, [fromMint]);
  useEffect(() => {
    getTokenInfo(toMint).then(setToInfo).catch(()=>setToInfo(null));
  }, [toMint]);

  const handleQuote = async (v: string) => {
    setAmountIn(v);
    setErr("");
    setAmountOut("");
    setPriceImpact("");
    setMinReceived("");
    const n = Number(v);
    if (!(n>0)) return;
    if (!isValidBase58(normalizeMint(fromMint)) || !isValidBase58(normalizeMint(toMint))) { setErr('Invalid mint'); return; }
    try {
      const inDec = await getTokenDecimals(normalizeMint(fromMint));
      const outDec = await getTokenDecimals(normalizeMint(toMint));
      // Use Pump.fun quote endpoint (amount in UI units)
      let q = await pumpQuote(normalizeMint(fromMint), normalizeMint(toMint), n, settingsToOpts());
      // Fallback to Jupiter v6 via our server route if Pump.fun has no route
      if (!q) {
        const amountAtomic = Math.floor(n * Math.pow(10, inDec));
        const p = new URLSearchParams({ in: normalizeMint(fromMint), out: normalizeMint(toMint), amountAtomic: String(amountAtomic) });
        try {
          const jr = await fetch(`/api/swap/quote?${p.toString()}`, { cache: 'no-store' });
          const jj = await jr.json();
          if (jr.ok && jj && jj.outAmount) {
            q = { outAmountAtomic: jj.outAmount, priceImpactPct: jj.priceImpactPct ?? 0 } as any;
          }
        } catch {}
      }
      if (!q) throw new Error('No route');
      const outRaw = q?.outAmountAtomic || q?.outAmount || 0;
      setAmountOut((outRaw/Math.pow(10, outDec)).toLocaleString(undefined,{ maximumFractionDigits: 6 }));
      const pi = q?.priceImpactPct ?? q?.priceImpact ?? null;
      if (pi != null) setPriceImpact(((Number(pi)||0)*100).toFixed(2)+"%");
      // Minimum received: apply slippage
      const outUi = outRaw/Math.pow(10, outDec);
      const minUi = outUi * (1 - (Number(slippagePct)||0)/100);
      setMinReceived(minUi.toLocaleString(undefined,{ maximumFractionDigits: 6 }));
    } catch (e:any) {
      setErr(e?.message || 'Quote failed');
    }
  };

  const handleSwap = async () => {
    if (!unlocked || !keypair) { setShowUnlock(true); return; }
    setLoading(true); setErr("");
    try {
      const sig = await pumpExecute({ publicKey: keypair.publicKey, signTransaction: async (tx:any) => { tx.sign([keypair]); return tx; } }, normalizeMint(fromMint), normalizeMint(toMint), Number(amountIn), settingsToOpts());
      try { window.dispatchEvent(new CustomEvent('swap-complete', { detail: { fromMint, toMint, amount: Number(amountIn), signature: sig } })); } catch {}
      onClose();
    } catch (e:any) {
      setErr(e?.message || 'Swap failed');
    } finally { setLoading(false); }
  };

  function settingsToOpts(): PumpQuoteOptions {
    return {
      slippagePct: isFinite(slippagePct as any) ? slippagePct : 0,
      priorityFeeMicrolamports: isFinite(priorityFee as any) ? priorityFee : undefined,
      tipSol: isFinite(tipSol as any) ? tipSol : undefined,
    };
  }

  const TokenEdit = ({ label, value, onChange, show, setShow }: any) => {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      if (!show) return;
      setQuery("");
      setResults([]);
    }, [show, value]);

    useEffect(() => {
      if (!show) return;
      const q = query.trim();
      if (!q) { setResults([]); return; }
      setSearching(true);
      const id = setTimeout(async () => {
        try {
          const r = await searchTokens(q, { limit: 8 });
          setResults(r || []);
        } finally { setSearching(false); }
      }, 200);
      return () => clearTimeout(id);
    }, [query, show]);

    function short(m: string) { return m?.length > 10 ? `${m.slice(0,4)}…${m.slice(-4)}` : m; }
    const handleSelect = (m: string) => { onChange(normalizeMint(m)); setShow(false); };
    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === 'Enter') {
        if (isValidBase58(query)) return handleSelect(query.trim());
        if (results.length > 0) return handleSelect(results[0].mint);
      }
    };

    return (
      <div className="mt-2">
        {!show && <button type="button" className="text-[11px] underline text-white/60" onClick={()=>setShow(true)}>Change {label}</button>}
        {show && (
          <div className="">
            <div className="flex gap-2 items-center">
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search name or paste mint"
                type="search"
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-3 text-base outline-none min-h-[44px]" />
              <button className="btn btn-xs" onClick={()=>setShow(false)}>Done</button>
            </div>
            {(searching || results.length>0 || isValidBase58(query)) && (
              <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-white/10 bg-black/40">
                {isValidBase58(query) && (
                  <button type="button" onClick={()=>handleSelect(query.trim())} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2">
                    <span className="text-[11px] text-white/50">Use address</span>
                    <span className="font-mono text-[12px]">{short(query.trim())}</span>
                  </button>
                )}
                {results.map((t:any, i:number) => (
                  <button key={i} type="button" onClick={()=>handleSelect(t.mint)} className="w-full px-3 py-2 hover:bg-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.logo || '/logo-192.png'} alt={t.symbol} className="w-5 h-5 rounded-full" />
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-semibold">{t.symbol}</div>
                        <div className="text-[10px] text-white/40">{t.name}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">{short(t.mint)}</div>
                  </button>
                ))}
                {searching && <div className="px-3 py-2 text-[12px] text-white/50">Searching…</div>}
                {!searching && results.length===0 && !isValidBase58(query) && query.trim() && (
                  <div className="px-3 py-2 text-[12px] text-white/50">No matches</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!open && variant !== 'inline') return null;
  const Container = variant === 'modal' ? 'div' : React.Fragment as any;
  const containerProps = variant === 'modal' ? { className: "fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" } : {};
  return (
    <Container {...containerProps}>
      <div className={variant==='modal' ? "bg-[#111] text-white w-full sm:w-[420px] rounded-t-3xl sm:rounded-2xl p-6 border border-white/10" : "bg-[#111] text-white w-full rounded-2xl p-4 border border-white/10"}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Swap</h2>
          <div className="flex items-center gap-2">
            <button title="Settings" onClick={()=>setShowSettings(s=>!s)} className="text-gray-300 hover:text-white">⚙️</button>
            {variant==='modal' && <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>}
          </div>
        </div>
        {showSettings && (
          <div className="bg-[#151515] border border-white/10 rounded-xl p-4 mb-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-white/60">Slippage tolerance (%)</label>
                <input type="number" min={0} step={0.1} value={slippagePct}
                  onChange={(e)=>{ const v = parseFloat(e.target.value); setSlippagePct(isNaN(v)?0:v); if (amountIn) handleQuote(amountIn); }}
                  className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-3 text-base sm:text-sm outline-none min-h-[44px]" />
              </div>
              <div>
                <label className="text-xs text-white/60">Priority fee (µ-lamports/CU)</label>
                <input type="number" min={0} step={100} value={priorityFee}
                  onChange={(e)=>{ const v = parseFloat(e.target.value); setPriorityFee(isNaN(v)?0:v); }}
                  className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-3 text-base sm:text-sm outline-none min-h-[44px]" />
              </div>
              <div>
                <label className="text-xs text-white/60">Tip (SOL)</label>
                <input type="number" min={0} step={0.001} value={tipSol}
                  onChange={(e)=>{ const v = parseFloat(e.target.value); setTipSol(isNaN(v)?0:v); }}
                  className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-3 text-base sm:text-sm outline-none min-h-[44px]" />
              </div>
            </div>
          </div>
        )}
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
            <button type="button" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5" onClick={()=>setShowFromEdit(s=>!s)} title={fromMint}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fromInfo?.logo || '/logo-192.png'} alt={fromInfo?.symbol || 'token'} className="w-6 h-6 rounded-full" />
              <div className="flex flex-col items-end">
                <div className="text-sm font-semibold">{fromInfo?.symbol || 'Token'}</div>
                <div className="text-[10px] text-white/40 max-w-[160px] truncate">{fromInfo?.name || 'Unknown'}</div>
              </div>
            </button>
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
            <button type="button" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5" onClick={()=>setShowToEdit(s=>!s)} title={toMint}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toInfo?.logo || '/logo-192.png'} alt={toInfo?.symbol || 'token'} className="w-6 h-6 rounded-full" />
              <div className="flex flex-col items-end">
                <div className="text-sm font-semibold">{toInfo?.symbol || 'Token'}</div>
                <div className="text-[10px] text-white/40 max-w-[160px] truncate">{toInfo?.name || 'Unknown'}</div>
              </div>
            </button>
          </div>
          <TokenEdit label="To" value={toMint} onChange={(m:string)=>{ setToMint(m); setAmountOut(""); if (amountIn) handleQuote(amountIn); }} show={showToEdit} setShow={setShowToEdit} />
          {priceImpact && <div className="text-[11px] text-white/50 mt-2">Price Impact: {priceImpact}</div>}
          {minReceived && <div className="text-[11px] text-white/50 mt-1">Minimum received (est.): {minReceived}</div>}
        </div>
        {err && <div className="text-[12px] text-red-400 mb-2">{err}</div>}
        <button onClick={handleSwap} disabled={loading || !amountIn} className="bg-gradient-to-r from-purple-500 to-indigo-500 w-full py-3 rounded-xl font-semibold disabled:opacity-50">
          {loading ? 'Swapping…' : 'Swap'}
        </button>
        {trending.length>0 && showTrending && (
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
    </Container>
  );
}
