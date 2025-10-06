"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import marketData from "../../../data/marketData.json";

export const metadata = {
  title: "Rig Rentals ⛏️ | Market",
};

const RigStats = dynamic(() => import("../../../components/RigStats"), { ssr: false });

type MarketRow = {
  name: string;
  price: string; // BTC as string
  unit: "per KH" | "per MH" | "per GH";
  tags?: ("new" | "hot")[];
  stats?: { availability: number; hashrate: string; earnings: string; topPool?: string };
};

const unitOptions = ["All", "per KH", "per MH", "per GH"] as const;
type UnitFilter = typeof unitOptions[number];

export default function RigRentalsMarket() {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState<UnitFilter>("All");
  const [openRow, setOpenRow] = useState<string | null>(null);

  const rows = marketData as MarketRow[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ = !q || r.name.toLowerCase().includes(q);
      const matchesUnit = unit === "All" || r.unit === unit;
      return matchesQ && matchesUnit;
    });
  }, [rows, query, unit]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0b0f13" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-black/40"
        style={{ borderColor: "rgba(0,255,178,0.2)" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: "#e0e0e0" }}>
            Rig Rentals ⛏️ | <span className="text-[#00ffb2]">Market</span>
          </h1>
          <Link
            href="/rig-rentals/manage"
            className="group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black transition-transform duration-150"
            style={{
              background: "linear-gradient(90deg,#00ffb2,#8b5cf6)",
              boxShadow: "0 0 1rem rgba(139,92,246,0.45)",
            }}
          >
            <span className="transition-transform group-hover:scale-110">⚡</span>
            Manage Rig
          </Link>
        </div>

        {/* Top Tabs */}
        <div className="mx-auto max-w-6xl px-4 pb-3 overflow-x-auto">
          <ul className="tabs tabs-bordered [--tab-border-color:rgba(0,255,178,0.2)]">
            <li className="tab text-[#e0e0e0]">Dashboard</li>
            <li className="tab text-[#e0e0e0]">My Rigs</li>
            <li className="tab tab-active text-[#00ffb2] after:!border-[#00ffb2]">Market</li>
            <li className="tab text-[#e0e0e0]">Transactions</li>
            <li className="tab text-[#e0e0e0]">Settings</li>
            <li className="tab text-[#e0e0e0]">API Keys</li>
          </ul>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search algorithm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full sm:w-80 bg-transparent focus:outline-none"
              style={{ borderColor: "rgba(0,255,178,0.2)", color: "#e0e0e0" }}
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitFilter)}
              className="select select-bordered bg-transparent focus:outline-none"
              style={{ borderColor: "rgba(0,255,178,0.2)", color: "#e0e0e0" }}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u} className="bg-[#0b0f13]">
                  {u === "All" ? "All Units" : u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div
          className="hidden md:block overflow-x-auto rounded-xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,255,178,0.2)",
            boxShadow: "0 0 1.5rem rgba(0,255,178,0.05)",
          }}
        >
          <table className="table">
            <thead
              className="sticky top-0 z-10"
              style={{ background: "rgba(11,15,19,0.9)", backdropFilter: "blur(8px)" }}
            >
              <tr>
                <th className="text-[#e0e0e0]">Algorithm Name</th>
                <th className="text-[#e0e0e0]">Suggested Price (BTC)</th>
                <th className="text-[#e0e0e0]">Price Unit</th>
                <th className="text-right text-[#e0e0e0]">+</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const isOpen = openRow === r.name;
                return (
                  <>
                    <tr
                      key={r.name}
                      className={`${i % 2 ? "bg-white/10" : "bg-white/5"} hover:[box-shadow:0_0_0.75rem_rgba(0,255,178,0.25)]`}
                    >
                      <td>
                        <div className="flex items-center gap-2 text-[#e0e0e0]">
                          <span>{r.name}</span>
                          <div className="flex items-center gap-1">
                            {r.tags?.includes("new") && (
                              <span className="badge badge-success badge-sm animate-pulse text-black">new</span>
                            )}
                            {r.tags?.includes("hot") && (
                              <span
                                className="badge badge-error badge-sm"
                                style={{ boxShadow: "0 0 0.5rem rgba(255,0,0,0.5)" }}
                              >
                                hot
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-[#e0e0e0]">{Number(r.price).toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</td>
                      <td className="text-[#00ffb2] font-medium">{r.unit}</td>
                      <td className="text-right">
                        <button
                          className="btn btn-sm border-0 text-black transition-transform hover:scale-110"
                          style={{
                            background: "linear-gradient(90deg,#00ffb2,#8b5cf6)",
                            boxShadow: "0 0 0.75rem rgba(0,255,178,0.35)",
                          }}
                          aria-label={`Toggle ${r.name} stats`}
                          onClick={() => setOpenRow(isOpen ? null : r.name)}
                        >
                          {isOpen ? "−" : "+"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${r.name}-details`}>
                        <td colSpan={4} className="p-0">
                          <RigStats
                            availability={r.stats?.availability ?? 0}
                            hashrate={r.stats?.hashrate ?? "—"}
                            earnings={r.stats?.earnings ?? "—"}
                            topPool={r.stats?.topPool}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden grid gap-3">
          {filtered.map((r) => {
            const isOpen = openRow === r.name;
            return (
              <div
                key={r.name}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,255,178,0.2)",
                  boxShadow: "0 0 1.5rem rgba(0,255,178,0.05)",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-[#e0e0e0]">
                    <span className="font-semibold">{r.name}</span>
                    {r.tags?.includes("new") && (
                      <span className="badge badge-success badge-xs animate-pulse text-black">new</span>
                    )}
                    {r.tags?.includes("hot") && (
                      <span className="badge badge-error badge-xs" style={{ boxShadow: "0 0 0.5rem rgba(255,0,0,0.5)" }}>
                        hot
                      </span>
                    )}
                  </div>
                  <button
                    className="btn btn-xs border-0 text-black transition-transform hover:scale-110"
                    style={{ background: "linear-gradient(90deg,#00ffb2,#8b5cf6)" }}
                    onClick={() => setOpenRow(isOpen ? null : r.name)}
                  >
                    {isOpen ? "−" : "+"}
                  </button>
                </div>
                <div className="px-4 pb-3 text-sm text-[#e0e0e0]">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Price</span>
                    <span>{Number(r.price).toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Unit</span>
                    <span className="text-[#00ffb2]">{r.unit}</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <RigStats
                      availability={r.stats?.availability ?? 0}
                      hashrate={r.stats?.hashrate ?? "—"}
                      earnings={r.stats?.earnings ?? "—"}
                      topPool={r.stats?.topPool}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
