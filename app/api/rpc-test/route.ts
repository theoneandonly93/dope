export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url, batch } = await req.json();
    const q = new URL(req.url);
    const net = q.searchParams.get("net");
    const endpoint = typeof url === "string" && url.startsWith("http")
      ? url
      : (net === 'devnet' ? 'https://api.devnet.solana.com' : net === 'testnet' ? 'https://api.testnet.solana.com' : (process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'));
    const body = Array.isArray(batch) ? JSON.stringify(batch) : JSON.stringify([{ jsonrpc: "2.0", id: 1, method: "getVersion" }]);
    const extra = (() => { try { return JSON.parse(process.env.RPC_HEADERS || "{}"); } catch { return {}; } })();
    const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", ...extra }, body, cache: "no-store" });
    const text = await r.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return Response.json({ ok: r.ok, status: r.status, result: json });
  } catch (e: any) {
    return Response.json({ error: e?.message || "rpc-test error" }, { status: 500 });
  }
}
