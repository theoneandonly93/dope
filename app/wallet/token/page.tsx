"use client";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";
import TxList from "../../../components/TxList";
import SendTokenForm from "../../../components/SendTokenForm";

export default function TokenDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { address, keypair } = useWallet();
  const mint = params.get("mint") || "";
  const name = params.get("name") || "Token";
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!address || !mint) return;
    setLoading(true);
    fetch(`/api/token/balance?pubkey=${address}&mint=${mint}`)
      .then(r => r.json())
      .then(data => setBalance(data.balance ?? null))
      .catch(() => setBalance(null))
      .finally(() => setLoading(false));
  }, [address, mint]);

  useEffect(() => {
    // Fetch historical price data for chart
    setChartLoading(true);
    let coingeckoId = "";
    if (mint === "So11111111111111111111111111111111111111112") coingeckoId = "solana";
    if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") coingeckoId = "dope";
    if (!coingeckoId) { setChartData(null); setChartLoading(false); return; }
    fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1&interval=hourly`)
      .then(res => res.json())
      .then(data => {
        const prices = data.prices || [];
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
      })
      .catch(() => setChartData(null))
      .finally(() => setChartLoading(false));
  }, [mint]);

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">{name} Details</h1>
      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-xs text-white/60">Token Mint</div>
        <div className="font-mono text-xs break-all mb-2">{mint}</div>
        <div className="text-xs text-white/60">Balance</div>
        <div className="text-3xl font-bold">{loading ? "Loading…" : balance === null ? "—" : balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
        <div className="mt-6">
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
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-sm font-semibold mb-2">Your Transaction History</div>
        <TxList address={address} tokenMint={mint} />
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10">
        <h3 className="text-sm font-semibold mb-2">Send {name}</h3>
        <SendTokenForm mint={mint} balance={balance} keypair={keypair} />
      </div>
      <button className="btn w-full mt-4" onClick={() => router.back()}>Close</button>
    </div>
  );
}
