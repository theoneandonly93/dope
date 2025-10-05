"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../components/WalletProvider";
import { copyText, hapticLight } from "../../lib/clipboard";

export default function FairbrixMiningPage() {
  const { address } = useWallet() as any;
  const [worker, setWorker] = useState("worker1");
  const [difficulty, setDifficulty] = useState("3031"); // 3031 (regular) or 3032 (high)
  const [stats, setStats] = useState<{ unpaid?: number; payouts?: number; workers?: number; updated?: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const prevStats = useRef<{ unpaid?: number; payouts?: number } | null>(null);

  // Persist worker/difficulty locally
  useEffect(() => {
    try {
      const w = localStorage.getItem("fairbrix:worker");
      const d = localStorage.getItem("fairbrix:difficulty");
      if (w) setWorker(w);
      if (d) setDifficulty(d);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("fairbrix:worker", worker); } catch {} }, [worker]);
  useEffect(() => { try { localStorage.setItem("fairbrix:difficulty", difficulty); } catch {} }, [difficulty]);

  const sanitizedWorker = useMemo(() => {
    const w = (worker || "worker1").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "worker1";
    return w;
  }, [worker]);

  const miningAddress = useMemo(() => {
    if (!address) return "Connect wallet to get started";
    return `${address}.${sanitizedWorker}`;
  }, [address, sanitizedWorker]);

  const command = useMemo(() => `stratum+tcp://138.201.193.124:${difficulty} -u ${miningAddress} -p X`, [difficulty, miningAddress]);

  async function onCopy() {
    if (await copyText(command)) hapticLight();
  }

  // Live stats + lightweight cache
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) { setStats(null); return; }
      try {
        const key = `fairbrix:stats:${address}`;
        const cached = sessionStorage.getItem(key);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.updated && Date.now() - parsed.updated < 60_000) {
              setStats(parsed);
            }
          } catch {}
        }
        setLoadingStats(true);
        const r = await fetch(`https://fairbrixscan.com/api/address/${address}`, { cache: "no-store" });
        const j = await r.json();
        if (cancelled) return;
        const next = {
          unpaid: Number(j?.unpaid) || 0,
          payouts: Number(j?.totalPayouts) || 0,
          workers: Array.isArray(j?.workers) ? j.workers.length : Number(j?.workers) || 0,
          updated: Date.now()
        };
        // Detect changes for notifications
        const prev = prevStats.current;
        if (prev) {
          if ((next.payouts ?? 0) > (prev.payouts ?? 0)) {
            setNotice("New payout received");
          } else if ((next.unpaid ?? 0) < (prev.unpaid ?? 0)) {
            setNotice("Unpaid decreased (payout or fee)");
          }
          if (notice) setTimeout(() => setNotice(""), 4000);
        }
        prevStats.current = { unpaid: next.unpaid, payouts: next.payouts };
        setStats(next);
        try { sessionStorage.setItem(key, JSON.stringify(next)); } catch {}
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }
    load();
    const iv = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [address]);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#000" }}>
      <div className="max-w-md mx-auto px-4 pt-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Fairbrix Mining Pool</h1>
          <Link href="/wallet/browser" className="text-xs underline text-white/60 hover:text-white">Browser</Link>
        </div>

        {notice && (
          <div className="mb-3 rounded-xl border border-white/10 bg-green-900/40 text-green-200 text-xs px-3 py-2">
            {notice}
          </div>
        )}

        <p className="text-white/60 text-sm mb-4">Algorithm: Scrypt • Payout: PPLNS • Pool Fee: 1%</p>

        <section className="bg-[#111] rounded-2xl p-4 border border-white/10 mb-4">
          <h2 className="text-lg font-semibold mb-2">Your Configuration</h2>
          <div className="text-sm text-white/80"><b>Wallet:</b> {address || "—"}</div>
          <label className="block mt-3 text-sm">
            Worker name
            <input
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
              className="bg-[#1a1a1a] text-white rounded-lg p-2 w-full mt-1 border border-white/10 outline-none"
              placeholder="worker1"
              inputMode="text"
            />
          </label>
          <label className="block mt-3 text-sm">
            Select difficulty port
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-[#1a1a1a] text-white rounded-lg p-2 w-full mt-1 border border-white/10 outline-none"
            >
              <option value="3031">Regular (10k–450k)</option>
              <option value="3032">High (1M–3M)</option>
            </select>
          </label>

          <div className="bg-[#1a1a1a] p-3 rounded-lg mt-4 text-sm border border-white/10">
            <p>⛏️ <b>Connection Command</b></p>
            <code className="block text-green-400 break-all mt-2">{command}</code>
            <div className="flex gap-2 mt-3">
              <button className="btn text-xs" onClick={onCopy}>Copy command</button>
              <a className="btn text-xs" href={`https://www.miningrigrentals.com/?ref=2713785`} target="_blank" rel="noreferrer">Open MRR</a>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-white/50">
            Use with your miner (e.g. Mining Rig Rentals, cpuminer, bfgminer). Username is wallet.worker; password can be any value (e.g. X).
          </p>
        </section>

        <section className="bg-[#111] rounded-2xl p-4 border border-white/10 mb-4">
          <h2 className="text-lg font-semibold mb-2">Pool Information</h2>
          <ul className="text-sm text-white/80 space-y-1">
            <li>🔗 <b>Pool URL:</b> stratum+tcp://138.201.193.124</li>
            <li>⚙️ <b>Algorithm:</b> Scrypt</li>
            <li>💸 <b>Payout:</b> PPLNS</li>
            <li>💰 <b>Minimum Payment:</b> 10</li>
            <li>📊 <b>Pool Fee:</b> 1%</li>
          </ul>
        </section>

        <section className="bg-[#111] rounded-2xl p-4 border border-white/10 mb-4">
          <h2 className="text-lg font-semibold mb-2">Reward Dashboard</h2>
          <p className="text-sm text-white/60 mb-3">Check your payout stats on FairbrixScan.</p>
          <div className="text-sm text-white/80 grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
              <div className="text-[11px] text-white/60">Unpaid</div>
              <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.unpaid ?? 0)}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
              <div className="text-[11px] text-white/60">Payouts</div>
              <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.payouts ?? 0)}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
              <div className="text-[11px] text-white/60">Workers</div>
              <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.workers ?? 0)}</div>
            </div>
          </div>
          <a
            href={`https://fairbrixscan.com/address/${address || "fSezdqhWyh6FTznBxcGroVvgkvRyrsEquf"}`}
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            View on FairbrixScan
          </a>
        </section>

        <section className="bg-[#111] rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-2">Mine via Mining Rig Rentals</h2>
          <a
            href="https://www.miningrigrentals.com/?ref=2713785"
            target="_blank"
            rel="noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition"
          >
            Open Mining Rig Rentals
          </a>
        </section>
      </div>
    </div>
  );
}

