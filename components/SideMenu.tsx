"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletOptional } from "./WalletProvider";
import {
  getWallets,
  selectWallet,
  getStoredWallet,
  changePassword,
  setPasswordForDeviceWallet,
} from "../lib/wallet";
import { copyText, hapticLight } from "../lib/clipboard";

export default function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const ctx = useWalletOptional();
  const address = ctx?.address || null;
  const logout = ctx?.logout || (() => {});
  const [tab, setTab] = useState<"profile" | "wallets" | "settings" | "developer">("profile");
  const [scheme, setScheme] = useState<string>("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [wallets, setWallets] = useState<ReturnType<typeof getWallets>>([]);

  useEffect(() => {
    if (!open) return;
    setWallets(getWallets());
    const stored = getStoredWallet();
    setScheme(stored?.scheme || "");
  }, [open]);

  const doCopy = async () => {
    const ok = await copyText(address || "");
    if (ok) { hapticLight(); setMsg("Address copied"); setTimeout(()=>setMsg(""), 1500); }
  };

  const applyPasswordChange = async () => {
    setErr(""); setMsg("");
    try {
      if (scheme === "password") {
        if (!currentPwd || !newPwd || newPwd !== confirm) throw new Error("Check passwords");
        await changePassword(currentPwd, newPwd);
        setMsg("Password updated");
      } else if (scheme === "device") {
        if (!newPwd || newPwd !== confirm) throw new Error("Enter and confirm new password");
        await setPasswordForDeviceWallet(newPwd);
        setMsg("Password set for wallet");
        setScheme("password");
      }
      setCurrentPwd(""); setNewPwd(""); setConfirm("");
    } catch (e: any) {
      setErr(e?.message || "Failed to update password");
    }
  };

  const onSelectWallet = (id: string) => {
    selectWallet(id);
    setWallets(getWallets());
    onClose();
    router.replace("/");
  };

  return (
    <div className={`fixed inset-0 ${open ? '' : 'pointer-events-none'} z-50`}> 
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute inset-y-0 left-0 w-[82vw] max-w-[340px] bg-[#12131a] border-r border-white/10 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-192.png" alt="logo" className="w-6 h-6" />
            <span className="font-semibold">Menu</span>
          </div>
          <button onClick={onClose} className="text-white/70" aria-label="Close">×</button>
        </div>
        <div className="px-4 pt-3 text-sm">
          <div className="scroll-x-invisible flex gap-3 pr-1">
            <button className={`px-3 py-2 rounded-lg ${tab==='profile'?'bg-white/10':''}`} onClick={()=>setTab('profile')}>Profile</button>
            <button className={`px-3 py-2 rounded-lg ${tab==='wallets'?'bg-white/10':''}`} onClick={()=>setTab('wallets')}>Wallets</button>
            <button className={`px-3 py-2 rounded-lg ${tab==='settings'?'bg-white/10':''}`} onClick={()=>setTab('settings')}>Settings</button>
            <button className={`px-3 py-2 rounded-lg ${tab==='developer'?'bg-white/10':''}`} onClick={()=>setTab('developer')}>Developer</button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-white/60">Active Address</div>
                <div className="font-mono text-sm break-all">{address}</div>
                <div className="mt-2 flex gap-2 items-center">
                  <button
                    className="px-2.5 py-1.5 text-xs rounded-md border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors"
                    onClick={doCopy}
                  >
                    Copy
                  </button>
                  <button
                    className="px-2 py-1.5 text-xs rounded-md border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors flex items-center gap-1"
                    title="Public profile"
                    onClick={() => { onClose(); if (address) router.push(`/u/${encodeURIComponent(address)}`); else router.push('/u'); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7z"/></svg>
                    Profile
                  </button>
                  <button
                    className="px-2.5 py-1.5 text-xs rounded-md border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 active:bg-red-500/20 text-red-200 transition-colors"
                    onClick={() => { logout(); onClose(); }}
                  >
                    Logout
                  </button>
                </div>
                {msg && <div className="text-xs text-green-400 mt-2">{msg}</div>}
              </div>
              <div className="glass rounded-xl p-3 border border-white/10">
                <div className="font-semibold mb-2">{scheme === 'password' ? 'Change Password' : 'Set Password'}</div>
                {scheme === 'password' && (
                  <input type="password" placeholder="Current password" value={currentPwd} onChange={(e)=>setCurrentPwd(e.target.value)} className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
                )}
                <input type="password" placeholder="New password" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
                <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
                {err && <div className="text-xs text-red-400 mb-2">{err}</div>}
                <button className="btn w-full" onClick={applyPasswordChange}>{scheme === 'password' ? 'Update Password' : 'Set Password'}</button>
              </div>
            </div>
          )}

          {tab === 'wallets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Wallets</div>
                <button className="btn" onClick={() => { onClose(); router.push('/wallet/add'); }}>+ Add</button>
              </div>
              <div className="space-y-2">
                {wallets.map((w) => (
                  <button key={w.id} onClick={() => onSelectWallet(w.id)} className={`w-full text-left p-3 rounded-lg border ${address===w.pubkey? 'border-white/40 bg-white/5' : 'border-white/10 bg-white/0'}`}>
                    <div className="text-xs text-white/60">{w.name || 'Wallet'}</div>
                    <div className="font-mono text-sm break-all">{w.pubkey}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-3">
              <div className="text-sm text-white/80">Manage your wallet preferences.</div>
              <button className="btn" onClick={() => { onClose(); router.push('/settings'); }}>Open Settings</button>
              <button className="btn" onClick={() => { onClose(); router.push('/privacy'); }}>Privacy & Terms</button>
            </div>
          )}

          {tab === 'developer' && (
            <div className="space-y-3">
              <div className="text-sm text-white/80">Developer options for network selection.</div>
              <button className="btn" onClick={() => { onClose(); router.push('/settings/developer'); }}>Open Developer Settings</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
