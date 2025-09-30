"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../../components/WalletProvider";

type CardTx = { id: string; type: 'topup' | 'spend'; amount: number; currency: 'USDC'; time: number; desc?: string };

export default function CardDashboard() {
  const { address } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [txs, setTxs] = useState<CardTx[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [b, t] = await Promise.all([
        fetch(`/api/card/balance?pubkey=${address}`, { cache: 'no-store' }).then(r=>r.json()),
        fetch(`/api/card/transactions?pubkey=${address}`, { cache: 'no-store' }).then(r=>r.json()),
      ]);
      if (b?.ok) setBalance(Number(b.balance || 0));
      if (t?.ok && Array.isArray(t.txs)) setTxs(t.txs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [address]);

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Card</h1>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-xs text-white/60">USDC Balance</div>
        <div className="text-3xl font-bold">{balance.toFixed(2)} <span className="text-base font-medium text-white/60">USDC</span></div>
        <div className="mt-3 flex gap-2">
          <Link href="/wallet/card/topup" className="btn">Top Up Card</Link>
          <Link href="/card" className="btn">Virtual Card</Link>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-sm font-semibold mb-2">Card Activity</div>
        {loading && txs.length === 0 && <div className="text-white/70 text-sm">Loading...</div>}
        {!loading && txs.length === 0 && <div className="text-white/60 text-sm">No activity yet</div>}
        <div className="divide-y divide-white/10">
          {txs.map((x) => (
            <div key={x.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{x.type === 'topup' ? 'Top-up' : 'Spend'}</div>
                <div className="text-xs text-white/60">{x.desc || new Date(x.time*1000).toLocaleString()}</div>
              </div>
              <div className={`text-sm font-semibold ${x.type==='topup' ? 'text-green-400' : 'text-red-400'}`}>
                {x.type==='topup' ? '+' : '-'}{x.amount.toFixed(2)} {x.currency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!address && (
        <div className="text-white/70 text-sm">No wallet yet. <Link href="/get-started" className="underline">Create one</Link>.</div>
      )}
    </div>
  );
}

