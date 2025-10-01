"use client";
import React, { useEffect, useState } from "react";
import { getRecentTransactions, RecentTx } from "../lib/wallet";

export default function TxList({ address }: { address: string }) {
  const [items, setItems] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const fetchTx = async () => {
      if (!address) return;
      try {
        setLoading(true);
        const res = await getRecentTransactions(address, 10);
        if (alive) setItems(res);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  const iv = setInterval(fetchTx, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [address]);

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="text-sm font-semibold mb-3">Recent Activity</div>
      {loading && items.length === 0 && <div className="text-white/60 text-sm">Loading...</div>}
      {!loading && items.length === 0 && <div className="text-white/60 text-sm">No recent transactions</div>}
      <div className="space-y-2">
        {items.map((tx) => (
          <a
            key={tx.signature}
            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=custom`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5"
          >
            <div className="flex flex-col">
              <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed' : tx.status === 'error' ? 'Failed' : 'Pending'}</span>
              <span className="font-mono text-xs break-all max-w-[220px]">{tx.signature.slice(0, 12)}…{tx.signature.slice(-6)}</span>
            </div>
            <div className={`text-sm font-semibold ${typeof tx.change === 'number' ? (tx.change >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white/70'}`}>
              {typeof tx.change === 'number' ? `${tx.change >= 0 ? '+' : ''}${tx.change.toFixed(4)} DOPE` : '—'}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

