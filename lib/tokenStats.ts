export type TokenStats = {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  liquidity: number;
  volume24h: number;
};

export async function getTokenStats(address: string): Promise<TokenStats | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(address)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pair = data?.pairs?.[0];
    if (!pair) return null;
    return {
      name: pair.baseToken?.name || "",
      symbol: pair.baseToken?.symbol || "",
      price: Number(pair.priceUsd ?? 0),
      change24h: Number(pair?.priceChange?.h24 ?? 0),
      liquidity: Number(pair?.liquidity?.usd ?? 0),
      volume24h: Number(pair?.volume?.h24 ?? 0),
    };
  } catch (err) {
    console.error("Error fetching token stats:", err);
    return null;
  }
}

export async function getChartData(address: string): Promise<Array<{ time: string; price: number }>> {
  try {
    // Default to Solana chain for Dope Wallet; adjust if multi-chain later
    const url = `https://api.dexscreener.com/chart/solana/${encodeURIComponent(address)}?resolution=15m`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      time: new Date((c.t ?? 0) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: Number(c.c ?? 0),
    }));
  } catch {
    return [];
  }
}
