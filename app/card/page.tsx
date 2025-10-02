"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../components/WalletProvider";
import { getActiveWallet } from "../../lib/wallet";

export default function CardPage() {
  const { address } = useWallet();
  const [name, setName] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [qrSize, setQrSize] = useState(180);
  const [tab, setTab] = useState<"walletpay" | "design" | "blocked" | "pin" | "support">("walletpay");
  const [cardTheme, setCardTheme] = useState<"purple" | "teal" | "orange">("purple");
  const [cardDesign, setCardDesign] = useState<null | { id: string; name: string; type: 'classic' | 'metal'; price: number; bg: string }>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [newBlocked, setNewBlocked] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState("");
  const [cardBal, setCardBal] = useState<number>(0);
  const [loadingBal, setLoadingBal] = useState(false);

  useEffect(() => {
    try { setName(getActiveWallet()?.name || ""); } catch {}
    try {
      const savedTheme = localStorage.getItem("dope_card_theme") as any;
      if (savedTheme === "teal" || savedTheme === "orange" || savedTheme === "purple") setCardTheme(savedTheme);
    } catch {}
    try {
      const list = JSON.parse(localStorage.getItem("dope_blocked_merchants") || "[]");
      if (Array.isArray(list)) setBlocked(list.filter((x) => typeof x === 'string'));
    } catch {}
    try {
      const raw = localStorage.getItem('dope_card_design');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.bg === 'string') setCardDesign(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!address) return;
      setLoadingBal(true);
      try {
        const r = await fetch(`/api/card/balance?pubkey=${address}`, { cache: 'no-store' });
        const j = await r.json();
        if (j?.ok) setCardBal(Number(j.balance || 0));
      } catch {}
      setLoadingBal(false);
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [address]);

  const holder = name || (address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "Unknown");
  const maskedAddr = useMemo(() => {
    if (!address) return "";
    const a = address.replace(/\s+/g, "");
    // Show first 6 and last 4, mask middle
    return `${a.slice(0, 6)} ${"•".repeat(4)} ${"•".repeat(4)} ${a.slice(-4)}`;
  }, [address]);

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Virtual Card</h1>

      <div className="rounded-2xl p-5 border border-white/10"
           style={{
             background: cardDesign?.bg || (cardTheme === 'teal'
               ? "linear-gradient(135deg, rgba(0,180,160,0.25), rgba(20,60,80,0.35))"
               : cardTheme === 'orange'
               ? "linear-gradient(135deg, rgba(255,170,60,0.28), rgba(90,60,20,0.35))"
               : "linear-gradient(135deg, rgba(165,140,255,0.25), rgba(60,60,120,0.35))"),
           }}>
        <div className="flex items-center justify-between">
          <img src="/dopelganga.svg" alt="dopelganga" className="h-5 w-auto opacity-90" />
        </div>
        <div className="mt-6 font-mono text-lg tracking-widest select-all">
          {maskedAddr || '—'}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10">
        <div className="text-xs text-white/60">Card Balance</div>
        <div className="text-2xl font-bold">{loadingBal ? '…' : cardBal.toFixed(2)} <span className="text-sm text-white/60">USDC</span></div>
        <div className="mt-2 flex gap-2">
          <Link href="/wallet/card/topup" className="btn">Top Up</Link>
        </div>
      </div>

      {/* Card management features removed for now. */}

      {/* Manage Card */}
      <div className="glass rounded-2xl p-4 border border-white/10 space-y-4">
        <div className="text-sm font-semibold">Manage Card</div>
        <div className="scroll-x-invisible -mx-1 px-1">
          <div className="flex gap-2 min-w-0">
            <button className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab==='walletpay'?'bg-white/10':''}`} onClick={()=>setTab('walletpay')}>Add card to Wallet pay</button>
            <button className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab==='design'?'bg-white/10':''}`} onClick={()=>setTab('design')}>Design new card</button>
            <button className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab==='blocked'?'bg-white/10':''}`} onClick={()=>setTab('blocked')}>Blocked Businesses</button>
            <button className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab==='pin'?'bg-white/10':''}`} onClick={()=>setTab('pin')}>Change PIN</button>
            <button className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab==='support'?'bg-white/10':''}`} onClick={()=>setTab('support')}>Get card support</button>
          </div>
        </div>

        {tab === 'walletpay' && (
          <div className="text-sm text-white/80 space-y-2">
            <div>Add this virtual card to your device wallet for quick access.</div>
            <div className="text-xs text-white/60">Integration coming soon. For now, use the Share button on your device to save the address.</div>
            <div className="flex gap-2">
              <button
                className="btn"
                onClick={async()=>{ if(!address) return; try{ await navigator.clipboard.writeText(address);}catch{} setMsg('Address copied'); setTimeout(()=>setMsg(''),1200); }}
              >Copy address</button>
              {msg && <div className="text-xs text-green-400 self-center">{msg}</div>}
            </div>
          </div>
        )}

        {tab === 'design' && (
          <div className="space-y-3 text-sm">
            <div className="text-white/80">Choose a style</div>
            <div className="text-xs text-white/60">Open the designer to browse Classic ($5) and Metal ($50) styles.</div>
            <Link href="/card/design" className="btn">Open Designer</Link>
            {cardDesign && (
              <div className="text-xs text-white/60">Current: {cardDesign.name} ({cardDesign.type}) — ${cardDesign.price}</div>
            )}
          </div>
        )}

        {tab === 'blocked' && (
          <div className="space-y-3 text-sm">
            <div className="text-white/80">Blocked Businesses</div>
            <div className="flex gap-2">
              <input
                value={newBlocked}
                onChange={(e)=>setNewBlocked(e.target.value)}
                placeholder="Business name or domain"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
              />
              <button
                className="btn"
                onClick={()=>{
                  const v = newBlocked.trim();
                  if(!v) return;
                  const next = Array.from(new Set([...(blocked||[]), v]));
                  setBlocked(next);
                  setNewBlocked("");
                  try { localStorage.setItem('dope_blocked_merchants', JSON.stringify(next)); } catch {}
                }}
              >Add</button>
            </div>
            <div className="space-y-2">
              {blocked.length === 0 && <div className="text-white/60">No blocked businesses.</div>}
              {blocked.map((b, i) => (
                <div key={b+String(i)} className="flex items-center justify-between p-2 rounded border border-white/10">
                  <div className="truncate max-w-[70%]">{b}</div>
                  <button className="text-xs underline text-white/70" onClick={()=>{
                    const next = blocked.filter((x, idx)=> idx!==i);
                    setBlocked(next);
                    try { localStorage.setItem('dope_blocked_merchants', JSON.stringify(next)); } catch {}
                  }}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pin' && (
          <div className="space-y-3 text-sm">
            <div className="text-white/80">Change PIN</div>
            <div className="grid grid-cols-2 gap-2">
              <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="New PIN" value={pin} onChange={(e)=>setPin(e.target.value.replace(/[^0-9]/g,''))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
              <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="Confirm PIN" value={pin2} onChange={(e)=>setPin2(e.target.value.replace(/[^0-9]/g,''))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
            </div>
            <button className="btn" onClick={()=>{
              setMsg("");
              if (!pin || pin !== pin2 || pin.length < 4) { setMsg('Enter matching 4-6 digit PIN'); return; }
              try { localStorage.setItem('dope_card_pin_set','1'); } catch {}
              setMsg('PIN updated on this device');
              setPin(''); setPin2('');
              setTimeout(()=>setMsg(''), 1500);
            }}>Update PIN</button>
            {msg && <div className="text-xs text-green-400">{msg}</div>}
            <div className="text-xs text-white/60">PIN is stored locally for UI actions only.</div>
          </div>
        )}

        {tab === 'support' && (
          <div className="space-y-2 text-sm text-white/80">
            <div>Need help with your card?</div>
            <div className="text-white/60 text-xs">For issues with your virtual card UI, contact support via the app store listing or email support@example.com.</div>
          </div>
        )}
      </div>

      {!address && (
        <div className="text-white/70 text-sm">No wallet yet. <Link href="/get-started" className="underline">Create one</Link>.</div>
      )}
    </div>
  );
}
