"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../../../components/WalletProvider";

type TopupResponse = { ok: boolean; credited?: number; error?: string; quote?: any };

export default function TopupPage() {
  const { address } = useWallet();
  const [tab, setTab] = useState<'crypto' | 'fiat'>('crypto');
  const [amount, setAmount] = useState<string>("");
  const [usd, setUsd] = useState<string>("");
  const [est, setEst] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) { setEst(null); return; }
    // Client-side estimate mirrors backend fee/slippage (0.5% + 0.5%)
    const price = 1.0;
    const gross = a * price, fee = gross * 0.005, slip = gross * 0.005;
    setEst(Math.max(0, gross - fee - slip));
  }, [amount]);

  const submit = async () => {
    setErr(""); setMsg("");
    if (!address) { setErr('No wallet'); return; }
    if (tab === 'crypto') {
      const a = Number(amount);
      if (!Number.isFinite(a) || a <= 0) { setErr('Enter a valid amount'); return; }
      if (a < 0.01) { setErr('Minimum 0.01 DOPE'); return; }
      setPending(true);
      try {
        const res: TopupResponse = await fetch('/api/card/topup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pubkey: address, amount: a }) }).then(r=>r.json());
        if (!res.ok) throw new Error(res.error || 'Top-up failed');
        setMsg(`Credited ${(res.credited||0).toFixed(2)} USDC`);
        setAmount("");
      } catch (e: any) {
        setErr(e?.message || 'Failed to top-up');
      } finally {
        setPending(false);
      }
    } else {
      const u = Number(usd);
      if (!Number.isFinite(u) || u <= 0) { setErr('Enter a valid USD amount'); return; }
      if (u < 1) { setErr('Minimum $1'); return; }
      setPending(true);
      try {
        // For dev, we call fiat stub with provider inferred from platform
        const provider = /iphone|ipad|mac/i.test(navigator.userAgent) ? 'apple' : 'google';
        const res: any = await fetch('/api/card/topup-fiat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pubkey: address, amountUsd: u, provider }) }).then(r=>r.json());
        if (!res?.ok) throw new Error(res?.error || 'Fiat top-up failed');
        setMsg(`Credited ${(res.credited||0).toFixed(2)} USDC via ${provider==='apple'?'Apple Pay':'Google Pay'}`);
        setUsd("");
      } catch (e: any) {
        setErr(e?.message || 'Failed to top-up (fiat)');
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Top Up Card</h1>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
        <div className="flex gap-2 text-sm">
          <button className={`px-3 py-2 rounded-full ${tab==='crypto'?'bg-white text-black':'bg-white/10 text-white'}`} onClick={()=>setTab('crypto')}>Crypto (DOPE → USDC)</button>
          <button className={`px-3 py-2 rounded-full ${tab==='fiat'?'bg-white text-black':'bg-white/10 text-white'}`} onClick={()=>setTab('fiat')}>Card (Apple/Google Pay)</button>
        </div>
        {tab === 'crypto' ? (
          <>
            <div className="text-xs text-white/60">Amount in DOPE</div>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e)=>setAmount(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none text-lg"
            />
            {est !== null && (
              <div className="text-sm text-white/70">Est. receive: <span className="font-semibold text-white">{est.toFixed(2)} USDC</span></div>
            )}
          </>
        ) : (
          <>
            <div className="text-xs text-white/60">Amount (USD)</div>
            <input
              inputMode="decimal"
              value={usd}
              onChange={(e)=>setUsd(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none text-lg"
            />
            <div className="text-xs text-white/60">Charged via Apple Pay / Google Pay, credited as USDC to your card (minus ~1.5% fee).</div>
          </>
        )}
        {err && <div className="text-xs text-red-400">{err}</div>}
        {msg && <div className="text-xs text-green-400">{msg}</div>}
        <button className="btn w-full" onClick={submit} disabled={pending || (tab==='crypto' ? !amount : !usd)}>{pending ? 'Processing...' : 'Top Up Card'}</button>
        {tab === 'crypto' ? (
          <div className="text-xs text-white/60">This is a development stub. In production, this will require a DOPE token transfer to the CardVault program and on-chain swap to USDC with slippage protection.</div>
        ) : (
          <div className="text-xs text-white/60">Apple/Google Pay requires merchant configuration. This call is currently stubbed to credit your demo card balance.</div>
        )}
      </div>

      <div className="text-sm">
        <Link href="/wallet/card" className="underline">Back to Card</Link>
      </div>
    </div>
  );
}
