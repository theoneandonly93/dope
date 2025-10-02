"use client";
import React, { useState } from "react";

const CHAINS = [
  { id: "solana", name: "Solana" },
  { id: "eth", name: "Ethereum" },
  { id: "bnb", name: "BNB Chain" },
  { id: "btc", name: "Bitcoin" },
  { id: "ape", name: "Ape Chain" }
];

export default function BridgePage() {
  const [fromChain, setFromChain] = useState("solana");
  const [toChain, setToChain] = useState("eth");
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    // Stub: Integrate Wormhole API here
    setTimeout(() => {
      setStatus(`Bridging ${amount} ${token} from ${fromChain} to ${toChain} via Wormhole... (demo)`);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-8 px-4">
      <h1 className="text-xl font-bold mb-4">Bridge Tokens (Wormhole)</h1>
      <form onSubmit={handleBridge} className="w-full max-w-md flex flex-col gap-3 mb-4">
        <div className="flex gap-2">
          <select value={fromChain} onChange={e => setFromChain(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white">
            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-white/60 font-bold">→</span>
          <select value={toChain} onChange={e => setToChain(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white">
            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <input
          type="text"
          className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
          placeholder="Token symbol or address (e.g. SOL, ETH, BNB)"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        <input
          type="number"
          min="0"
          step="any"
          className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button className="btn" type="submit" disabled={loading}>{loading ? "Bridging..." : "Bridge"}</button>
      </form>
      {status && <div className="text-green-400 text-sm mb-2">{status}</div>}
      <div className="mt-6 text-xs text-white/60 text-center">
        Powered by Wormhole. Real bridging logic can be integrated with Wormhole SDK or API.<br />
        This is a demo UI. Please specify token and amount to bridge between chains.
      </div>
    </div>
  );
}
