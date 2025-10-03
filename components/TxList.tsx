"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getRecentTransactions, RecentTx } from "../lib/wallet";
import { Connection, PublicKey } from "@solana/web3.js";
import Link from "next/link";

interface TxListProps {
  address?: string;
  tokenMint?: string; // currently unused but kept for backward compat
  limit?: number; // max number of rows to show (combined local + on-chain)
  showSeeMore?: boolean; // show the see all arrow/link
}

export default function TxList({ address, tokenMint, limit, showSeeMore }: TxListProps) {
  const [expandedIdx, setExpandedIdx] = useState<number|null>(null);
  const [items, setItems] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [localTx, setLocalTx] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    const fetchTx = async () => {
      if (!address) return;
      try {
        setLoading(true);
        const { getConnection } = await import("../lib/wallet");
        const connection = getConnection();
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
      // Load local tx log
      const log = JSON.parse(localStorage.getItem('dope_local_tx_log') || '[]');
      if (alive) setLocalTx(log);
    };
    fetchTx();
    const iv = setInterval(fetchTx, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [address]);

  if (!address) {
    return <div className="glass rounded-2xl p-5 border border-white/5 text-white/60 text-sm">No address provided.</div>;
  }

  // Derive slices based on limit (local first, then on-chain)
  const { displayLocal, displayItems } = useMemo(() => {
    if (!limit || limit <= 0) return { displayLocal: localTx, displayItems: items };
    const first = localTx.slice(0, limit);
    const remaining = Math.max(0, limit - first.length);
    const second = items.slice(0, remaining);
    return { displayLocal: first, displayItems: second };
  }, [limit, localTx, items]);

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="text-sm font-semibold mb-3 flex items-center justify-between">
        <span>Recent Activity</span>
        {showSeeMore && (
          <Link href="/transactions" className="text-xs text-white/60 hover:text-white flex items-center gap-1">
            See all <span aria-hidden>→</span>
          </Link>
        )}
      </div>
      {loading && items.length === 0 && <div className="text-white/60 text-sm">Loading...</div>}
      {!loading && items.length === 0 && <div className="text-white/60 text-sm">No recent transactions</div>}
      <div className="space-y-2">
        {/* Show local tx first, then on-chain */}
        {displayLocal.map((tx, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={tx.signature + tx.status + tx.time + idx}
              className="flex flex-col p-3 rounded-lg border border-white/10 bg-black/40 cursor-pointer"
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed (Local)' : tx.status === 'error' ? 'Failed (Local)' : 'Pending (Local)'}</span>
                  <span className="font-mono text-xs break-all max-w-[220px]">{tx.signature ? `${tx.signature.slice(0, 12)}…${tx.signature.slice(-6)}` : '—'}</span>
                  <span className="text-xs text-white/50 mt-1">{tx.time ? new Date(tx.time * 1000).toLocaleString() : ''}</span>
                  <span className="text-xs text-white/50 mt-1">{typeof tx.change === 'number' ? (tx.change < 0 ? 'Outgoing' : tx.change > 0 ? 'Incoming' : 'Swap') : ''}</span>
                </div>
                <div className={`text-sm font-semibold ${typeof tx.change === 'number' ? (tx.change < 0 ? 'text-red-400' : 'text-green-400') : 'text-white/70'}`}> 
                  {typeof tx.change === 'number' ? `${tx.change < 0 ? '-' : '+'}${Math.abs(tx.change).toFixed(4)} DOPE` : '—'}
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 p-2 rounded bg-black/60 text-xs text-white/80">
                  <div><span className="font-bold">Error:</span> {tx.error || 'No error details available.'}</div>
                  <div className="mt-1"><span className="font-bold">Timestamp:</span> {tx.time ? new Date(tx.time * 1000).toLocaleString() : '—'}</div>
                  <div className="mt-1"><span className="font-bold">Recipient:</span> {String('to' in tx ? tx.to || '—' : '—')}</div>
                  <div className="mt-1"><span className="font-bold">Amount:</span> {typeof tx.change === 'number' ? Math.abs(tx.change).toFixed(4) + ' DOPE' : '—'}</div>
                </div>
              )}
            </div>
          );
        })}
        {displayItems.map((tx, idx) => {
          const isExpanded = expandedIdx === displayLocal.length + idx;
          return (
            <div
              key={tx.signature || Math.random().toString(36)}
              className="flex flex-col p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer"
              onClick={() => setExpandedIdx(isExpanded ? null : displayLocal.length + idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60">{tx.status === 'success' ? 'Confirmed' : tx.status === 'error' ? 'Failed' : 'Pending'}</span>
                  <span className="font-mono text-xs break-all max-w-[220px]">{tx.signature ? `${tx.signature.slice(0, 12)}…${tx.signature.slice(-6)}` : '—'}</span>
                  <span className="text-xs text-white/50 mt-1">{tx.time ? new Date(tx.time * 1000).toLocaleString() : ''}</span>
                  <span className="text-xs text-white/50 mt-1">{typeof tx.change === 'number' ? (tx.change < 0 ? 'Outgoing' : tx.change > 0 ? 'Incoming' : 'Swap') : ''}</span>
                </div>
                <div className={`text-sm font-semibold ${typeof tx.change === 'number' ? (tx.change < 0 ? 'text-red-400' : 'text-green-400') : 'text-white/70'}`}> 
                  {typeof tx.change === 'number' ? `${tx.change < 0 ? '-' : '+'}${Math.abs(tx.change).toFixed(4)} DOPE` : '—'}
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 p-2 rounded bg-black/60 text-xs text-white/80">
                  <div><span className="font-bold">Signature:</span> {tx.signature}</div>
                  <div className="mt-1"><span className="font-bold">Timestamp:</span> {tx.time ? new Date(tx.time * 1000).toLocaleString() : '—'}</div>
                  <div className="mt-1"><span className="font-bold">Recipient:</span> {String('to' in tx ? tx.to || '—' : '—')}</div>
                  <div className="mt-1"><span className="font-bold">Amount:</span> {typeof tx.change === 'number' ? Math.abs(tx.change).toFixed(4) + ' DOPE' : '—'}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

