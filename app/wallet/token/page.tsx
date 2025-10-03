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
import TradingViewWidget from "../../../components/TradingViewWidget";

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
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  // Map mint to TradingView symbol
  let tradingViewSymbol = "";
  if (mint === "So11111111111111111111111111111111111111112") tradingViewSymbol = "COINBASE:SOLUSD";
  if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") tradingViewSymbol = "GATEIO:DOPEUSDT";
  if (mint === "BTC_MINT_PLACEHOLDER") tradingViewSymbol = "COINBASE:BTCUSD";
  if (mint === "ETH_MINT_PLACEHOLDER") tradingViewSymbol = "COINBASE:ETHUSD";

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
    // Fetch historical price data and token info
    setChartLoading(true);
    let coingeckoId = "";
    if (mint === "So11111111111111111111111111111111111111112") coingeckoId = "solana";
    if (mint === "FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33") coingeckoId = "dope";
    if (!coingeckoId) { setChartData(null); setChartLoading(false); setTokenInfo(null); return; }
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
        holders: info?.community_data?.facebook_likes ?? null, // Placeholder, real holders not available
        volume: info?.market_data?.total_volume?.usd ?? null,
        created: info?.genesis_date ?? null,
      });
    }).catch(() => { setChartData(null); setTokenInfo(null); })
      .finally(() => setChartLoading(false));
  }, [mint]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/10">
          {/* lightweight logo mapping similar to modal */}
          <img src={mint === 'So11111111111111111111111111111111111111112' ? '/sol.png' : mint === 'FGiXdp7TAggF1Jux4EQRGoSjdycQR1jwYnvFBWbSLX33' ? '/dope.png' : '/logo-192.png'} alt={name} className="w-8 h-8 rounded-full" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">{name}</h1>
          <div className="text-[10px] sm:text-xs text-white/60 truncate font-mono">{mint}</div>
        </div>
      </div>

      {/* Overview card */}
      <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-black via-neutral-900 to-black">
        <div className="text-xs text-white/60">Balance</div>
        <div className="text-3xl font-bold">{loading ? 'Loading…' : balance === null ? '—' : balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
        <div className="mt-5">
          <div className="text-xs text-white/60 mb-2">Chart</div>
          {tradingViewSymbol ? (
            <div className="h-56 sm:h-72">
              <TradingViewWidget symbol={tradingViewSymbol} height={320} />
            </div>
          ) : (
            <div className="text-white/60 text-xs">Chart not available for this token.</div>
          )}
        </div>
        {tokenInfo && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-white/80">
            <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Mkt Cap</div><div className="font-semibold truncate">{tokenInfo.marketCap ? `$${tokenInfo.marketCap.toLocaleString()}` : '—'}</div></div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Volume 24h</div><div className="font-semibold truncate">{tokenInfo.volume ? `$${tokenInfo.volume.toLocaleString()}` : '—'}</div></div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Holders</div><div className="font-semibold truncate">{tokenInfo.holders ?? '—'}</div></div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2"><div className="text-white/50">Created</div><div className="font-semibold truncate">{tokenInfo.created ?? '—'}</div></div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="text-sm font-semibold mb-2">Recent Activity</div>
        <TxList address={address} tokenMint={mint} />
      </div>

      {/* Send */}
      <div className="glass rounded-2xl p-5 border border-white/10">
        <h3 className="text-sm font-semibold mb-2">Send {name}</h3>
        <SendTokenForm mint={mint} balance={balance} keypair={keypair} requireUnlock={true} />
      </div>

      <button className="btn w-full" onClick={() => router.back()}>Close</button>
    </div>
  );
}
