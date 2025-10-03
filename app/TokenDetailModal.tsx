import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import TxList from "../components/TxList";
import SendTokenForm from "../components/SendTokenForm";
import BridgeInstantUI from "./BridgeInstantUI";
import SwapModal from "../components/SwapModal";
import { DEFAULT_BUY_INPUT_MINT, DEFAULT_BUY_INPUT_SYMBOL, DEFAULT_PREFILL_PERCENT } from "../lib/config";

export default function TokenDetailModal({ mint, name, address, keypair, balance, onClose, initialSwapMode }: {
  mint: string;
  name: string;
  address: string;
  keypair: any;
  balance: number | null;
  onClose: () => void;
  initialSwapMode?: 'direct'|'buy'|'sell';
}) {
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [showSwapBridge, setShowSwapBridge] = useState<string|null>(null);
  const [swapMode, setSwapMode] = useState<'direct'|'buy'|'sell'>(initialSwapMode || 'direct');
  const persistKey = `dope:lastSwapMode:${mint}`;

  useEffect(() => {
    // load persisted mode
    try {
      const m = localStorage.getItem(persistKey) as 'direct'|'buy'|'sell'|null;
      if (m) setSwapMode(m);
      else if (initialSwapMode) setSwapMode(initialSwapMode);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint, initialSwapMode]);

  useEffect(() => {
    // persist mode changes
    try { localStorage.setItem(persistKey, swapMode); } catch {}
  }, [swapMode, persistKey]);

  useEffect(() => {
    let coingeckoId = "";
    if (mint === "So11111111111111111111111111111111111111112") coingeckoId = "solana";
    if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") coingeckoId = "dope";
    if (mint === "btc") coingeckoId = "bitcoin";
    if (mint === "eth") coingeckoId = "ethereum";
    if (mint === "bnb") coingeckoId = "binancecoin";
    if (!coingeckoId) { setChartData(null); setChartLoading(false); setTokenInfo(null); return; }
    setChartLoading(true);
    Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1&interval=hourly`).then(res => res.json()),
      fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}`).then(res => res.json())
    ]).then(([chart, info]) => {
      const prices = chart.prices || [];
      setChartData({
        labels: prices.map((p: any) => new Date(p[0]).toLocaleTimeString()),
        datasets: [
          {
            label: `${coingeckoId.toUpperCase()} Price (USD)`,
            data: prices.map((p: any) => p[1]),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            tension: 0.3,
          },
        ],
      });
      setTokenInfo({
        marketCap: info?.market_data?.market_cap?.usd ?? null,
        holders: info?.community_data?.facebook_likes ?? null, // Placeholder
        volume: info?.market_data?.total_volume?.usd ?? null,
        created: info?.genesis_date ?? null,
      });
    }).catch(() => { setChartData(null); setTokenInfo(null); })
      .finally(() => setChartLoading(false));
  }, [mint]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 transition-all duration-300" role="dialog" aria-modal="true" aria-labelledby="token-detail-title">
      <div className="w-[92vw] sm:w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-0 border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black text-white relative shadow-2xl overflow-hidden animate-fadeIn">
        <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors duration-200 text-2xl" onClick={onClose} aria-label="Close">×</button>
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-3 px-5 sm:px-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/10">
            <img src={getTokenLogo(mint)} alt={name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          </div>
          <div className="min-w-0">
            <h2 id="token-detail-title" className="text-lg sm:text-xl font-bold truncate">{name}</h2>
            <div className="text-[10px] sm:text-xs text-white/60 truncate">Mint: <span className="font-mono">{mint}</span></div>
            <div className="text-[10px] sm:text-xs text-white/60">Balance: <span className="font-bold">{balance ?? "—"}</span></div>
          </div>
        </div>
        {/* Actions */}
        <div className="px-5 sm:px-6 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button className="btn px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20" onClick={() => { setSwapMode('buy'); setShowSwapBridge('swap'); }}>🟢 Buy</button>
            <button className="btn px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40" disabled={(balance||0)===0} onClick={() => { if ((balance||0)===0) return; setSwapMode('sell'); setShowSwapBridge('swap'); }}>🔴 Sell</button>
            <button className="btn px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20" onClick={() => { setSwapMode('direct'); setShowSwapBridge('swap'); }}>🔄 Swap</button>
            <button className="btn px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20" onClick={() => setShowSwapBridge('bridge')}>🌉 Bridge</button>
          </div>
        </div>
        {showSwapBridge === "bridge" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 transition-all duration-300">
            <div className="rounded-2xl p-6 w-[92vw] max-w-sm border border-white/10 bg-black text-white animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4">Bridge {name} (Wormhole)</h2>
              <BridgeInstantUI mint={mint} name={name} balance={balance} onClose={() => setShowSwapBridge(null)} />
            </div>
          </div>
        )}
        {showSwapBridge === "swap" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 transition-all duration-300">
            <div className="rounded-2xl p-6 w-[92vw] max-w-sm border border-white/10 bg-black text-white animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4">
                {swapMode==='buy' && <>Buy {name} (Pay SOL)</>}
                {swapMode==='sell' && <>Sell {name} (Receive SOL)</>}
                {swapMode==='direct' && <>Swap {name}</>}
              </h2>
              <SwapModal
                inputMint={swapMode==='sell' ? mint : DEFAULT_BUY_INPUT_MINT}
                inputSymbol={swapMode==='sell' ? name : DEFAULT_BUY_INPUT_SYMBOL}
                balance={swapMode==='sell' ? balance : null}
                // If buying, lock output to current token; if selling, lock output to SOL/default buy mint; direct = free output
                desiredOutputMint={swapMode==='buy' ? mint : (swapMode==='sell' ? DEFAULT_BUY_INPUT_MINT : undefined)}
                lockOutputMint={swapMode!=='direct'}
                disableInputTokenChange={swapMode!=='direct'}
                initialAmountIn={(() => {
                  if (swapMode==='buy') {
                    // prefill percent of SOL (unknown here) -> skip (handled by parent maybe) so return undefined
                    return undefined;
                  }
                  if (swapMode==='sell' && balance && balance>0) {
                    return (balance * (DEFAULT_PREFILL_PERCENT/100));
                  }
                  return undefined;
                })()}
                autoQuote={false}
                onClose={() => setShowSwapBridge(null)}
                onSwapped={() => { /* trigger refresh */ try { window.dispatchEvent(new CustomEvent('swap-complete', { detail: { context: 'token-detail' } })); } catch {} }}
              />
            </div>
          </div>
        )}




        {/* Content scroll area */}
        <div className="px-5 sm:px-6 pb-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {chartLoading && <div className="text-white/60 text-xs mb-2">Loading chart...</div>}
          {chartData && (
            <div className="h-40 sm:h-56">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9CA3AF', maxTicksLimit: 6 } }, y: { ticks: { color: '#9CA3AF' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
            </div>
          )}
          {tokenInfo && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-white/80">
              <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Market Cap</div><div className="font-semibold truncate">{tokenInfo.marketCap ? `$${tokenInfo.marketCap.toLocaleString()}` : '—'}</div></div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Volume</div><div className="font-semibold truncate">{tokenInfo.volume ? `$${tokenInfo.volume.toLocaleString()}` : '—'}</div></div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-2 col-span-2 sm:col-span-1"><div className="text-white/50">Created</div><div className="font-semibold truncate">{tokenInfo.created || '—'}</div></div>
            </div>
          )}
          <div className="mt-4">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-sm font-semibold mb-2">Send {name}</div>
              <SendTokenForm mint={mint} balance={balance} keypair={keypair} />
            </div>
          </div>
          <div className="mt-4">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-sm font-semibold mb-2">Recent Activity</div>
              <TxList address={address} tokenMint={mint} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
// Helper to get logo for known tokens
function getTokenLogo(mint: string) {
  if (mint === "So11111111111111111111111111111111111111112") return "/sol.png";
  if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") return "/dope.png";
  if (mint === "btc") return "/btc.png";
  if (mint === "eth") return "/eth.png";
  if (mint === "bnb") return "/bnb.png";
  return "/logo-192.png";
}



}
