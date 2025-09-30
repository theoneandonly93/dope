"use client";
import React, { useState } from "react";

export default function RpcTest() {
  const [customUrl, setCustomUrl] = useState("");
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/rpc", { method: "GET", cache: "no-store" });
      const meta = await r.json();
      const endpoint = customUrl.trim() || meta.rpc;
      const batch = [
        { jsonrpc: "2.0", id: 1, method: "getVersion" },
        { jsonrpc: "2.0", id: 2, method: "getSlot" },
        { jsonrpc: "2.0", id: 3, method: "getHealth" },
      ];
      const rsp = await fetch("/api/rpc-test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: endpoint, batch }) });
      const data = await rsp.json();
      if (!rsp.ok) throw new Error(data?.error || `HTTP ${rsp.status}`);
      setRes({ endpoint, data });
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">RPC Diagnostics</h1>
      <div className="text-sm text-white/70">Optionally override the endpoint, then run.</div>
      <div className="flex gap-2">
        <input value={customUrl} onChange={(e)=>setCustomUrl(e.target.value)} placeholder="https://your-rpc.example.com" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
        <button className="btn" onClick={run} disabled={loading}>{loading?"Testing...":"Run Test"}</button>
      </div>
      {err && <div className="text-red-400 text-sm">{err}</div>}
      {res && (
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-2">Endpoint</div>
          <div className="text-sm break-all mb-3">{res.endpoint}</div>
          <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(res.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

