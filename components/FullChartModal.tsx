"use client";
import { useEffect, useState } from "react";
import { getChartRangeData } from "../lib/chartData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RangeKey = "1h" | "24h" | "7d" | "30d";

export default function FullChartModal({
  tokenAddress,
  onClose,
}: {
  tokenAddress: string;
  onClose: () => void;
}) {
  const [range, setRange] = useState<RangeKey>("24h");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const d = await getChartRangeData(tokenAddress, range);
      if (!mounted) return;
      setData(d);
    }
    load();
    const iv = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [tokenAddress, range]);

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 p-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0b0f13] rounded-2xl shadow-2xl p-4 border" style={{ borderColor: "rgba(0,255,178,0.2)" }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-white">Advanced Chart</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm"
            aria-label="Close full chart"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex gap-2 mb-4 text-sm">
          {(["1h", "24h", "7d", "30d"] as RangeKey[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                range === r
                  ? "bg-white text-black font-bold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#0b0f13", border: "1px solid rgba(0,255,178,0.2)", color: "#e0e0e0" }}
              labelStyle={{ color: "#e0e0e0" }}
            />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
