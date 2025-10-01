"use client";
import React, { useEffect, useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getQuote, swap, SOL_MINT } from "../lib/raydiumSwap";
import Link from "next/link";
import TokenDetailModal from "./TokenDetailModal";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useRouter } from "next/navigation";
import { useWallet } from "../components/WalletProvider";
import { getSolBalance, getStoredWallet, subscribeBalance, getDopeTokenBalance } from "../lib/wallet";
import { syncDopeTokenAccounts } from "../lib/dopeToken";
import TxList from "../components/TxList";
import SendTokenForm from "../components/SendTokenForm";

function formatTokenAmount(amount: number | null, symbol: string): string {
  if (amount === null) return "—";
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B ${symbol}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${symbol}`;
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
}

export default function Home() {
  const router = useRouter();
  const { address, unlocked, hasWallet, keypair, ready } = useWallet() as any;
  const [balance, setBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [dopeSpl, setDopeSpl] = useState<number | null>(null);
  const [dopePrice, setDopePrice] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  // Top-level fallback UI for runtime errors
  const [fatalError, setFatalError] = useState<string>("");

  // Move swap UI state hooks to top level
  const [showSwap, setShowSwap] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState<{mint: string, name: string} | null>(null);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapResult, setSwapResult] = useState<string>("");
  const [swapError, setSwapError] = useState<string>("");
  const [tokenA, setTokenA] = useState("So11111111111111111111111111111111111111112"); // default SOL
  const [tokenB, setTokenB] = useState("FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33"); // default DOPE
  const [swapDirection, setSwapDirection] = useState(true); // true: A->B, false: B->A
  const [slippage, setSlippage] = useState(0.5); // default 0.5%
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{[mint: string]: number}>({});

  useEffect(() => {
    fetch("/tokenlist.json")
      .then(res => res.json())
      .then(setTokenList)
      .catch(() => setTokenList([]));
    // Fetch prices for all tokens in tokenList
    const ids = ["solana", "dope"];
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`)
      .then(res => res.json())
      .then(data => {
        const prices: {[mint: string]: number} = {};
        prices["So11111111111111111111111111111111111111112"] = data?.solana?.usd ?? null;
        prices["FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33"] = data?.dope?.usd ?? 0.01;
        setTokenPrices(prices);
        setSolPrice(data?.solana?.usd ?? null);
        setDopePrice(data?.dope?.usd ?? 0.01);
      })
      .catch(() => {
        setTokenPrices({"So11111111111111111111111111111111111111112": null, "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33": 0.01});
      });
  }, []);

  // Do not auto-redirect to /unlock to avoid flicker; surface contextual Unlock links instead
  // Debug output for address and errors
  useEffect(() => {
    if (!address) return;
    let unsub: null | (() => void) = null;
    let iv: any = null;
    const refresh = async () => {
      try {
        const bal = await getSolBalance(address);
        setBalance(bal);
      } catch (e: any) {
        setBalance(null);
        setFatalError("Failed to fetch SOL balance. Please check your network or RPC endpoint. " + (e?.message || ""));
      }
      try {
        const spl = await getDopeTokenBalance(address);
        setDopeSpl(spl);
      } catch (e: any) {
        setDopeSpl(null);
        setFatalError("Failed to fetch DOPE token balance. Please check your network or RPC endpoint. " + (e?.message || ""));
      }
    };
    refresh();
    try {
      unsub = subscribeBalance(address, (b) => {
        setBalance(b);
        refresh(); // also refresh SPL and history instantly on SOL change
      });
    } catch (e: any) {
      // ignore
    }
    if (!unsub) {
      iv = setInterval(refresh, 3000); // faster polling for instant updates
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
  if (fatalError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="text-2xl font-bold text-red-400 mb-4">A network or runtime error occurred</div>
        <div className="text-white/80 mb-4">{fatalError}</div>
        <button className="btn" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
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
    <ErrorBoundary>
      <div className="pb-24 space-y-6">
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-xs text-white/60">Address</div>
        <div className="font-mono break-all text-sm">{address}</div>
        <div className="mt-4 text-xs text-white/60">Balance</div>
        <div className="text-3xl font-bold">{balance === null ? "—" : balance.toFixed(4)} <span className="text-base font-medium text-white/60">SOL</span></div>
        {solPrice && balance !== null && (
          <div className="text-lg text-green-400 mt-2">${(balance * solPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/wallet/send" className="btn text-center">Send</Link>
        <Link href="/wallet/receive" className="btn text-center">Receive</Link>
        <button className="btn text-center" onClick={() => setShowSwap(true)}>Swap</button>
      </div>

      {showSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="rounded-2xl p-6 w-full max-w-md border border-white/10" style={{background: '#000'}}>
            <h2 className="text-lg font-semibold mb-4 text-white">Swap Tokens</h2>
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <select
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={tokenA}
                  onChange={e => setTokenA(e.target.value)}
                  disabled={!swapDirection}
                >
                  {tokenList.map(t => (
                    <option key={t.mint} value={t.mint}>{t.name} ({t.symbol})</option>
                  ))}
                </select>
                <img src={tokenList.find(t => t.mint === tokenA)?.logo || "/logo-192.png"} alt="tokenA" className="w-8 h-8 rounded-full" />
              </div>
              <button className="btn w-full" onClick={handleSwitch}>⇅ Switch</button>
              <div className="flex gap-2 items-center">
                <select
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                  value={tokenB}
                  onChange={e => setTokenB(e.target.value)}
                  disabled={swapDirection}
                >
                  {tokenList.map(t => (
                    <option key={t.mint} value={t.mint}>{t.name} ({t.symbol})</option>
                  ))}
                </select>
                <img src={tokenList.find(t => t.mint === tokenB)?.logo || "/logo-192.png"} alt="tokenB" className="w-8 h-8 rounded-full" />
              </div>
              <input
                type="number"
                min="0"
                step="any"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none mt-2 text-white"
                placeholder="Amount to swap"
                value={swapAmount}
                onChange={e => setSwapAmount(Number(e.target.value))}
              />
              <div className="flex items-center gap-2">
                <span className="text-white/70">Slippage</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 outline-none text-white"
                  value={slippage}
                  onChange={e => setSlippage(Number(e.target.value))}
                />
                <span className="text-white/60">%</span>
              </div>
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
        {tokenList.map((token, idx) => {
          const isSol = token.mint === "So11111111111111111111111111111111111111112";
          const isDope = token.mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33";
          const tokenBalance = isSol ? balance : isDope ? dopeSpl : null;
          return (
            <div
              key={token.mint}
              className={`flex items-center justify-between py-2${idx > 0 ? " border-t border-white/10 mt-2 pt-2" : ""} cursor-pointer`}
              onClick={() => setShowTokenInfo({ mint: token.mint, name: `${token.name} (${token.symbol})` })}
            >
              <div className="flex items-center gap-3">
                <img src={token.logo || "/logo-192.png"} alt={token.symbol} className="w-9 h-9 rounded-full" />
                <div>
                  <div className="text-sm font-semibold">{token.name} <span className="text-xs text-white/60">{token.symbol}</span></div>
                  <div className="text-sm font-semibold mt-1">{formatTokenAmount(tokenBalance, token.symbol)}</div>
                  <div className="text-xs text-green-400 mt-1">
                    {tokenBalance !== null && tokenPrices[token.mint] ? `$${(tokenBalance * tokenPrices[token.mint]).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD` : "—"}
                  </div>
                  {/* ...no debug info... */}
                </div>
              </div>
              <div className="flex items-center gap-3 max-w-[60px] truncate text-right">
                {/* Unlock link removed; unlock modal will appear only when needed */}
              </div>
            </div>
          );
        })}
        {showTokenInfo && (
          <TokenDetailModal
            mint={showTokenInfo.mint}
            name={showTokenInfo.name}
            address={address}
            keypair={keypair}
            balance={showTokenInfo.mint === "So11111111111111111111111111111111111111112" ? balance : dopeSpl}
            onClose={() => setShowTokenInfo(null)}
          />
        )}
      </div>

  <TxList address={address || undefined} key={address} />
    </div>
    </ErrorBoundary>
  );
}


