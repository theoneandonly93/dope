// ...existing code...
"use client";
import React, { useEffect, useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getQuote, swap, SOL_MINT } from "../lib/raydiumSwap";
import Link from "next/link";
import { ErrorBoundary } from "../components/ErrorBoundary";
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
      iv = setInterval(refresh, 5000);
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

  const [showSwap, setShowSwap] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState<{mint: string, name: string} | null>(null);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapResult, setSwapResult] = useState<string>("");
  const [swapError, setSwapError] = useState<string>("");
  const [tokenA, setTokenA] = useState("So11111111111111111111111111111111111111112"); // default SOL
  const [tokenB, setTokenB] = useState("FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33"); // default DOPE
  const [swapDirection, setSwapDirection] = useState(true); // true: A->B, false: B->A

  const handleSwap = async () => {
    setSwapError("");
    setSwapResult("");
    if (!keypair || swapAmount <= 0 || !tokenA || !tokenB) {
      setSwapError("Unlock wallet, enter valid amount and token addresses.");
      return;
    }
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com");
      // Use lamports for SOL, token decimals for SPL
      const amount = swapAmount;
      const quote = await getQuote(tokenA, tokenB, amount);
      const txid = await swap({ connection, ownerKeypair: keypair, quote });
      setSwapResult(`Swap successful! Transaction: ${txid}`);
    } catch (e: any) {
      setSwapError(e?.message || "Swap failed");
    }
  };

  const handleSwitch = () => {
    setSwapDirection(!swapDirection);
    const temp = tokenA;
    setTokenA(tokenB);
    setTokenB(temp);
  };
  return (
    <ErrorBoundary>
      <div className="pb-24 space-y-6">
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-xs text-white/60">Address</div>
        <div className="font-mono break-all text-sm">{address}</div>
        <div className="mt-4 text-xs text-white/60">Balance</div>
        <div className="text-3xl font-bold">{balance === null ? "—" : balance.toFixed(4)} <span className="text-base font-medium text-white/60">SOL</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/wallet/send" className="btn text-center">Send</Link>
        <Link href="/wallet/receive" className="btn text-center">Receive</Link>
        <button className="btn text-center" onClick={() => setShowSwap(true)}>Swap</button>
      </div>

      {showSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass rounded-2xl p-6 border border-white/10 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Swap Tokens</h2>
            <div className="mb-2 flex flex-col gap-2">
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
                placeholder="Token A Mint Address"
                value={tokenA}
                onChange={e => setTokenA(e.target.value)}
                disabled={!swapDirection}
              />
              <button className="btn w-full" onClick={handleSwitch}>⇅ Switch</button>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
                placeholder="Token B Mint Address"
                value={tokenB}
                onChange={e => setTokenB(e.target.value)}
                disabled={swapDirection}
              />
              <input
                type="number"
                min="0"
                step="any"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none mt-2"
                placeholder="Amount to swap"
                value={swapAmount}
                onChange={e => setSwapAmount(Number(e.target.value))}
              />
            </div>
            <button className="btn w-full mb-2" onClick={handleSwap}>Swap</button>
            {swapResult && <div className="text-green-400 text-sm mb-2">{swapResult}</div>}
            {swapError && <div className="text-red-400 text-sm mb-2">{swapError}</div>}
            <button className="btn w-full" onClick={() => setShowSwap(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Tokens</div>
          <button className="btn text-xs" style={{marginLeft: 'auto'}} onClick={() => alert('Manage tokens coming soon!')}>Manage Token</button>
        </div>
        <div className="flex items-center justify-between py-2 cursor-pointer" onClick={() => setShowTokenInfo({mint: "So11111111111111111111111111111111111111112", name: "Solana (native)"})}>
          <div className="flex items-center gap-3">
            <img src="/logo-192.png" alt="Solana" className="w-9 h-9 rounded-full" />
            <div>
              <div className="text-sm font-semibold">Solana (native)</div>
              <div className="text-xs text-white/60">Network currency (SOL)</div>
            </div>
          </div>
          <div className="text-sm font-semibold">{balance === null ? "—" : balance.toFixed(4)} SOL</div>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2 pt-2 cursor-pointer" onClick={() => setShowTokenInfo({mint: "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33", name: "DOPE (SPL)"})}>
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

  <TxList address={address || undefined} />
    </div>
    </ErrorBoundary>
  );
}


