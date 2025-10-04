"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "../../components/WalletProvider";
import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { getRpcEndpoint } from "../../lib/wallet";
import { getTokenDecimals } from "../../lib/tokenMetadataCache";

// Optional default (user can overwrite immediately)
const DEFAULT_FROM = "So11111111111111111111111111111111111111112"; // wSOL

function isValidBase58(m: string): boolean { try { new PublicKey(m); return true; } catch { return false; } }

export default function SwapPage() {
  const { address, keypair } = useWallet() as any;
  const [fromMint, setFromMint] = useState<string>(DEFAULT_FROM);
  const [toMint, setToMint] = useState<string>("");
  const [fromDecimals, setFromDecimals] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>(""); // UI amount
  const [amountAtomic, setAmountAtomic] = useState<number>(0);
  const [quote, setQuote] = useState<any>(null);
  const [minReceive, setMinReceive] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [sig, setSig] = useState<string>("");

  const canSwap = !!keypair && !!address;

  useEffect(() => {
    setFromDecimals(null);
    if (!isValidBase58(fromMint)) return;
    getTokenDecimals(fromMint).then(setFromDecimals).catch(()=>setFromDecimals(null));
  }, [fromMint]);

  useEffect(() => {
    if (!fromDecimals || !amount) { setAmountAtomic(0); return; }
    const n = Number(amount);
    if (!(n > 0)) { setAmountAtomic(0); return; }
    setAmountAtomic(Math.floor(n * Math.pow(10, fromDecimals)));
  }, [amount, fromDecimals]);

  const swapDirection = () => {
    setQuote(null); setMinReceive(""); setErr(""); setInfo("Switched");
    setFromMint(toMint);
    setToMint(fromMint);
  };

  const getQuote = async () => {
    setErr(""); setInfo(""); setQuote(null); setMinReceive("");
    if (!isValidBase58(fromMint) || !isValidBase58(toMint)) { setErr('Invalid mint'); return; }
    if (fromMint === toMint) { setErr('Different tokens required'); return; }
    if (!(amountAtomic > 0)) { setErr('Enter amount'); return; }
    setLoading(true);
    try {
      const url = `/api/swap/quote?in=${encodeURIComponent(fromMint)}&out=${encodeURIComponent(toMint)}&amountAtomic=${encodeURIComponent(String(amountAtomic))}`;
      const r = await fetch(url, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setQuote(j);
      const outRaw = j?.outAmount || 0;
      const outDec = await getTokenDecimals(toMint).catch(()=>9);
      const slipFactor = 1 - (50 / 10_000); // 50 bps example
      const min = (outRaw / Math.pow(10, outDec)) * slipFactor;
      setMinReceive(min.toLocaleString(undefined,{ maximumFractionDigits: 6 }));
    } catch (e:any) {
      setErr(e?.message || 'Quote failed');
    } finally { setLoading(false); }
  };

  const openJupiter = () => {
    const url = `https://jup.ag/swap/${fromMint}-${toMint}`;
    try { window.open(url, '_blank'); } catch { location.href = url; }
  };

  const executeSwap = async () => {
    if (!keypair || !address) { setErr('Unlock wallet first'); return; }
    if (!isValidBase58(fromMint) || !isValidBase58(toMint)) { setErr('Invalid mint'); return; }
    if (fromMint === toMint) { setErr('Different tokens required'); return; }
    if (!(amountAtomic > 0)) { setErr('Enter amount'); return; }
    setErr(""); setInfo(""); setSwapping(true); setSig("");
    try {
      const body = { inputMint: fromMint, outputMint: toMint, amountAtomic, slippageBps: 50, userPublicKey: address };
      const res = await fetch('/api/swap/prepare', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);
      const txB64 = j?.swapTransaction as string;
      if (!txB64) throw new Error('No transaction');
      const raw = atob(txB64);
      const txBytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) txBytes[i] = raw.charCodeAt(i);
      const tx = VersionedTransaction.deserialize(txBytes);
      tx.sign([keypair]);
      const conn = new Connection(getRpcEndpoint(), { commitment: 'confirmed' } as any);
      const txid = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 3 });
      setSig(txid);
      setInfo('Swap submitted');
    } catch (e:any) {
      setErr(e?.message || 'Swap failed');
    } finally { setSwapping(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Swap (Any SPL)</h1>
      <div className="glass rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-white/60 mb-1">From (SPL Mint Address)</div>
            <input
              value={fromMint}
              onChange={e => setFromMint(e.target.value.trim())}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm font-mono"
              placeholder="Enter SPL mint address"
            />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">To (SPL Mint Address)</div>
            <input
              value={toMint}
              onChange={e => setToMint(e.target.value.trim())}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm font-mono"
              placeholder="Enter SPL mint address"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button type="button" onClick={swapDirection} className="text-[10px] text-white/60 hover:text-white underline">Swap Direction ⇅</button>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Amount</div>
          <input value={amount} onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
          <div className="text-[10px] text-white/40 mt-1">{fromDecimals !== null ? `Decimals: ${fromDecimals} | Atomic: ${amountAtomic}` : isValidBase58(fromMint) ? 'Resolving decimals…' : 'Enter valid from mint'}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-xs" onClick={getQuote} disabled={loading || !amountAtomic}>{loading? 'Loading...' : 'Get Quote'}</button>
          <button className="btn btn-xs" onClick={openJupiter}>Open in Jupiter</button>
          <button className="btn btn-xs" onClick={executeSwap} disabled={swapping || !canSwap || !amountAtomic}>{swapping ? 'Swapping...' : 'Swap'}</button>
        </div>
        {err && <div className="text-xs text-red-400">{err}</div>}
        {info && !err && <div className="text-xs text-green-400">{info}</div>}
        {quote && (
          <div className="text-xs text-white/70">
            Route hops: {(quote.marketInfos?.length || 1)} | Price impact: {quote.priceImpactPct ? (quote.priceImpactPct*100).toFixed(2) : '—'}%{minReceive ? ` | Min receive ≈ ${minReceive}` : ''}
          </div>
        )}
        {sig && (
          <div className="text-xs text-green-400 break-all">Submitted: {sig} <a className="underline" href={`https://explorer.solana.com/tx/${sig}`} target="_blank" rel="noreferrer">view</a></div>
        )}
      </div>
      <div className="text-xs text-white/60">Paste ANY SPL token mints. We auto-derive decimals and use atomic amounts for quotes.</div>
      <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded p-2">
        Non‑custodial software. Swaps are routed via third‑party aggregators; prices are estimates and can change at execution. Transactions are irreversible; network fees apply. No financial or investment advice.
      </div>
    </div>
  );
}
