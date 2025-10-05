"use client";
import React from "react";
import PhantomSwapModal from "../../components/PhantomSwapModal";

export default function SwapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Swap</h1>
      <PhantomSwapModal open={true} onClose={()=>{}} variant="inline" showTrending={true} />
      <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded p-2">
        Non‑custodial software. Swaps are routed via third‑party aggregators; prices are estimates and can change at execution. Transactions are irreversible; network fees apply. No financial or investment advice.
      </div>
    </div>
  );
}
