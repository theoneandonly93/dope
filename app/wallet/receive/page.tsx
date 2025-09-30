"use client";
import React from "react";
import { useWallet } from "../../../components/WalletProvider";

export default function ReceivePage() {
  const { address } = useWallet();

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      alert("Address copied");
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Receive</h1>
      <div className="text-xs text-white/60">Your address</div>
      <div className="glass rounded-xl p-4 border border-white/5 font-mono break-all">{address}</div>
      <button onClick={copy} className="w-full btn">Copy</button>
      <div className="text-xs text-white/50">Tip: Share this address to receive SOL or tokens.</div>
    </div>
  );
}
