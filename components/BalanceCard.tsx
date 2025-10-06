"use client";
import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { useBalances } from "../hooks/useBalances";

export default function BalanceCard() {
  const { address } = useWallet() as any;
  const { fiatUsd, sol, solUsd, totalUsd, loading } = useBalances(address);

  return (
    <div className="glass rounded-2xl p-5 border border-white/10">
      <div className="text-xs text-white/60">Total Value</div>
      <div className="text-3xl font-bold">
        {loading ? "…" : `$${totalUsd.toFixed(2)}`}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-[11px] text-white/60">Cash</div>
          <div className="text-base font-semibold">${fiatUsd.toFixed(2)}</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="text-[11px] text-white/60">Crypto</div>
          <div className="text-base font-semibold">${solUsd.toFixed(2)} <span className="text-[11px] text-white/60">({sol.toFixed(4)} SOL)</span></div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 w-full">
        <Link href="/wallet/card/topup" className="btn">Add Cash</Link>
        <Link href="/wallet/card" className="btn">View Transactions</Link>
      </div>
    </div>
  );
}
