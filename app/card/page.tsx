"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../components/WalletProvider";
import { getActiveWallet } from "../../lib/wallet";

export default function CardPage() {
  const { address } = useWallet();
  const [name, setName] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    try { setName(getActiveWallet()?.name || ""); } catch {}
  }, []);

  const holder = name || (address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "Unknown");
  const maskedAddr = useMemo(() => {
    if (!address) return "";
    const a = address.replace(/\s+/g, "");
    // Show first 6 and last 4, mask middle
    return `${a.slice(0, 6)} ${"•".repeat(4)} ${"•".repeat(4)} ${a.slice(-4)}`;
  }, [address]);

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Virtual Card</h1>

      <div className="rounded-2xl p-5 border border-white/10"
           style={{
             background: "linear-gradient(135deg, rgba(165,140,255,0.25), rgba(60,60,120,0.35))",
           }}>
        <div className="flex items-center justify-between">
          <div className="text-white/80 text-sm">DOPE</div>
          <div className={`text-xs px-2 py-1 rounded-full ${frozen ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/80'}`}>{frozen ? 'Frozen' : 'Active'}</div>
        </div>
        <div className="mt-6 font-mono text-lg tracking-widest select-all">
          {showDetails && address ? address : maskedAddr || '—'}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-white/80">
            <div className="text-[11px] uppercase opacity-70">Cardholder</div>
            <div className="font-semibold">{holder}</div>
          </div>
          <div className="text-white/80 text-right">
            <div className="text-[11px] uppercase opacity-70">Network</div>
            <div className="font-semibold">DOPE</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex gap-2">
          <button className="btn" onClick={() => setShowDetails(s => !s)}>{showDetails ? 'Hide Details' : 'Show Details'}</button>
          <button className="btn" onClick={() => setFrozen(f => !f)}>{frozen ? 'Unfreeze' : 'Freeze'}</button>
        </div>
        <div className="text-xs text-white/60">This is a virtual display linked to your wallet address for easy sharing and receiving. Never share your seed phrase or secret key.</div>
        <div className="flex gap-2">
          <Link href="/wallet/receive" className="btn">Receive</Link>
          <Link href="/wallet/send" className="btn">Send</Link>
        </div>
      </div>

      {!address && (
        <div className="text-white/70 text-sm">No wallet yet. <Link href="/get-started" className="underline">Create one</Link>.</div>
      )}
    </div>
  );
}

