"use client";
import React, { useEffect, useState } from "react";
import { getRecentTransactions, RecentTx } from "../lib/wallet";
import { Connection, PublicKey } from "@solana/web3.js";


export default function TxList({ address, tokenMint }: { address?: string, tokenMint?: string }) {
  const [items, setItems] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const fetchTx = async () => {
      if (!address) return;
      try {
        setLoading(true);
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com");
        const pubkey = new PublicKey(address);
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 20 });
        const txs = await Promise.all(
          signatures.map(async sig => {
            const tx = await connection.getParsedTransaction(sig.signature, { commitment: "confirmed" });
            let status: "success" | "error" | "unknown" = "unknown";
            if (tx) {
              status = tx.meta?.err ? "error" : "success";
            }
            return {
              signature: sig.signature,
              slot: sig.slot,
              time: tx?.blockTime ?? null,
              change: null,
              status,
            };
          })
        );
        if (alive) setItems(txs);
      } catch (e) {
        if (alive) setItems([]);
        console.error('Transaction history error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
    const iv = setInterval(fetchTx, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [address]);

  if (!address) {
    return <div className="glass rounded-2xl p-5 border border-white/5 text-white/60 text-sm">No address provided.</div>;
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="text-sm font-semibold mb-3">Recent Activity</div>
      {loading && items.length === 0 && <div className="text-white/60 text-sm">Loading...</div>}
      {!loading && items.length === 0 && <div className="text-white/60 text-sm">No recent transactions</div>}
      <div className="space-y-2">
        {items.map((tx) => (
          <a
            key={tx.signature || Math.random().toString(36)}
            href={tx.signature ? `https://explorer.solana.com/tx/${tx.signature}?cluster=mainnet-beta` : undefined}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5"
          >
            <div className="flex flex-col">
              <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed' : tx.status === 'error' ? 'Failed' : 'Pending'}</span>
              <span className="font-mono text-xs break-all max-w-[220px]">{tx.signature ? `${tx.signature.slice(0, 12)}…${tx.signature.slice(-6)}` : '—'}</span>
              <span className="text-xs text-white/50 mt-1">{tx.time ? new Date(tx.time * 1000).toLocaleString() : ''}</span>
              <span className="text-xs text-white/50 mt-1">{typeof tx.change === 'number' ? (tx.change > 0 ? 'Incoming' : tx.change < 0 ? 'Outgoing' : 'Swap') : ''}</span>
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

