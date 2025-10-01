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

  useEffect(() => {
    let coingeckoId = "";
    if (mint === "So11111111111111111111111111111111111111112") coingeckoId = "solana";
    if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") coingeckoId = "dope";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10" style={{background: '#000'}}>
        <h2 className="text-lg font-semibold mb-2 text-white">{name} Info</h2>
        <div className="mb-4">
          <div className="text-xs text-white/60 mb-1">Mint Address:</div>
          <div className="font-mono text-xs break-all text-white mb-2">{mint}</div>
          <div className="mt-4">
            <div className="text-xs text-white/60 mb-2">Real-Time Price Chart (24h)</div>
            {chartLoading && <div className="text-white/60 text-xs">Loading chart…</div>}
            {chartData && (
              <Line data={chartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { color: '#fff', font: { size: 10 } } }, y: { ticks: { color: '#22c55e', font: { size: 12 } } } }
              }} height={120} />
            )}
            {!chartLoading && !chartData && <div className="text-white/60 text-xs">Chart not available for this token.</div>}
          </div>
          {tokenInfo && (
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-white/80">
              <div><span className="font-semibold">Market Cap:</span> {tokenInfo.marketCap ? `$${tokenInfo.marketCap.toLocaleString()}` : "—"}</div>
              <div><span className="font-semibold">Volume (24h):</span> {tokenInfo.volume ? `$${tokenInfo.volume.toLocaleString()}` : "—"}</div>
              <div><span className="font-semibold">Holders:</span> {tokenInfo.holders ?? "—"}</div>
              <div><span className="font-semibold">Created:</span> {tokenInfo.created ?? "—"}</div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 text-white">Your Transaction History</div>
          <TxList address={address} tokenMint={mint} />
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 text-white">Send {name}</h3>
          <SendTokenForm mint={mint} balance={balance} keypair={keypair} />
        </div>
        <button className="btn w-full mt-4" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
