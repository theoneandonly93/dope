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
    </div>
  );
}

