"use client";
import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getSupabase } from "../lib/supabase";

type Balances = {
  fiatUsd: number; // cash_balances.amount
  sol: number; // SOL amount
  solUsd: number; // SOL in USD
  totalUsd: number; // fiatUsd + solUsd
  loading: boolean;
  error?: string;
};

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.SOLANA_RPC_URL || "https://dopel-rpc.dopelganga.workers.dev";

async function fetchSolBalance(address: string): Promise<number> {
  const conn = new Connection(RPC_URL, "confirmed");
  const lamports = await conn.getBalance(new PublicKey(address));
  return lamports / 1e9;
}

async function fetchSolUsd(): Promise<number> {
  // Primary: Helius price feed
  try {
    const r = await fetch("https://price.jup.ag/v6/price?ids=SOL");
    const j = await r.json();
    const p = j?.data?.SOL?.price;
    if (typeof p === "number") return p;
  } catch {}
  // Fallback: Coingecko lite endpoint
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const j = await r.json();
    const p = j?.solana?.usd;
    if (typeof p === "number") return p;
  } catch {}
  return 0;
}

export function useBalances(address?: string | null): Balances {
  const [fiatUsd, setFiatUsd] = useState(0);
  const [sol, setSol] = useState(0);
  const [solUsdPrice, setSolUsdPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const solUsd = useMemo(() => sol * solUsdPrice, [sol, solUsdPrice]);
  const totalUsd = useMemo(() => fiatUsd + solUsd, [fiatUsd, solUsd]);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(undefined);
      try {
        const [solBal, price] = await Promise.all([
          fetchSolBalance(address),
          fetchSolUsd(),
        ]);
        if (!cancelled) {
          setSol(solBal);
          setSolUsdPrice(price);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load balances");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [address]);

  useEffect(() => {
    // Supabase fiat balance + realtime
    let sub: any;
    async function wire() {
      try {
        const sb = getSupabase();
        if (!address) return;
        const { data, error } = await sb
          .from("cash_balances")
          .select("amount")
          .eq("wallet_address", address)
          .maybeSingle();
        if (!error && data && typeof data.amount === "number") setFiatUsd(data.amount);
        // Realtime on channel
        // @ts-ignore
        sub = sb
          .channel("cash_balances:wallet")
          .on(
            // @ts-ignore
            "postgres_changes",
            { event: "*", schema: "public", table: "cash_balances", filter: `wallet_address=eq.${address}` },
            (payload: any) => {
              const amt = payload?.new?.amount ?? payload?.old?.amount;
              if (typeof amt === "number") setFiatUsd(amt);
            }
          )
          .subscribe();
      } catch {}
    }
    wire();
    return () => { try { sub && getSupabase().removeChannel(sub); } catch {} };
  }, [address]);

  return { fiatUsd, sol, solUsd, totalUsd, loading, error };
}
