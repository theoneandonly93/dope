"use client";
import React, { useEffect, useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { getQuote, swap, SOL_MINT } from "../lib/raydiumSwap";
import Link from "next/link";
// import TokenDetailModal from "./TokenDetailModal"; // replaced by dynamic route /token/[mint]
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useRouter } from "next/navigation";
import { useWallet } from "../components/WalletProvider";
import { getSolBalance, getSolBalanceRobust, getStoredWallet, subscribeBalance, getDopeTokenBalance } from "../lib/wallet";
import { syncDopeTokenAccounts } from "../lib/dopeToken";

// Removed home Recent Activity card; keep TxList usage on token detail only

import SendTokenForm from "../components/SendTokenForm";
import SuggestedTokens from "../components/SuggestedTokens";
import SelectTokenModal from "../components/SelectTokenModal";
import dynamic from "next/dynamic";
const PhantomSwapModal = dynamic(() => import('../components/PhantomSwapModal'), { ssr: false });

function formatTokenAmount(amount: number | null, symbol: string): string {
  if (amount === null) return "—";
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B ${symbol}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${symbol}`;
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
}

import ManageTokensModal from "../components/ManageTokensModal";
import { fetchFairbrixStats, getStoredFairbrixAddress } from "../lib/fairbrix";

export default function Home() {
  const [activeChain, setActiveChain] = useState<'solana'|'eth'|'btc'|'ape'|'bnb'|'sei'>('solana');
  const [activeTab, setActiveTab] = useState<'tokens'|'nfts'>('tokens');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTokenMint, setSendTokenMint] = useState<string|null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  // Always show SOL, BTC, ETH, BNB by default unless user turns off
  const defaultTokens = [
    "So11111111111111111111111111111111111111112", // SOL
    "btc", // BTC
    "eth", // ETH
    "bnb" // BNB
  ];
  const [shownTokens, setShownTokens] = useState<string[]>(defaultTokens);
  const router = useRouter();
  const { address, unlocked, hasWallet, keypair, ready } = useWallet() as any;
  // Multi-chain balances
  const [balances, setBalances] = useState<{[chain: string]: number | null}>({ solana: null, eth: null, btc: null, ape: null, bnb: null, sei: null, base: null });
  const [solError, setSolError] = useState<string>("");
  const [lastSolFetch, setLastSolFetch] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [dopeSpl, setDopeSpl] = useState<number | null>(null);
  const [dopePrice, setDopePrice] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  // (Removed debug state previously used for Solscan API response)

  // Top-level fallback UI for runtime errors
  const [fatalError, setFatalError] = useState<string>("");
  const [showRpcError, setShowRpcError] = useState(true);
  const [rpcStatus, setRpcStatus] = useState<{status:string,url:string,error?:string}|null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [newSeed, setNewSeed] = useState<string | null>(null);
  const [newSk58, setNewSk58] = useState<string>("");

  // Move swap UI state hooks to top level
  const [showSwap, setShowSwap] = useState(false);
  // const [showTokenInfo, setShowTokenInfo] = useState<{mint: string, name: string, intent?: string} | null>(null);
  // Listen for suggested token events
  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail || {};
      if (!d.mint) return;
      try {
        const intent = d.intent && (d.intent === 'buy' || d.intent === 'sell') ? `&intent=${d.intent}` : '';
        router.push(`/token/${encodeURIComponent(d.mint)}?from=suggested${intent}`);
      } catch {}
    };
    window.addEventListener('dope:token-detail', handler as any);
    return () => window.removeEventListener('dope:token-detail', handler as any);
  }, [router]);
  const [swapAmount, setSwapAmount] = useState(0);
  const [swapResult, setSwapResult] = useState<string>("");
  const [swapError, setSwapError] = useState<string>("");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [swapDirection, setSwapDirection] = useState(true); // true: A->B, false: B->A
  const [slippage, setSlippage] = useState(0.5); // default 0.5%
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{[mint: string]: number}>({});
  const [swapLoading, setSwapLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [latestQuote, setLatestQuote] = useState<any|null>(null);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [quoteOutUi, setQuoteOutUi] = useState<string>("");
  const [quotePriceImpact, setQuotePriceImpact] = useState<number|null>(null);
  // Fairbrix read-only stats
  const [fairbrixAddr, setFairbrixAddr] = useState<string>("");
  const [fairbrixStats, setFairbrixStats] = useState<{ unpaid?: number; totalPayouts?: number; workers?: number; updated?: number } | null>(null);
  const [fairbrixLoading, setFairbrixLoading] = useState(false);

  useEffect(() => {
    try { const fa = getStoredFairbrixAddress(); if (fa) setFairbrixAddr(fa); } catch {}
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const addr = fairbrixAddr?.trim();
      if (!addr) { setFairbrixStats(null); return; }
      setFairbrixLoading(true);
      const s = await fetchFairbrixStats(addr);
      if (!cancelled) setFairbrixStats(s);
      if (!cancelled) setFairbrixLoading(false);
    }
    load();
    const iv = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [fairbrixAddr]);

  useEffect(() => {
    fetch("/tokenlist.json")
      .then(res => res.json())
      .then(setTokenList)
      .catch(() => setTokenList([]));
    // Fetch prices for all tokens in tokenList
    const ids = ["solana"]; 
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`)
      .then(res => res.json())
      .then(data => {
        const prices: {[mint: string]: number} = {};
        prices["So11111111111111111111111111111111111111112"] = data?.solana?.usd ?? null;
        setTokenPrices(prices);
        setSolPrice(data?.solana?.usd ?? null);
        setDopePrice(null);
      })
      .catch(() => {
        setTokenPrices({"So11111111111111111111111111111111111111112": null});
      });
  }, []);

  // Listen for swap-complete events to trigger immediate balance refresh
  useEffect(() => {
    const handler = (e: any) => {
      if (!address) return;
  // Re-query SOL quickly; token balances refresh via aggregated API
      getSolBalance(address).then(v => setBalances(b => ({ ...b, solana: v }))).catch(()=>{});
    };
    window.addEventListener('swap-complete', handler as any);
    return () => window.removeEventListener('swap-complete', handler as any);
  }, [address]);

  // Do not auto-redirect to /unlock to avoid flicker; surface contextual Unlock links instead
  // Debug output for address and errors
  useEffect(() => {
    if (!address) return;
    let iv: any = null;
    let unsub: (() => void) | null = null;
    const fetchBalances = async () => {
      const newBalances: {[chain: string]: number | null} = { solana: null, eth: null, btc: null, ape: null, bnb: null, sei: null, base: null };
      // Solana
      try {
        setSolError("");
        let solBalance = await getSolBalance(address);
        // If zero or clearly stale, try robust path
        if (solBalance === 0) {
          const robust = await getSolBalanceRobust(address).catch(()=>null);
          if (robust !== null) solBalance = robust; else setSolError('All RPC endpoints failed');
        }
  // Removed Solscan debug capture
        // If RPC returns 0, try Solscan API as fallback
        if (solBalance === 0) {
          try {
            const solscanRes = await fetch(`https://public-api.solscan.io/account/${address}`);
            const solscanJson = await solscanRes.json();
            if (solscanJson?.lamports !== undefined) solBalance = solscanJson.lamports / 1_000_000_000;
            // If still 0, try scraping Solscan HTML
            if (solBalance === 0) {
              const htmlRes = await fetch(`https://solscan.io/account/${address}`);
              const htmlText = await htmlRes.text();
              const match = htmlText.match(/Balance\s*([\d,.]+)\s*SOL/);
              if (match && match[1]) {
                const scraped = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(scraped)) solBalance = scraped;
              }
            }
          } catch {}
        }
        newBalances.solana = solBalance;
        setLastSolFetch(Date.now());
  // Debug removal: no-op
      } catch (e: any) {
        newBalances.solana = null;
        setFatalError("Failed to fetch SOL balance. " + (e?.message || ""));
        setShowRpcError(true);
      }
      // Unified Solana token balances (DOPE, DWT, others) via new API route
      try {
        const aggRes = await fetch(`/api/wallet/${address}/balances`);
        const aggJson = await aggRes.json();
        if (aggJson?.ok) {
          const tokens: any[] = aggJson.tokens || [];
            const dope = tokens.find(t => t.mint === 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33');
            const dwt = tokens.find(t => t.mint === '4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts');
            if (dope) setDopeSpl(dope.uiAmount);
            else setDopeSpl(0);
            if (dwt) (newBalances as any).dwt = dwt.uiAmount; else (newBalances as any).dwt = 0;
        }
      } catch {}
      // ETH
      try {
        const ethRes = await fetch(`https://api.blockchair.com/ethereum/dashboards/address/${address}`);
        const ethJson = await ethRes.json();
        newBalances.eth = ethJson?.data?.[address]?.address?.balance ? Number(ethJson.data[address].address.balance) / 1e18 : 0;
      } catch (e: any) {
        newBalances.eth = null;
      }
      // BTC
      try {
        const btcRes = await fetch(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
        const btcJson = await btcRes.json();
        newBalances.btc = btcJson?.data?.[address]?.address?.balance ? Number(btcJson.data[address].address.balance) / 1e8 : 0;
      } catch (e: any) {
        newBalances.btc = null;
      }
      // BNB
      try {
        const bnbRes = await fetch(`https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=YourApiKeyToken`);
        const bnbJson = await bnbRes.json();
        newBalances.bnb = bnbJson?.result ? Number(bnbJson.result) / 1e18 : 0;
      } catch (e: any) {
        newBalances.bnb = null;
      }
      // Sei
      try {
        // Example: Sei mainnet REST API (replace with your address format if needed)
        const seiRes = await fetch(`https://rest.sei-apis.com/cosmos/bank/v1beta1/balances/${address}`);
        const seiJson = await seiRes.json();
        // Find SEI token balance (denom: 'usei')
        const seiBal = seiJson?.balances?.find((b: any) => b.denom === 'usei');
        newBalances.sei = seiBal ? Number(seiBal.amount) / 1e6 : 0;
      } catch (e: any) {
        newBalances.sei = null;
      }
      // Base
      try {
        // Example: BaseScan API (replace with your address format if needed)
        const baseRes = await fetch(`https://api.basescan.org/api?module=account&action=balance&address=${address}`);
        const baseJson = await baseRes.json();
        newBalances.base = baseJson?.result ? Number(baseJson.result) / 1e18 : 0;
      } catch (e: any) {
        newBalances.base = null;
      }
      // Ape
      try {
        // Example: Blockscout API for ApeChain (replace with your address format if needed)
        const apeRes = await fetch(`https://blockscout.apecoin.com/api?module=account&action=balance&address=${address}`);
        const apeJson = await apeRes.json();
        newBalances.ape = apeJson?.result ? Number(apeJson.result) / 1e18 : 0;
      } catch (e: any) {
        newBalances.ape = null;
      }
      setBalances(newBalances);
    };
    fetchBalances();
    iv = setInterval(fetchBalances, 15000); // poll every 15s (less aggressive, rely on subscription)
    // Live subscription (will update SOL immediately on account change)
    try {
      unsub = subscribeBalance(address, (bal) => {
        setBalances(b => ({ ...b, solana: bal }));
      });
    } catch {}
    return () => { if (iv) clearInterval(iv); if (unsub) unsub(); };
  }, [address]);

  // Listen for connection status events (failover / recovery)
  useEffect(() => {
    const handler = (e: any) => {
      setRpcStatus(e.detail);
      // auto clear after 6s
      setTimeout(() => setRpcStatus(rs => rs === e.detail ? null : rs), 6000);
    };
    window.addEventListener('dope:rpc', handler as any);
    return () => window.removeEventListener('dope:rpc', handler as any);
  }, []);

  // Check if a new wallet was just created and show reveal modal once
  useEffect(() => {
    try {
      const seed = sessionStorage.getItem('dope:new_wallet_seed');
      const sk58 = sessionStorage.getItem('dope:new_wallet_sk58');
      if (sk58) {
        setNewSeed(seed);
        setNewSk58(sk58);
        setRevealOpen(true);
        sessionStorage.removeItem('dope:new_wallet_seed');
        sessionStorage.removeItem('dope:new_wallet_sk58');
      }
    } catch {}
  }, []);

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

  async function fetchTokenDecimals(mint: string, connection: any): Promise<number> {
    if (mint === 'So11111111111111111111111111111111111111112') return 9; // SOL wrap
    try {
      const pk = new (await import('@solana/web3.js')).PublicKey(mint);
      const info = await connection.getParsedAccountInfo(pk);
      // @ts-ignore
      return info?.value?.data?.parsed?.info?.decimals ?? 9;
    } catch { return 9; }
  }

  const handleGetQuote = async () => {
    setSwapError("");
    setSwapResult("");
    setLatestQuote(null);
    setQuoteOutUi("");
    setQuotePriceImpact(null);
    if (!keypair || swapAmount <= 0 || !tokenA || !tokenB) {
      setSwapError("Unlock wallet, enter valid amount and token addresses.");
      return;
    }
    try {
      setQuoteLoading(true);
      const { getConnection } = await import("../lib/wallet");
      const connection = getConnection();
      const decIn = await fetchTokenDecimals(tokenA, connection);
      // Convert UI swapAmount into base units (floor for safety)
      const rawIn = Math.floor(swapAmount * Math.pow(10, decIn));
      if (rawIn <= 0) { setSwapError('Amount too small.'); setQuoteLoading(false); return; }
      const slippageBps = Math.max(0, Math.min(500, Math.round(slippage * 100))); // cap 5%
      const quote = await getQuote(tokenA, tokenB, rawIn, slippageBps);
      // Output tokens decimals for formatting
      const decOut = await fetchTokenDecimals(tokenB, connection);
      const outUi = quote.outAmount / Math.pow(10, decOut);
      setLatestQuote(quote);
      setQuoteOutUi(outUi.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      setQuotePriceImpact(quote.priceImpactPct ?? null);
      setShowSwapConfirm(true);
    } catch (e:any) {
      setSwapError(e?.message || 'Failed to fetch quote');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!latestQuote || !keypair) return;
    setSwapError("");
    setSwapResult("");
    try {
      setSwapLoading(true);
      const { getConnection } = await import("../lib/wallet");
      const connection = getConnection();
      const txid = await swap({ connection, ownerKeypair: keypair, quote: latestQuote });
      setSwapResult(`Swap successful! Transaction: ${txid}`);
      setShowSwapConfirm(false);
      // Refresh balances post swap
      if (address) {
        getSolBalance(address).then(v => setBalances(b => ({ ...b, solana: v }))).catch(()=>{});
        getDopeTokenBalance(address).then(setDopeSpl).catch(()=>{});
      }
    } catch (e:any) {
      setSwapError(e?.message || 'Swap failed');
    } finally {
      setSwapLoading(false);
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
      <div className="pb-24 space-y-6 w-full max-w-md mx-auto px-2 sm:px-0">
        {/* History icon moved to header */}
        {/* One-time reveal modal after account creation */}
        {revealOpen && (
          // @ts-ignore dynamic import type
          React.createElement(require('../components/RevealSecretsModal').default, { open: revealOpen, mnemonic: newSeed, secretBase58: newSk58, onClose: () => setRevealOpen(false) })
        )}
        {/* Multichain bar removed per spec */}
        {showRpcError && fatalError && (
          <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
            <div className="bg-yellow-900 text-yellow-200 border border-yellow-400 rounded-xl px-4 py-3 mt-4 shadow-lg max-w-md w-full flex items-center justify-between">
              ⚠️ Rate limit or RPC error: Balances may not be visible right now, but your funds are safe and will appear shortly.
              <button className="ml-4 text-yellow-300 hover:text-yellow-100" onClick={() => setShowRpcError(false)}>Dismiss</button>
            </div>
          </div>
        )}
        {rpcStatus && !fatalError && (
          <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
            <div className={`pointer-events-auto rounded-xl px-4 py-2 mt-2 shadow-md text-xs font-medium border ${rpcStatus.status==='failover' ? 'bg-orange-900/80 text-orange-200 border-orange-500' : rpcStatus.status==='recovered' ? 'bg-green-900/80 text-green-200 border-green-500' : 'bg-blue-900/80 text-blue-200 border-blue-500'}`}> 
              RPC {rpcStatus.status} → {rpcStatus.url.replace(/^https?:\/\//,'')} {rpcStatus.error ? `(${rpcStatus.error.slice(0,60)})` : ''}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 w-full">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">Balance</div>
            <span
              className={`w-3 h-3 rounded-full border border-white/20 ${balances[activeChain] !== null ? 'bg-green-500' : 'bg-red-500'}`}
              title={balances[activeChain] !== null ? 'Connected' : 'Not Connected'}
            />
          </div>
          <div className="text-3xl font-bold">
            {balances[activeChain] === null ? "—" : balances[activeChain]?.toFixed(4)}
            <span className="text-base font-medium text-white/60"> {activeChain.toUpperCase()}</span>
          </div>
          {/* Single aggregated USD value per chain (currently only Solana has multiple tracked tokens) */}
          {activeChain === 'solana' && (() => {
            const solUsd = (balances['solana'] !== null && solPrice) ? (balances['solana'] as number) * solPrice : 0;
            const dopeUsd = (dopeSpl !== null && dopePrice) ? dopeSpl * dopePrice : 0;
            // DWT currently reuses dopePrice as placeholder; adjust when real price available
            const dwtUsd = (balances['dwt'] !== null && balances['dwt'] !== undefined && dopePrice) ? (balances['dwt'] as number) * dopePrice : 0;
            const total = solUsd + dopeUsd + dwtUsd;
            if (total === 0) return null;
            return (
              <div className="text-lg text-green-400 mt-2">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</div>
            );
          })()}
          {fatalError && (
            <div className="text-xs text-red-400 mt-2">Error: {fatalError}</div>
          )}
          {activeChain === 'solana' && balances['solana'] === null && !fatalError && (
            <div className="text-xs text-yellow-400 mt-2 space-y-1">
              <div>Balance not available. Possible RPC issue.</div>
              {solError && <div className="text-red-400">{solError}</div>}
              <button
                className="underline text-white/70 hover:text-white"
                onClick={() => {
                  if (!address) return;
                  setBalances(b => ({ ...b, solana: null }));
                  getSolBalanceRobust(address).then(v => {
                    if (v !== null) setBalances(b => ({ ...b, solana: v }));
                  }).catch(()=>setSolError('Retry failed'));
                }}
              >Retry</button>
            </div>
          )}
          {activeChain === 'solana' && balances['solana'] !== null && (
            <div className="text-[10px] text-white/40 mt-2">Updated {Math.round((Date.now()-lastSolFetch)/1000)}s ago</div>
          )}
        </div>

        {/* Quick actions directly under main balance card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
          <button className="btn text-center px-2 py-2 text-xs sm:text-base" onClick={() => setShowSendModal(true)}>Send</button>
          <Link href="/wallet/receive" className="btn text-center px-2 py-2 text-xs sm:text-base">Receive</Link>
          <button className="btn text-center px-2 py-2 text-xs sm:text-base" onClick={() => setShowSwap(true)}>Swap</button>
          <Link href="/wallet/card/topup" className="btn text-center px-2 py-2 text-xs sm:text-base">Add Cash</Link>
        </div>

        {/* Fairbrix (read-only) card */}
        {fairbrixAddr && (
          <div className="glass rounded-2xl p-4 border border-white/10 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Fairbrix (Read-only)</div>
              <Link href="/fairbrix" className="text-xs underline text-white/60 hover:text-white">Configure</Link>
            </div>
            <div className="text-[11px] text-white/50 font-mono truncate">{fairbrixAddr}</div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-[11px] text-white/60">Unpaid</div>
                <div className="text-base font-semibold">{fairbrixLoading ? '—' : (fairbrixStats?.unpaid ?? 0)}</div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-[11px] text-white/60">Payouts</div>
                <div className="text-base font-semibold">{fairbrixLoading ? '—' : (fairbrixStats?.totalPayouts ?? 0)}</div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                <div className="text-[11px] text-white/60">Workers</div>
                <div className="text-base font-semibold">{fairbrixLoading ? '—' : (fairbrixStats?.workers ?? 0)}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a className="btn text-xs" href={`https://fairbrixscan.com/address/${encodeURIComponent(fairbrixAddr)}`} target="_blank" rel="noreferrer">FairbrixScan</a>
              <Link href="/fairbrix" className="btn text-xs">Open Mining</Link>
            </div>
          </div>
        )}

        {/* Modals and additional UI follow */}
        {showSendModal && (
          <SelectTokenModal
            tokens={tokenList.map(token => ({
              mint: token.mint,
              name: token.name,
              symbol: token.symbol,
              logo: token.logo,
              balance: token.mint === "So11111111111111111111111111111111111111112" ? balances['solana'] ?? 0 : token.mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33" ? dopeSpl ?? 0 : 0
            }))}
            onSelect={mint => { setSendTokenMint(mint); setShowSendModal(false); }}
            onClose={() => setShowSendModal(false)}
          />
        )}
        {sendTokenMint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="rounded-2xl p-6 w-full max-w-md border border-white/10 bg-black text-white">
              <h2 className="text-lg font-semibold mb-4">Send Token</h2>
              <SendTokenForm
                mint={sendTokenMint}
                balance={sendTokenMint === "So11111111111111111111111111111111111111112" ? balances['solana'] : sendTokenMint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33" ? dopeSpl : 0}
                keypair={keypair}
                requireUnlock={true}
              />
              <button className="btn w-full mt-4" onClick={() => setSendTokenMint(null)}>Close</button>
            </div>
          </div>
        )}
        {showSwap && (
          <PhantomSwapModal open={showSwap} onClose={()=>setShowSwap(false)} />
        )}

        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/10 shadow-sm ${activeTab === 'tokens' ? 'bg-white/10 text-white' : 'bg-black/30 text-white/60'}`}
              onClick={() => setActiveTab('tokens')}
            >Tokens</button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/10 shadow-sm ${activeTab === 'nfts' ? 'bg-white/10 text-white' : 'bg-black/30 text-white/60'}`}
              onClick={() => setActiveTab('nfts')}
            >NFTs</button>
            <button className="btn btn-xs ml-auto whitespace-nowrap" onClick={() => setShowManageModal(true)}>Manage Tokens</button>
          </div>
          {activeTab === 'tokens' && (
            <>
              {(() => {
                // Chain-specific token rendering
                const chainTokens: {[key:string]: any[]} = {
                  solana: [
                    { mint: "So11111111111111111111111111111111111111112", name: "Solana", symbol: "SOL", logo: "/sol.png", balance: balances['solana'] },
                    { mint: "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33", name: "Dopelganga", symbol: "DOPE", logo: "/logo-192.png", balance: dopeSpl },
                    { mint: "4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts", name: "Dope Wallet Token", symbol: "DWT", logo: "/logo-192.png", balance: balances['dwt'] ?? 0 }
                  ],
                  eth: [
                    { mint: "eth", name: "Ethereum", symbol: "ETH", logo: "/eth.png", balance: 0 }
                  ],
                  base: [
                    { mint: "base", name: "Base", symbol: "BASE", logo: "/base.jpg", balance: 0 }
                  ],
                  btc: [
                    { mint: "btc", name: "Bitcoin", symbol: "BTC", logo: "/btc.png", balance: 0 }
                  ],
                  ape: [
                    { mint: "ape", name: "Ape Chain", symbol: "APE", logo: "/ape.png", balance: 0 }
                  ],
                  bnb: [
                    { mint: "bnb", name: "BNB", symbol: "BNB", logo: "/bnb.jpg", balance: 0 }
                  ],
                  sei: [
                    { mint: "sei", name: "Sei Network", symbol: "SEI", logo: "/sei.jpg", balance: 0 }
                  ]
                };
                const shown = chainTokens[activeChain] || [];
                return shown.map((token, idx) => {
                  const usdValue = (token.balance !== null && tokenPrices[token.mint]) ? (token.balance * tokenPrices[token.mint]) : null;
                  let logoSize = "w-9 h-9";
                  let logoSrc = token.logo || "/logo-192.png";
                  if (token.mint === "So11111111111111111111111111111111111111112") logoSize = "w-7 h-7";
                  if (token.mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") logoSrc = "/logo-192.png";
                  return (
                    <div
                      key={token.mint}
                      className={`flex items-center justify-between py-2${idx > 0 ? " border-t border-white/10 mt-2 pt-2" : ""} cursor-pointer`}
                      onClick={() => { try { router.push(`/token/${encodeURIComponent(token.mint)}?from=holdings`); } catch {} }}
                    >
                      <div className="flex items-center gap-3">
                        <img src={logoSrc} alt={token.symbol} className={`${logoSize} rounded-full`} />
                        <div>
                          <div className="text-sm font-semibold">{token.name} <span className="text-xs text-white/60">{token.symbol}</span></div>
                          <div className="text-sm font-semibold mt-1">{formatTokenAmount(token.balance, token.symbol)}</div>
                          <div className="text-xs text-green-400 mt-1">
                            {usdValue !== null ? `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD` : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              {/* Token detail now handled by /token/[mint] route */}
            </>
          )}
          {activeTab === 'nfts' && (
            <div className="mt-2">
              {/* NFT list component, for Solana and Ape Chain */}
              {(activeChain === 'solana' || activeChain === 'ape') && address && (
                <React.Suspense fallback={<div className="text-white/60 text-sm">Loading NFTs...</div>}>
                  {React.createElement(require('../components/NftList').default, { address })}
                </React.Suspense>
              )}
              {(activeChain !== 'solana' && activeChain !== 'ape') && (
                <div className="text-white/60 text-sm">NFTs only supported on Solana and Ape Chain for now.</div>
              )}
            </div>
          )}
          {showManageModal && (
            <ManageTokensModal
              tokens={[{ mint: "So11111111111111111111111111111111111111112", name: "Solana", symbol: "SOL", logo: "/logo-192.png" },
                       { mint: "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33", name: "Dopelganga", symbol: "DOPE", logo: "/logo-192.png" },
                       { mint: "4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts", name: "Dope Wallet Token", symbol: "DWT", logo: "/logo-192.png" },
                       { mint: "btc", name: "Bitcoin", symbol: "BTC", logo: "/logo-192.png" },
                       { mint: "eth", name: "Ethereum", symbol: "ETH", logo: "/logo-192.png" },
                       { mint: "bnb", name: "BNB", symbol: "BNB", logo: "/bnb.jpg" },
                       { mint: "base", name: "Base", symbol: "BASE", logo: "/base.jpg" },
                       { mint: "sei", name: "Sei Network", symbol: "SEI", logo: "/sei.jpg" },
                       ...tokenList]}
              shownTokens={shownTokens}
              onToggle={mint => setShownTokens(shownTokens => shownTokens.includes(mint) ? shownTokens.filter(m => m !== mint) : [...shownTokens, mint])}
              onAdd={mint => setShownTokens(shownTokens => shownTokens.includes(mint) ? shownTokens : [...shownTokens, mint])}
              onClose={() => setShowManageModal(false)}
            />
          )}
        </div>
        {/* Trending tokens removed per spec */}
        {/* Optional summary card before suggestions */}
        {React.createElement(require('../components/BalanceCard').default)}

        {/* Suggested Tokens */}
        <SuggestedTokens />

        {/* Place Money options and Family sections under suggested tokens */}
        {React.createElement(require('../components/MoneyOptions').default)}
        {React.createElement(require('../components/FamilyCard').default)}

        {/* Contact support at the very bottom */}
        {React.createElement(require('../components/SupportChatCard').default)}
      </div>
    </ErrorBoundary>
  );
}


