"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "../../components/WalletProvider";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { getRpcEndpoint } from "../../lib/wallet";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export default function SwapPage() {
  const { address, keypair } = useWallet() as any;
  const [fromMint, setFromMint] = useState<string>(SOL_MINT);
  const [toMint, setToMint] = useState<string>(USDC_MINT);
  const [amount, setAmount] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [sig, setSig] = useState<string>("");

  const canSwap = !!keypair && !!address;

  const getQuote = async () => {
    setErr(""); setQuote(null); setLoading(true);
    try {
      const url = `/api/swap/quote?in=${encodeURIComponent(fromMint)}&out=${encodeURIComponent(toMint)}&amount=${encodeURIComponent(amount || '0')}`;
      const r = await fetch(url, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setQuote(j);
    } catch (e: any) {
      setErr(e?.message || 'Quote failed');
    } finally { setLoading(false); }
  };

  const openJupiter = () => {
    const url = `https://jup.ag/swap/${fromMint}-${toMint}`;
    try { window.open(url, '_blank'); } catch { location.href = url; }
  };

  const executeSwap = async () => {
    if (!keypair || !address) { setErr('Unlock wallet first'); return; }
    const amt = Number(amount);
    if (!(amt > 0)) { setErr('Enter amount'); return; }
    setErr(""); setSwapping(true); setSig("");
    try {
      const res = await fetch('/api/swap/prepare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ inputMint: fromMint, outputMint: toMint, amount: amt, slippageBps: 50, userPublicKey: address })
      });
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
      const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 3 });
      setSig(sig);
    } catch (e: any) {
      setErr(e?.message || 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Swap</h1>
      <div className="glass rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-white/60 mb-1">From</div>
            <select value={fromMint} onChange={(e)=>setFromMint(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm">
              <option value={SOL_MINT}>SOL</option>
              <option value={USDC_MINT}>USDC</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">To</div>
            <select value={toMint} onChange={(e)=>setToMint(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm">
              <option value={USDC_MINT}>USDC</option>
              <option value={SOL_MINT}>SOL</option>
            </select>
          </div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Amount</div>
          <input value={amount} onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-xs" onClick={getQuote} disabled={loading || !amount}>{loading? 'Loading...' : 'Get Quote'}</button>
          <button className="btn btn-xs" onClick={openJupiter}>Open in Jupiter</button>
          <button className="btn btn-xs" onClick={executeSwap} disabled={swapping || !canSwap || !amount}>{swapping ? 'Swapping...' : 'Swap'}</button>
        </div>
        {err && <div className="text-xs text-red-400">{err}</div>}
        {quote && (
          <div className="text-xs text-white/70">
            Best quote via Jupiter. Price impact: {quote.priceImpactPct ? (quote.priceImpactPct*100).toFixed(2) : '—'}%.
          </div>
        )}
        {sig && (
          <div className="text-xs text-green-400 break-all">Submitted: {sig} <a className="underline" href={`https://explorer.solana.com/tx/${sig}`} target="_blank" rel="noreferrer">view</a></div>
        )}
      </div>
      <div className="text-xs text-white/60">Note: In-app swap execution will be enabled when aggregator access is configured. For now, use the Jupiter link for secure swaps.</div>
    </div>
  );
}
