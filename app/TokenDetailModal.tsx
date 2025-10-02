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

export default function TokenDetailModal({ mint, name, address, keypair, balance, onClose }: {
  mint: string;
  name: string;
  address: string;
  keypair: any;
  balance: number | null;
  onClose: () => void;
}) {
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [showSwapBridge, setShowSwapBridge] = useState<string|null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-all duration-300">
      <div className="rounded-3xl p-0 w-full max-w-md border border-white/10 bg-gradient-to-br from-black via-gray-900 to-black text-white relative shadow-2xl overflow-hidden animate-fadeIn">
        <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors duration-200 text-2xl" onClick={onClose} aria-label="Close">×</button>
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-16 h-16 mb-2 rounded-full bg-white/10 flex items-center justify-center">
            <img src={getTokenLogo(mint)} alt={name} className="w-12 h-12 rounded-full" />
          </div>
          <h2 className="text-xl font-bold mb-1 text-center">{name}</h2>
          <div className="mb-1 text-xs text-white/60 text-center">Mint: <span className="font-mono">{mint}</span></div>
          <div className="mb-1 text-xs text-white/60 text-center">Balance: <span className="font-bold">{balance ?? "—"}</span></div>
          <div className="flex gap-3 mt-3 mb-2">
            <button className="btn px-3 py-1 flex items-center gap-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition" onClick={() => setShowSwapBridge("swap")}>🔄 Swap</button>
            <button className="btn px-3 py-1 flex items-center gap-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition" onClick={() => setShowSwapBridge("bridge")}>🌉 Bridge</button>
          </div>
        </div>
        {showSwapBridge === "bridge" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-all duration-300">
            <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4">Bridge {name} (Wormhole)</h2>
              <BridgeInstantUI mint={mint} name={name} balance={balance} onClose={() => setShowSwapBridge(null)} />
            </div>
          </div>
        )}
        {showSwapBridge === "swap" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-all duration-300">
            <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white animate-fadeIn">
              <h2 className="text-lg font-semibold mb-4">Swap {name}</h2>
              <div className="mb-4 text-xs text-white/70">Swap this token for another. (Coming soon)</div>
              <button className="btn w-full" onClick={() => setShowSwapBridge(null)}>Close</button>
            </div>
          </div>
        )}




        <div className="px-6 pb-6 overflow-y-auto" style={{maxHeight: '60vh'}}>
          {chartLoading && <div className="text-white/60 text-xs mb-2">Loading chart...</div>}
          {chartData && <Line data={chartData} options={{ plugins: { legend: { display: false } } }} />}
          {tokenInfo && (
            <div className="mt-2 text-xs text-white/70 space-y-1">
              <div>Market Cap: {tokenInfo.marketCap ? `$${tokenInfo.marketCap.toLocaleString()}` : "—"}</div>
              <div>Volume: {tokenInfo.volume ? `$${tokenInfo.volume.toLocaleString()}` : "—"}</div>
              <div>Created: {tokenInfo.created || "—"}</div>
            </div>
          )}
          <div className="mt-4">
            <SendTokenForm mint={mint} balance={balance} keypair={keypair} />
          </div>
          <div className="mt-4">
            <TxList address={address} tokenMint={mint} />
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
