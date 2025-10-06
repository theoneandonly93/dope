"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "../WalletProvider";
import { copyText, hapticLight } from "../../lib/clipboard";
import { fetchFairbrixStats, getStoredFairbrixAddress, setStoredFairbrixAddress } from "../../lib/fairbrix";

export default function FairbrixMining() {
  const { address } = useWallet() as any;
  const [worker, setWorker] = useState("worker1");
  const [difficulty, setDifficulty] = useState("3031");
  const [stats, setStats] = useState<{ unpaid?: number; totalPayouts?: number; workers?: number; updated?: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const prevStats = useRef<{ unpaid?: number; totalPayouts?: number } | null>(null);
  const [fairbrixAddr, setFairbrixAddr] = useState<string>("");

  useEffect(() => {
    try {
      const w = localStorage.getItem("fairbrix:worker");
      const d = localStorage.getItem("fairbrix:difficulty");
      if (w) setWorker(w);
      if (d) setDifficulty(d);
      const fa = getStoredFairbrixAddress();
      if (fa) setFairbrixAddr(fa);
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const addr = fairbrixAddr?.trim();
      if (!addr) { setStats(null); return; }
      try {
        const key = `fairbrix:stats:${addr}`;
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
        const data = await fetchFairbrixStats(addr);
        if (cancelled) return;
        const next = data || { unpaid: 0, totalPayouts: 0, workers: 0, updated: Date.now() };
        const prev = prevStats.current;
        if (prev) {
          if ((next.totalPayouts ?? 0) > (prev.totalPayouts ?? 0)) {
            setNotice("New payout received");
          } else if ((next.unpaid ?? 0) < (prev.unpaid ?? 0)) {
            setNotice("Unpaid decreased (payout or fee)");
          }
          if (notice) setTimeout(() => setNotice(""), 4000);
        }
        prevStats.current = { unpaid: next.unpaid, totalPayouts: next.totalPayouts };
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
  }, [fairbrixAddr]);

  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      {notice && (
        <div className="mb-3 rounded-xl border border-white/10 bg-green-900/40 text-green-200 text-xs px-3 py-2">
          {notice}
        </div>
      )}
      <div className="text-lg font-semibold mb-1">Fairbrix Mining Pool</div>
      <p className="text-white/60 text-xs mb-3">Algorithm: Scrypt • Payout: PPLNS • Pool Fee: 1%</p>
      <div className="text-sm text-white/80"><b>Wallet:</b> {address || "—"}</div>
      <label className="block mt-3 text-sm">
        Fairbrix payout address (for stats)
        <input
          value={fairbrixAddr}
          onChange={(e) => setFairbrixAddr(e.target.value)}
          onBlur={() => setStoredFairbrixAddress(fairbrixAddr.trim())}
          className="bg-[#1a1a1a] text-white rounded-lg p-2 w-full mt-1 border border-white/10 outline-none font-mono text-xs"
          placeholder="fSezdqhWyh6FTznBxcGroVvgkvRyrsEquf"
          inputMode="text"
        />
      </label>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="block text-sm">
          Worker
          <input
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
            className="bg-[#1a1a1a] text-white rounded-lg p-2 w-full mt-1 border border-white/10 outline-none"
            placeholder="worker1"
          />
        </label>
        <label className="block text-sm">
          Port
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-[#1a1a1a] text-white rounded-lg p-2 w-full mt-1 border border-white/10 outline-none"
          >
            <option value="3031">3031 (Regular)</option>
            <option value="3032">3032 (High)</option>
          </select>
        </label>
      </div>
      <div className="bg-[#1a1a1a] p-3 rounded-lg mt-4 text-sm border border-white/10">
        <p>⛏️ <b>Connection Command</b></p>
        <code className="block text-green-400 break-all mt-2">{command}</code>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button className="btn text-xs" onClick={onCopy}>Copy command</button>
          <a className="btn text-xs" href={``} target="_blank" rel="noreferrer">Open MRR</a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); try { const url = `/rig-rentals${address ? `?wallet=${encodeURIComponent(address)}` : ""}`; (window as any).next?.router?.push?.(url); } catch { window.location.href = `/rig-rentals${address ? `?wallet=${encodeURIComponent(address)}` : ""}`; } }}
            className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-black font-semibold rounded-lg px-3 py-2 text-xs hover:scale-[1.02] active:scale-100 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          >
            ⛏️ Manage Rig
          </a>
        </div>
      </div>
      <div className="text-[11px] text-white/50 mt-2">
        Use with your miner (e.g., Mining Rig Rentals, cpuminer, bfgminer). Username is wallet.worker; password can be any value (e.g., X).
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Reward Dashboard</div>
        <div className="text-sm text-white/80 grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-[11px] text-white/60">Unpaid</div>
            <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.unpaid ?? 0)}</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-[11px] text-white/60">Payouts</div>
            <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.totalPayouts ?? 0)}</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-[11px] text-white/60">Workers</div>
            <div className="text-base font-semibold">{loadingStats ? '—' : (stats?.workers ?? 0)}</div>
          </div>
        </div>
        <a
          href={`https://fairbrixscan.com/address/${encodeURIComponent((fairbrixAddr || "fSezdqhWyh6FTznBxcGroVvgkvRyrsEquf").trim())}`}
          target="_blank"
          rel="noreferrer"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          View on FairbrixScan
        </a>
      </div>
    </div>
  );
}
