"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TabKey = "login" | "settings" | "balance" | "transactions" | "rigs" | "api" | "favorites";

export default function RigRentalsPage() {
  const params = useSearchParams();
  const walletFromQuery = params?.get("wallet") || "";

  const [active, setActive] = useState<TabKey>("login");
  const [owner, setOwner] = useState("");
  useEffect(() => { if (walletFromQuery && !owner) setOwner(walletFromQuery); }, [walletFromQuery]);

  // Auth form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pin, setPin] = useState("");
  const [accept, setAccept] = useState(false);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#000" }}>
      <div className="max-w-md mx-auto px-4 pt-6 text-white">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Rig Rentals ⛏️</h1>
          <div className="text-xs text-white/60">Powered by Dopelganga</div>
        </header>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { k: "login", t: "Login / Signup" },
            { k: "settings", t: "Settings" },
            { k: "balance", t: "Balance" },
            { k: "transactions", t: "Transactions" },
            { k: "rigs", t: "My Rigs" },
            { k: "api", t: "API Keys" },
            { k: "favorites", t: "Favorites" },
          ].map((c) => (
            <button
              key={c.k}
              onClick={() => setActive(c.k as TabKey)}
              className={`rounded-xl px-3 py-2 text-sm border ${active===c.k?"bg-white/15 border-white/30":"bg-white/5 border-white/10 text-white/70"}`}
            >{c.t}</button>
          ))}
        </div>

        {active === "login" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">Login / Signup</h2>
            <div className="grid gap-3">
              <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" inputMode="email" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              <div className="grid grid-cols-2 gap-3">
                <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
                <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm Password" type="password" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              </div>
              <input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="5-digit PIN" inputMode="numeric" maxLength={5} className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={accept} onChange={(e)=>setAccept(e.target.checked)} />
                I accept the Terms of Service and Privacy Policy
              </label>
              <div className="flex gap-2">
                <button className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 font-semibold rounded-lg px-3 py-2 hover:scale-[1.02] active:scale-100 transition-all">Sign up</button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-2">Sign in with Wallet</button>
              </div>
            </div>
          </section>
        )}

        {active === "rigs" && (
          <>
            <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">My Rigs</h2>
                <button className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-black font-semibold rounded-lg px-3 py-2 text-sm">Create New Rig</button>
              </div>
              <div className="grid gap-2">
                {/* Example rig card */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Example CPU Miner</div>
                      <div className="text-xs text-white/60">Availability: <span className="text-green-400">Available</span> • 200 kh/s • Scrypt • $1.50/day</div>
                    </div>
                    <button className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-1">Manage</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
              <h2 className="text-lg font-semibold mb-2">Create a Rig</h2>
              <div className="grid gap-3">
                <label className="text-sm">
                  Owner Wallet
                  <input value={owner} onChange={(e)=>setOwner(e.target.value)} placeholder="Your Solana address" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none w-full mt-1 font-mono text-xs"/>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Rig Name" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
                  <select className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none">
                    <option>CPU</option>
                    <option>GPU</option>
                    <option>ASIC</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Hashrate" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
                  <input placeholder="Price / day" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none"/>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>Auto Pricing</span>
                  <input type="checkbox"/>
                </div>
                <button className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-black font-semibold rounded-lg px-3 py-2 hover:scale-[1.02] active:scale-100 transition-all">List Rig</button>
              </div>
            </section>
          </>
        )}

        {active === "transactions" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">Transactions</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {"Deposits,Payouts,Credits,Payments,Refunds".split(",").map((b)=>(
                <button key={b} className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-1 text-xs">{b}</button>
              ))}
              <button className="bg-purple-600 hover:bg-purple-700 rounded-lg px-3 py-1 text-xs">Download CSV</button>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white/60">No transactions to show.</div>
          </section>
        )}

        {active === "balance" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">Balance</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-[11px] text-white/60">Available</div>
                <div className="text-base font-semibold">0.00000000 BTC</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-[11px] text-white/60">Held</div>
                <div className="text-base font-semibold">0.00000000 BTC</div>
              </div>
            </div>
          </section>
        )}

        {active === "settings" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">Settings</h2>
            <div className="grid gap-3 text-sm">
              <label className="text-sm">Display Name<input className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none w-full mt-1" placeholder="Your name"/></label>
              <label className="text-sm">Time Zone<select className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 outline-none w-full mt-1"><option>UTC</option><option>PST</option><option>EST</option></select></label>
              <div className="flex items-center gap-2"><input type="checkbox"/><span className="text-xs text-white/70">Email notifications</span></div>
              <button className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 font-semibold rounded-lg px-3 py-2">Save</button>
            </div>
          </section>
        )}

        {active === "api" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">API Keys</h2>
            <div className="text-sm text-white/60">No API keys yet. Generate one to integrate with your rigs programmatically.</div>
            <button className="mt-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-2 text-sm">Generate Key</button>
          </section>
        )}

        {active === "favorites" && (
          <section className="glass rounded-2xl p-4 border border-white/10 mb-4">
            <h2 className="text-lg font-semibold mb-2">Favorite Pools / Algorithms</h2>
            <div className="text-sm text-white/60">Save pools and algorithms for quick access when creating rigs.</div>
            <div className="mt-2 grid gap-2">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm">Scrypt • Fairbrix Pool</div>
            </div>
          </section>
        )}

        {/* Deposit Addresses section under Balance-like grouping */}
        {active === "balance" && (
          <section className="glass rounded-2xl p-4 border border-white/10">
            <h2 className="text-lg font-semibold mb-2">Deposit Addresses</h2>
            <div className="grid gap-2 text-sm">
              {["Bitcoin","Litecoin","Dogecoin"].map((c)=> (
                <div key={c} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
                  <div>{c}</div>
                  <button className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-black font-semibold rounded-lg px-3 py-1 text-xs">Create New Address</button>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
