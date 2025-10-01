"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "../components/WalletProvider";
import { getSolBalance, getStoredWallet, subscribeBalance, getDopeTokenBalance } from "../lib/wallet";
import { syncDopeTokenAccounts } from "../lib/dopeToken";
import TxList from "../components/TxList";

export default function Home() {
  const router = useRouter();
  const { address, unlocked, hasWallet, keypair, ready } = useWallet() as any;
  const [balance, setBalance] = useState<number | null>(null);
  const [dopeSpl, setDopeSpl] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  // Do not auto-redirect to /unlock to avoid flicker; surface contextual Unlock links instead

  useEffect(() => {
    if (!address) return;
    let unsub: null | (() => void) = null;
    let iv: any = null;
    const refresh = () => getSolBalance(address).then(setBalance).catch(() => setBalance(null));
    refresh();
    // fetch DOPE SPL balance in parallel
    getDopeTokenBalance(address).then(setDopeSpl).catch(()=>setDopeSpl(null));
    try {
      unsub = subscribeBalance(address, setBalance);
    } catch {
      // ignore
    }
    if (!unsub) {
      iv = setInterval(refresh, 15000);
    }
    return () => { unsub?.(); if (iv) clearInterval(iv); };
  }, [address]);

  const onSyncDope = async () => {
    setSyncMsg("");
    setSyncing(true);
    try {
      // Obtain keypair via unlock; prompt user to unlock if not unlocked
      // We don't have direct keypair here; rely on unlock gate in flow
      if (!keypair) { setSyncMsg('Unlock the wallet first, then try again.'); return; }
      const res = await syncDopeTokenAccounts(keypair);
      setSyncMsg(`Synced. Consolidated ${res.movedUi.toFixed(6)} DOPE to ATA.`);
      if (address) getDopeTokenBalance(address).then(setDopeSpl).catch(()=>{});
    } catch (e: any) {
      setSyncMsg(e?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (!hasWallet) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-semibold">Welcome to DOPE</h1>
        <p className="text-white/70 text-sm">Create a DOPE wallet in seconds.</p>
        <Link href="/get-started" className="btn w-full text-center">Get Started</Link>
        <div className="text-center text-xs text-white/60">
          Already have a wallet? <Link href="/wallet/import" className="underline">Import</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-xs text-white/60">Address</div>
        <div className="font-mono break-all text-sm">{address}</div>
        <div className="mt-4 text-xs text-white/60">Balance</div>
        <div className="text-3xl font-bold">{balance === null ? "—" : balance.toFixed(4)} <span className="text-base font-medium text-white/60">DOPE</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/wallet/send" className="btn text-center">Send</Link>
        <Link href="/wallet/receive" className="btn text-center">Receive</Link>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-sm font-semibold mb-2">Tokens</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <img src="/logo-192.png" alt="DOPE" className="w-9 h-9 rounded-full" />
            <div>
              <div className="text-sm font-semibold">DOPE (native)</div>
              <div className="text-xs text-white/60">Network currency (SOL)</div>
            </div>
          </div>
          <div className="text-sm font-semibold">{balance === null ? "—" : balance.toFixed(4)} DOPE</div>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2 pt-2">
          <div className="flex items-center gap-3">
            <img src="/logo-192.png" alt="DOPE" className="w-9 h-9 rounded-full" />
            <div>
              <div className="text-sm font-semibold">DOPE (SPL)</div>
              <div className="text-xs text-white/60">Token balance (mint)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">{dopeSpl === null ? "—" : dopeSpl.toFixed(4)} DOPE</div>
            <button className="btn text-xs" onClick={onSyncDope} disabled={syncing || !keypair}>{syncing? 'Syncing…' : 'Sync'}</button>
            {!keypair && (
              <Link href="/unlock" className="text-xs underline text-white/70">Unlock</Link>
            )}
          </div>
        </div>
        {syncMsg && <div className="text-xs text-white/70 mt-2">{syncMsg}</div>}
      </div>

      <TxList address={address!} />

      
    </div>
  );
}
