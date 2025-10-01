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
      {address && (
        <div className="flex items-start gap-3">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(address)}`}
            alt="Wallet QR"
            width={160}
            height={160}
            className="rounded bg-white p-2"
          />
          <div className="text-xs text-white/70 leading-5">
            Scan to receive to your address. You can also share or copy your address above.
          </div>
        </div>
      )}
      <button onClick={copy} className="w-full btn">Copy</button>
      <div className="text-xs text-white/50">Tip: Share this address to receive SOL or tokens.</div>
    </div>
  );
}
