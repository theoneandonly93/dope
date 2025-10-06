"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "../../../components/browser/SearchBar";
import CategoryButtons from "../../../components/browser/CategoryButtons";
import TrendingTokens from "../../../components/browser/TrendingTokens";
import SafeDappList from "../../../components/SafeDappList";
import TokensForYou from "../../../components/browser/TokensForYou";
import TopLists from "../../../components/browser/TopLists";
import TopTraders from "../../../components/browser/TopTraders";
import TrendingSites from "../../../components/browser/TrendingSites";
import FairbrixMining from "../../../components/browser/FairbrixMining";
import LearnSection from "../../../components/browser/LearnSection";
import { useWallet } from "../../../components/WalletProvider";
import { copyText, hapticLight } from "../../../lib/clipboard";

export default function BrowserPage() {
  const [active, setActive] = useState<string>("tokens");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const router = useRouter();
  const { address } = useWallet() as any;
  async function copyMiningCommand() {
    if (!address) return;
    const cmd = `stratum+tcp://138.201.193.124:3031 -u ${address}.worker1 -p X`;
    if (await copyText(cmd)) hapticLight();
  }

  const openUrl = (q: string) => {
    let input = q.trim();
    if (!input.startsWith("http")) input = "https://" + input;
    setIframeUrl(input);
  };

  const openToken = (mint: string) => {
    try { router.push(`/token/${encodeURIComponent(mint)}`); } catch {}
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#000" }}>
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Browser</div>
          <div className="text-xs text-white/60">Dope Wallet</div>
        </div>
  <SearchBar onSubmit={openUrl} />
  {/* Recommended safe dapps for one-tap open */}
  <SafeDappList onSelect={openUrl} />
        {/* Mining quick access */}
        <div className="glass rounded-2xl p-4 border border-white/10 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-lg font-semibold">Mining</div>
            <button onClick={() => setActive('mining')} className="text-xs underline text-white/60 hover:text-white">Configure</button>
          </div>
          <p className="text-sm text-white/60 mb-2">Use your Solana wallet as the username for miners. Add a Fairbrix payout address in Configure to track rewards.</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActive('mining')} className="btn">Fairbrix Mining Pool</button>
            <a href="https://www.miningrigrentals.com/?ref=2713785" target="_blank" rel="noreferrer" className="btn">Mining Rig Rentals</a>
            {address && (
              <button
                className="btn"
                onClick={async () => { const cmd = `stratum+tcp://138.201.193.124:3031 -u ${address}.worker1 -p X`; if (await copyText(cmd)) hapticLight(); }}
              >Copy Command</button>
            )}
          </div>
        </div>
        <CategoryButtons active={active} onChange={setActive} />

        {active === 'tokens' && <TrendingTokens onOpenToken={openToken} />}
        {active === 'foryou' && <TokensForYou onOpenToken={openToken} />}
        {active === 'top' && <TopLists />}
        {active === 'traders' && <TopTraders />}
        {active === 'sites' && <TrendingSites onOpen={openUrl} />}
        {active === 'learn' && <LearnSection />}
        {active === 'mining' && (
          <FairbrixMining />
        )}
      </div>

      {iframeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="w-[92vw] max-w-md h-[80vh] border border-white/10 rounded-2xl overflow-hidden relative bg-black">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs rounded-full px-3 py-1" onClick={()=>setIframeUrl("")}>Close</button>
              <a className="bg-white/10 hover:bg-white/20 border border-white/10 text-xs rounded-full px-3 py-1" href={iframeUrl} target="_blank" rel="noreferrer">Open in Browser</a>
            </div>
            <iframe src={iframeUrl} title="DApp" className="w-full h-full" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          </div>
        </div>
      )}
    </div>
  );
}
