"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "../../components/WalletProvider";
import { getRecentTransactions, type RecentTx } from "../../lib/wallet";

export default function TransactionsPage() {
  const { address } = useWallet();
  const [items, setItems] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "error" | "pending">("all");
  const [from, setFrom] = useState<string>(""); // yyyy-mm-dd
  const [to, setTo] = useState<string>("");
  const [localTx, setLocalTx] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await getRecentTransactions(address, limit);
        if (!cancelled) setItems(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
      // Load local tx log
      const log = JSON.parse(localStorage.getItem('dope_local_tx_log') || '[]');
      if (!cancelled) setLocalTx(log);
    };
    run();
    const iv = setInterval(run, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [address, limit]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const fromTs = from ? new Date(from + 'T00:00:00Z').getTime() / 1000 : null;
    const toTs = to ? new Date(to + 'T23:59:59Z').getTime() / 1000 : null;
    return items.filter((tx) => {
      if (status !== 'all') {
        if (status === 'pending' && tx.status !== 'unknown') return false;
        if (status !== 'pending' && tx.status !== status) return false;
      }
      if (fromTs && (tx.time ?? 0) < fromTs) return false;
      if (toTs && (tx.time ?? 0) > toTs) return false;
      if (!s) return true;
      const sig = tx.signature.toLowerCase();
      return sig.includes(s);
    });
  }, [items, q, status]);

  return (
    <div className="space-y-5 pb-24">
      <h1 className="text-xl font-semibold">Transactions</h1>

      <div className="glass rounded-2xl p-4 border border-white/10 space-y-3">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Search by signature"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
        />
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2"><input type="radio" checked={status==='all'} onChange={()=>setStatus('all')} /> All</label>
          <label className="flex items-center gap-2"><input type="radio" checked={status==='success'} onChange={()=>setStatus('success')} /> Success</label>
          <label className="flex items-center gap-2"><input type="radio" checked={status==='error'} onChange={()=>setStatus('error')} /> Failed</label>
          <label className="flex items-center gap-2"><input type="radio" checked={status==='pending'} onChange={()=>setStatus('pending')} /> Pending</label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-white/60 mb-1">From</div>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">To</div>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10">
        {loading && items.length === 0 && <div className="text-white/70 text-sm">Loading...</div>}
        {!loading && filtered.length === 0 && localTx.length === 0 && <div className="text-white/70 text-sm">No results</div>}
        <div className="divide-y divide-white/10">
          {/* Show local tx first, then on-chain */}
          {localTx.map((tx, idx) => (
            <div
              key={tx.signature + tx.status + tx.time + idx}
              className="flex items-center justify-between py-3 bg-black/40"
            >
              <div className="flex flex-col">
                <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed (Local)' : tx.status === 'error' ? 'Failed (Local)' : 'Pending (Local)'}</span>
                <span className="font-mono text-xs break-all max-w-[240px]">{tx.signature}</span>
              </div>
              <div className={`text-sm font-semibold ${typeof tx.change === 'number' ? (tx.change < 0 ? 'text-red-400' : 'text-green-400') : 'text-white/70'}`}>
                {typeof tx.change === 'number' ? `${tx.change < 0 ? '-' : '+'}${Math.abs(tx.change).toFixed(4)} DOPE` : '—'}
              </div>
            </div>
          ))}
          {filtered.map((tx) => (
            <a key={tx.signature} href={`https://explorer.solana.com/tx/${tx.signature}?cluster=custom`} target="_blank" rel="noreferrer" className="flex items-center justify-between py-3">
              <div className="flex flex-col">
                <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed' : tx.status === 'error' ? 'Failed' : 'Pending'}</span>
                <span className="font-mono text-xs break-all max-w-[240px]">{tx.signature}</span>
              </div>
              <div className={`text-sm font-semibold ${typeof tx.change === 'number' ? (tx.change < 0 ? 'text-red-400' : 'text-green-400') : 'text-white/70'}`}>
                {typeof tx.change === 'number' ? `${tx.change < 0 ? '-' : '+'}${Math.abs(tx.change).toFixed(4)} DOPE` : '—'}
              </div>
            </a>
          ))}
        </div>
        <div className="pt-3">
          <button className="btn" onClick={()=>setLimit(l => l + 20)} disabled={loading}>Load more</button>
        </div>
      </div>

      {!address && (
        <div className="text-white/70 text-sm">No wallet yet. Create one from the home page.</div>
      )}
    </div>
  );
}
