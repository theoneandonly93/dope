"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSelectedNetwork, setSelectedNetwork, type NetworkChoice } from "../../../lib/wallet";

export default function DeveloperSettingsPage() {
  const router = useRouter();
  const [net, setNet] = useState<NetworkChoice>('mainnet');
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setNet(getSelectedNetwork());
  }, []);

  const save = () => {
    setSelectedNetwork(net);
    setMsg("Saved. Some data may require a refresh.");
    setTimeout(()=>setMsg(""), 1500);
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Developer Settings</h1>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="text-sm font-semibold">Network</div>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="net" checked={net==='mainnet'} onChange={()=>setNet('mainnet')} />
            <span>Mainnet</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="net" checked={net==='devnet'} onChange={()=>setNet('devnet')} />
            <span>Devnet</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="net" checked={net==='testnet'} onChange={()=>setNet('testnet')} />
            <span>Testnet</span>
          </label>
        </div>
        {msg && <div className="text-xs text-green-400">{msg}</div>}
        <div className="flex gap-2">
          <button className="btn" onClick={save}>Save</button>
          <button className="btn" onClick={()=>router.back()}>Back</button>
        </div>
        <div className="text-xs text-white/60">
          The selection applies to API calls via the in-app proxy. If a page looks stale, try a refresh.
        </div>
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-2">
        <div className="text-sm font-semibold">RPC configuration tips</div>
        <div className="text-xs text-white/70">
          If you see errors like <span className="font-mono">403 api key is not allowed</span>, your RPC provider requires an allow‑list.
          Configure public endpoints or your own key via environment variables:
        </div>
        <ul className="text-xs list-disc pl-5 text-white/70 space-y-1">
          <li><span className="font-mono">NEXT_PUBLIC_RPC_URL</span> (single) or <span className="font-mono">NEXT_PUBLIC_RPC_URLS</span> (comma‑separated)</li>
          <li><span className="font-mono">DOPE_RPC_FALLBACKS</span> to add public fallback RPCs</li>
          <li>Examples: <span className="font-mono">https://api.mainnet-beta.solana.com</span>, <span className="font-mono">https://solana-rpc.publicnode.com</span>, <span className="font-mono">https://rpc.ankr.com/solana</span></li>
        </ul>
        <div className="text-[11px] text-white/50">Changes require a reload to take full effect.</div>
      </div>
    </div>
  );
}

