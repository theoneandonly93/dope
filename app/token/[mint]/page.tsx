"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);
import { fetchMarketData } from "../../../lib/marketData";
import { useWallet } from "../../../components/WalletProvider";
import { getConnection } from "../../../lib/wallet";
import dynamic from "next/dynamic";
const PhantomSwapModal = dynamic(() => import("../../../components/PhantomSwapModal"), { ssr: false });

const ACCENT = "#A78BFA";

export default function TokenDetailPage() {
  const params = useParams<{ mint: string }>();
  const mint = decodeURIComponent((params?.mint as string) || "");
  const router = useRouter();
  const { address } = useWallet() as any;
  const [meta, setMeta] = useState<{ name?: string; symbol?: string; logo?: string; decimals?: number } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [spark, setSpark] = useState<Array<{ t: number; p: number }> | null>(null);
  const [tab, setTab] = useState<"1H" | "1D" | "1W" | "1M" | "YTD" | "ALL">("1D");
  const [swapOpen, setSwapOpen] = useState<false | "buy" | "sell">(false);

  // Fetch token metadata (basic) and balance
  useEffect(() => {
    if (!mint) return;
    let cancelled = false;
    (async () => {
      try {
        // Try tokenlist first
        const tl = await fetch("/tokenlist.json").then(r => r.json()).catch(() => []);
        const found = Array.isArray(tl) ? tl.find((t: any) => t.mint === mint) : null;
        if (found && !cancelled) setMeta({ name: found.name, symbol: found.symbol, logo: found.logo });
      } catch {}
      try {
        const conn = getConnection();
        // getParsedAccountInfo for decimals
        const info = await conn.getParsedAccountInfo(new (await import("@solana/web3.js")).PublicKey(mint));
        // @ts-ignore
        const decimals = info?.value?.data?.parsed?.info?.decimals ?? 9;
        if (!cancelled) setMeta(m => ({ ...(m || {}), decimals }));
        // User balance
        if (address) {
          try {
            const res = await fetch(`/api/wallet/${address}/balances`);
            const j = await res.json();
            if (j?.ok) {
              const tok = (j.tokens || []).find((t: any) => t.mint === mint);
              if (!cancelled) setBalance(tok ? tok.uiAmount : 0);
            }
          } catch {}
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [mint, address]);

  // Market data
  useEffect(() => {
    if (!mint) return;
    let cancelled = false;
    (async () => {
      const md = await fetchMarketData([mint], true, { useProxy: true }).catch(() => []);
      const d = (md && md[0]) || null;
      if (cancelled) return;
      setPrice(d?.price ?? null);
      setChange24h(d?.change24h ?? null);
      setSpark(d?.sparkline || null);
    })();
    return () => { cancelled = true; };
  }, [mint]);

  const chartData = useMemo(() => {
    const points = spark || [];
    const labels = points.map(p => new Date(p.t).toLocaleTimeString());
    const data = points.map(p => p.p);
    return {
      labels,
      datasets: [
        {
          data,
          borderColor: change24h != null && change24h < 0 ? "#f87171" : "#34d399",
          backgroundColor: "rgba(167, 139, 250, 0.08)",
          fill: true,
          tension: 0.3,
        },
      ],
    } as any;
  }, [spark, change24h]);

  const value = useMemo(() => (price != null && balance != null ? price * balance : null), [price, balance]);

  const changeColor = change24h == null ? "text-white/60" : change24h > 0 ? "text-green-400" : change24h < 0 ? "text-red-400" : "text-white/60";

  return (
    <div className="min-h-screen pb-24" style={{ background: "radial-gradient(1200px 600px at 50% -200px, rgba(167,139,250,0.15), transparent 60%), #000" }}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <button className="text-white/70" onClick={() => router.back()}>← Back</button>
          <div className="text-white/60 text-xs">Solana</div>
        </div>
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta?.logo || "/logo-192.png"} alt={meta?.symbol || "token"} className="w-12 h-12 rounded-full" />
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">{meta?.name || "Token"}</div>
            <div className="text-xs text-white/60">{meta?.symbol || "SPL"}</div>
          </div>
          <button className="ml-auto text-xs px-3 py-1 rounded-full border border-white/10 bg-white/10 hover:bg-white/20">Follow</button>
        </div>

        {/* Price */}
        <div className="mt-4">
          <div className="text-3xl font-bold">{price != null ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}</div>
          <div className={`text-xs ${changeColor}`}>{change24h != null ? `${change24h.toFixed(2)}% (24h)` : "—"}</div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4">
          {(["1H","1D","1W","1M","YTD","ALL"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`text-xs px-2.5 py-1 rounded-full border ${tab===t?"bg-white/15 border-white/30":"bg-white/5 border-white/10 text-white/70"}`}>{t}</button>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-3 h-48">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { x: { ticks: { color: "#9CA3AF", maxTicksLimit: 6 }, grid: { display: false } }, y: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } } } }} />
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-[11px] text-white/60">Balance</div>
            <div className="text-sm font-semibold">{balance != null ? balance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "—"}</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-[11px] text-white/60">Value</div>
            <div className="text-sm font-semibold">{value != null ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-[11px] text-white/60">24h Return</div>
            <div className={`text-sm font-semibold ${changeColor}`}>{value != null && change24h != null ? `$${(value * (change24h/100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</div>
          </div>
        </div>

        {/* Info table */}
        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm">
          <div className="flex justify-between py-1"><span className="text-white/60">Name</span><span>{meta?.name || "—"}</span></div>
          <div className="flex justify-between py-1"><span className="text-white/60">Symbol</span><span>{meta?.symbol || "—"}</span></div>
          <div className="flex justify-between py-1"><span className="text-white/60">Network</span><span>Solana</span></div>
          <div className="flex justify-between py-1"><span className="text-white/60">Mint</span><span className="font-mono text-xs truncate max-w-[60%]">{mint}</span></div>
          {meta?.decimals != null && <div className="flex justify-between py-1"><span className="text-white/60">Decimals</span><span>{meta.decimals}</span></div>}
        </div>

        {/* Social bar */}
        <div className="flex items-center gap-3 mt-4 text-white/70">
          <button title="Share" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">Share</button>
          <button title="Copy Mint" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10" onClick={() => { try { navigator.clipboard.writeText(mint); } catch {} }}>Copy</button>
          <button title="QR" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">QR</button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button className="py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(90deg, ${ACCENT}, #7c3aed)` }} onClick={() => setSwapOpen("buy")}>Buy</button>
          <button className="py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(90deg, #ef4444, #b91c1c)` }} onClick={() => setSwapOpen("sell")} disabled={(balance||0)===0}>Sell</button>
        </div>

        {swapOpen && (
          <PhantomSwapModal open={true} onClose={() => setSwapOpen(false)} initialFromMint={swapOpen==="sell" ? mint : "So11111111111111111111111111111111111111112"} initialToMint={swapOpen==="buy" ? mint : "So11111111111111111111111111111111111111112"} />
        )}
      </div>
    </div>
  );
}
