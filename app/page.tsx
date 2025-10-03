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
import SelectTokenModal from "../components/SelectTokenModal";

function formatTokenAmount(amount: number | null, symbol: string): string {
  if (amount === null) return "—";
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B ${symbol}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${symbol}`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K ${symbol}`;
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${symbol}`;
}

import ManageTokensModal from "../components/ManageTokensModal";

export default function Home() {
  const [activeChain, setActiveChain] = useState<'solana'|'eth'|'btc'|'ape'|'bnb'|'sei'>('solana');
  const [activeTab, setActiveTab] = useState<'tokens'|'nfts'>('tokens');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTokenMint, setSendTokenMint] = useState<string|null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  // Always show SOL, DOPE, BTC, ETH, BNB by default unless user turns off
  const defaultTokens = [
    "So11111111111111111111111111111111111111112", // SOL
    "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33", // DOPE
    "btc", // BTC
    "eth", // ETH
    "bnb" // BNB
  ];
  const [shownTokens, setShownTokens] = useState<string[]>(defaultTokens);
  const router = useRouter();
  const { address, unlocked, hasWallet, keypair, ready } = useWallet() as any;
  // Multi-chain balances
  const [balances, setBalances] = useState<{[chain: string]: number | null}>({ solana: null, eth: null, btc: null, ape: null, bnb: null, sei: null, base: null });
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [dopeSpl, setDopeSpl] = useState<number | null>(null);
  const [dopePrice, setDopePrice] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  // (Removed debug state previously used for Solscan API response)

  // Top-level fallback UI for runtime errors
  const [fatalError, setFatalError] = useState<string>("");
  const [showRpcError, setShowRpcError] = useState(true);

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
    let iv: any = null;
    const fetchBalances = async () => {
      const newBalances: {[chain: string]: number | null} = { solana: null, eth: null, btc: null, ape: null, bnb: null, sei: null, base: null };
      // Solana
      try {
        let solBalance = await getSolBalance(address);
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
  // Debug removal: no-op
      } catch (e: any) {
        newBalances.solana = null;
        setFatalError("Failed to fetch SOL balance. " + (e?.message || ""));
        setShowRpcError(true);
      }
      // DOPE SPL
      try {
        const dope = await getDopeTokenBalance(address);
        setDopeSpl(dope);
    // Removed debug window assignments
      } catch (e: any) {
    setDopeSpl(null);
    setFatalError("Failed to fetch DOPE token balance. " + (e?.message || ""));
    setShowRpcError(true);
      }
      // Dope Wallet Token (DWT)
      try {
        const conn = (await import("../lib/wallet")).getConnection();
        const owner = new (await import("@solana/web3.js")).PublicKey(address);
        const mint = new (await import("@solana/web3.js")).PublicKey("4R7zJ4JgMz14JCw1JGn81HVrFCAfd2cnCfWvsmqv6xts");
        const parsed = await conn.getParsedTokenAccountsByOwner(owner, { mint });
        let dwt = 0;
        if (parsed && parsed.value.length > 0) {
          const acc = parsed.value[0].account.data;
          const ui = acc?.parsed?.info?.tokenAmount?.uiAmount;
          dwt = typeof ui === 'number' ? ui : 0;
        }
        newBalances.dwt = dwt;
      } catch (e: any) {
        newBalances.dwt = 0;
      }
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
    iv = setInterval(fetchBalances, 10000); // poll every 10s
    return () => { if (iv) clearInterval(iv); };
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
      const { getConnection } = await import("../lib/wallet");
      const connection = getConnection();
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
      <div className="pb-24 space-y-6 w-full max-w-md mx-auto px-2 sm:px-0">
        {/* Chain Switcher Dropdown with label and status light */}
        <div className="flex items-center justify-center py-2 gap-3">
          <span className="text-white/70 text-sm font-semibold">Chains</span>
          <select
            className="bg-black/80 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-semibold"
            value={activeChain}
            onChange={e => setActiveChain(e.target.value as any)}
          >
            <option value="solana">Solana</option>
            <option value="eth">Ethereum</option>
            <option value="btc">Bitcoin</option>
            <option value="ape">Ape Chain</option>
            <option value="bnb">BNB</option>
            <option value="sei">Sei Network</option>
            <option value="base">Base</option>
          </select>
          {/* Connection status light */}
          <span
            className={`ml-2 w-3 h-3 rounded-full border border-white/20 ${balances[activeChain] !== null ? 'bg-green-500' : 'bg-red-500'}`}
            title={balances[activeChain] !== null ? 'Connected' : 'Not Connected'}
          />
        </div>
        {showRpcError && fatalError && (
          <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
            <div className="bg-yellow-900 text-yellow-200 border border-yellow-400 rounded-xl px-4 py-3 mt-4 shadow-lg max-w-md w-full flex items-center justify-between">
              ⚠️ Rate limit or RPC error: Balances may not be visible right now, but your funds are safe and will appear shortly.
              <button className="ml-4 text-yellow-300 hover:text-yellow-100" onClick={() => setShowRpcError(false)}>Dismiss</button>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 w-full">
          <div className="text-xs text-white/60">Address</div>
          <div className="font-mono break-all text-sm">{address || "No address set"}</div>
          <div className="mt-4 text-xs text-white/60">Balance</div>
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
          {balances[activeChain] === null && !fatalError && (
            <div className="text-xs text-yellow-400 mt-2">Balance not available. Please check your network, RPC, or wallet address.</div>
          )}
        </div>

        {React.createElement(require('../components/SupportChatCard').default)}

        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
          <button className="btn text-center px-2 py-2 text-xs sm:text-base" onClick={() => setShowSendModal(true)}>Send</button>
          <Link href="/wallet/receive" className="btn text-center px-2 py-2 text-xs sm:text-base">Receive</Link>
          <button className="btn text-center px-2 py-2 text-xs sm:text-base" onClick={() => setShowSwap(true)}>Swap</button>
        </div>
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
              />
              <button className="btn w-full mt-4" onClick={() => setSendTokenMint(null)}>Close</button>
            </div>
          </div>
        )}
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
          <div className="flex items-center gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/10 shadow-sm ${activeTab === 'tokens' ? 'bg-white/10 text-white' : 'bg-black/30 text-white/60'}`}
              onClick={() => setActiveTab('tokens')}
            >Tokens</button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/10 shadow-sm ${activeTab === 'nfts' ? 'bg-white/10 text-white' : 'bg-black/30 text-white/60'}`}
              onClick={() => setActiveTab('nfts')}
            >NFTs</button>
            <button className="btn text-xs ml-auto" onClick={() => setShowManageModal(true)}>Manage Token</button>
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
                      onClick={() => setShowTokenInfo({ mint: token.mint, name: `${token.name} (${token.symbol})` })}
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
              {showTokenInfo && (
                <TokenDetailModal
                  mint={showTokenInfo.mint}
                  name={showTokenInfo.name}
                  address={address}
                  keypair={keypair}
                  balance={showTokenInfo.mint === "So11111111111111111111111111111111111111112" ? balances['solana'] : dopeSpl}
                  onClose={() => setShowTokenInfo(null)}
                />
              )}
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
          <TxList address={address || undefined} key={address} />
        </div>
      </div>
    </ErrorBoundary>
  );
}


