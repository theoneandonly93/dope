export const dynamic = "force-dynamic";

function endpoint() {
  return process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
}

function extraHeaders(): Record<string, string> {
  try {
    return JSON.parse(process.env.RPC_HEADERS || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const rpc = endpoint();
  const extra = extraHeaders();
  try {
    const body = await req.text();
    const upstream = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json", ...extra },
      body,
      cache: "no-store",
      redirect: "follow",
    });
    const headers = new Headers({ "content-type": upstream.headers.get("content-type") || "application/json" });
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e: any) {
    return Response.json({ error: e?.message || "RPC proxy error" }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({ ok: true, rpc: endpoint() });
}
