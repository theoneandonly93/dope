"use client";
import React, { useCallback, useState } from "react";
import PhantomSwapModal from "../../components/PhantomSwapModal";
import TrendingTokens from "../../components/browser/TrendingTokens";
import { useRouter, useSearchParams } from "next/navigation";

export default function SwapPage() {
  const router = useRouter();
  const params = useSearchParams();
  const toMintParam = params?.get("to") || undefined;
  const [toMint, setToMint] = useState<string | undefined>(toMintParam);

  const onOpenToken = useCallback((mint: string) => {
    setToMint(mint);
    // reflect in URL for copy/share
    const usp = new URLSearchParams(params?.toString() || "");
    usp.set("to", mint);
    router.replace(`/swap?${usp.toString()}`);
  }, [params, router]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Swap</h1>
      <PhantomSwapModal open={true} onClose={()=>{}} variant="inline" showTrending={false} initialToMint={toMint} />
      <div className="mt-2">
        <TrendingTokens onOpenToken={onOpenToken} />
      </div>
      <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded p-2">
        Non‑custodial software. Swaps are routed via third‑party aggregators; prices are estimates and can change at execution. Transactions are irreversible; network fees apply. No financial or investment advice.
      </div>
    </div>
  );
}
