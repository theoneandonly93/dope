"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../../../components/WalletProvider";

type TopupResponse = { ok: boolean; credited?: number; error?: string; quote?: any };

export default function TopupPage() {
  const { address } = useWallet();
  const [amount, setAmount] = useState<string>("");
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
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) { setErr('Enter a valid amount'); return; }
    if (a < 0.01) { setErr('Minimum 0.01 DOPE'); return; }
    setPending(true);
    try {
      // DEV: call topup stub (signature optional)
      const res: TopupResponse = await fetch('/api/card/topup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pubkey: address, amount: a }) }).then(r=>r.json());
      if (!res.ok) throw new Error(res.error || 'Top-up failed');
      setMsg(`Credited ${(res.credited||0).toFixed(2)} USDC`);
      setAmount("");
    } catch (e: any) {
      setErr(e?.message || 'Failed to top-up');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Top Up Card</h1>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
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
        {err && <div className="text-xs text-red-400">{err}</div>}
        {msg && <div className="text-xs text-green-400">{msg}</div>}
        <button className="btn w-full" onClick={submit} disabled={pending || !amount}>{pending ? 'Processing...' : 'Top Up Card'}</button>
        <div className="text-xs text-white/60">This is a development stub. In production, this will require a DOPE token transfer to the CardVault program and on-chain swap to USDC with slippage protection.</div>
      </div>

      <div className="text-sm">
        <Link href="/wallet/card" className="underline">Back to Card</Link>
      </div>
    </div>
  );
}

