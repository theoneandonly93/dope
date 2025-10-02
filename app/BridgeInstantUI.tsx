import React, { useState } from "react";

export interface BridgeInstantUIProps {
  mint: string;
  name: string;
  balance: number | null;
  onClose: () => void;
}

export default function BridgeInstantUI({ mint, name, balance, onClose }: BridgeInstantUIProps) {
  const [toChain, setToChain] = useState("eth");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const CHAINS = [
    { id: "solana", name: "Solana" },
    { id: "eth", name: "Ethereum" },
    { id: "bnb", name: "BNB Chain" },
    { id: "btc", name: "Bitcoin" },
    { id: "ape", name: "Ape Chain" }
  ];
  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    // Stub: Integrate Wormhole API here
    setTimeout(() => {
      setStatus(`Bridging ${amount} ${name} to ${toChain} via Wormhole... (demo)`);
      setLoading(false);
    }, 2000);
  };
  return (
    <form onSubmit={handleBridge} className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <span className="text-white/60">To Chain:</span>
        <select value={toChain} onChange={e => setToChain(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white">
          {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <input
        type="number"
        min="0"
        max={balance ?? undefined}
        step="any"
        className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
        placeholder={`Amount (max ${balance ?? "—"})`}
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button className="btn" type="submit" disabled={loading}>{loading ? "Bridging..." : "Bridge"}</button>
      {status && <div className="text-green-400 text-xs mt-2">{status}</div>}
      <button className="btn mt-2" type="button" onClick={onClose}>Close</button>
      <div className="mt-2 text-xs text-white/60 text-center">Powered by Wormhole. Real bridging logic can be integrated with Wormhole SDK or API.<br />This is a demo UI for instant bridging.</div>
    </form>
  );
}