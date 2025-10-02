"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../components/WalletProvider";
import { getActiveWallet, getStoredWallet, setActiveWalletName, getActiveWalletSecrets } from "../../lib/wallet";

export default function SettingsPage() {
  const router = useRouter();
  const { address, unlocked } = useWallet();
  const [name, setName] = useState("");
  const [scheme, setScheme] = useState<"password" | "device" | "" >("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [pw, setPw] = useState("");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [skB64, setSkB64] = useState<string | null>(null);
  const [revealPending, setRevealPending] = useState(false);

  useEffect(() => {
    try {
      const aw = getActiveWallet();
      if (aw?.name) setName(aw.name);
      const stored = getStoredWallet();
      if (stored?.scheme) setScheme(stored.scheme as any);
    } catch {}
  }, []);

  const save = async () => {
    setErr(""); setMsg(""); setSaving(true);
    try {
      setActiveWalletName(name || "");
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reveal = async () => {
    setErr(""); setMsg(""); setRevealPending(true);
    try {
      const secrets = await getActiveWalletSecrets(scheme === "password" ? pw : undefined);
      setMnemonic(secrets.mnemonic);
      setSkB64(secrets.secretKeyB64);
    } catch (e: any) {
      setErr(e?.message || "Failed to reveal secrets");
    } finally {
      setRevealPending(false);
    }
  };

  const copy = async (text: string | null) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setMsg("Copied"); setTimeout(()=>setMsg(""), 1200); } catch {}
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3">
        <div className="text-xs text-white/60">Display Name</div>
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Optional name for this wallet"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
        />
        {err && <div className="text-xs text-red-400">{err}</div>}
        {msg && <div className="text-xs text-green-400">{msg}</div>}
        <div className="flex gap-2">
          <button className="btn" onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</button>
          <button className="btn" onClick={()=>router.back()}>Back</button>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-3 mt-8">
        <div className="text-sm font-semibold">Sensitive Info</div>
        <div className="text-xs text-white/70">Reveal your seed phrase and private key only in a secure environment. Never share with anyone.</div>
        {scheme === "password" && (
          <input
            type="password"
            value={pw}
            onChange={(e)=>setPw(e.target.value)}
            placeholder="Enter wallet password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
          />
        )}
        <button className="btn" onClick={reveal} disabled={revealPending || (scheme==='password' && pw.length<4)}>
          {revealPending?"Revealing...":"Reveal Secrets"}
        </button>
        {mnemonic && (
          <div className="mt-3">
            <div className="text-xs text-white/60 mb-1">Seed Phrase</div>
            <div className="font-mono text-sm leading-7 select-all break-words">{mnemonic}</div>
            <button className="text-xs underline mt-1 text-white/70" onClick={()=>copy(mnemonic)}>Copy seed phrase</button>
          </div>
        )}
        {skB64 && (
          <div className="mt-3">
            <div className="text-xs text-white/60 mb-1">Secret Key (base64)</div>
            <div className="font-mono text-sm break-all select-all">{skB64}</div>
            <button className="text-xs underline mt-1 text-white/70" onClick={()=>copy(skB64)}>Copy secret key</button>
          </div>
        )}
      </div>
      {/* Admin Support Chat Portal */}
      <div className="mt-8">
        {React.createElement(require('../../components/AdminSupportChat').default)}
      </div>
    </div>
  );
}

