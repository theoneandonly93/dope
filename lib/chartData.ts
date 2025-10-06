export type ChartPoint = { time: string; price: number };

export async function getChartRangeData(
  address: string,
  range: "1h" | "24h" | "7d" | "30d"
): Promise<ChartPoint[]> {
  try {
    const url = `https://api.dexscreener.com/chart/solana/${encodeURIComponent(
      address
    )}?range=${range}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      time: new Date((c.t ?? 0) * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: Number(c.c ?? 0),
    }));
  } catch {
    return [];
  }
}
