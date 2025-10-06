"use client";
import { useEffect, useState } from "react";
import { getChartData, getTokenStats } from "../lib/tokenStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TokenChart({ tokenAddress }: { tokenAddress: string }) {
  const [chart, setChart] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!tokenAddress) return;
    let mounted = true;
    async function load() {
      const [s, c] = await Promise.all([
        getTokenStats(tokenAddress),
        getChartData(tokenAddress),
      ]);
      if (!mounted) return;
      setStats(s);
      setChart(c);
    }
    load();
    const i = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, [tokenAddress]);

  if (!stats) return <div className="text-center text-white/60">Loading chart…</div>;

  const changeUp = Number(stats.change24h) >= 0;

  return (
    <div
      className="bg-white/5 rounded-xl p-4 mt-4 border"
      style={{ borderColor: "rgba(0,255,178,0.2)" }}
    >
      <div className="flex justify-between mb-2">
        <div>
          <div className="text-lg font-bold">{stats.symbol || stats.name}</div>
          <div className="text-sm text-white/50">${Number(stats.price || 0).toFixed(6)}</div>
        </div>
        <div
          className={`text-sm font-bold ${changeUp ? "text-green-400" : "text-red-400"}`}
        >
          {changeUp ? "+" : ""}
          {Number(stats.change24h || 0).toFixed(2)}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chart} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#0b0f13", border: "1px solid rgba(0,255,178,0.2)", color: "#e0e0e0" }}
            labelStyle={{ color: "#e0e0e0" }}
          />
          <Line type="monotone" dataKey="price" stroke="#22c55e" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/60">
        <div>
          <span className="font-bold text-white">
            ${Number(stats.liquidity || 0).toLocaleString()}
          </span>
          <br />
          Liquidity
        </div>
        <div>
          <span className="font-bold text-white">
            ${Number(stats.volume24h || 0).toLocaleString()}
          </span>
          <br />
          24h Volume
        </div>
        <div>
          <span className="font-bold text-white">{stats.symbol}</span>
          <br />
          Pair
        </div>
      </div>
    </div>
  );
}
