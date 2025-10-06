"use client";
import React, { useEffect, useMemo, useState } from "react";
import { hapticLight } from "../lib/clipboard";

type Mode = "buy" | "sell";

export default function BuySellModal({
  open,
  mode,
  mint,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: Mode;
  mint: string;
  onClose: () => void;
  onConfirm?: (amount: number, ctx: { mode: Mode; mint: string; currency: 'USD' | 'SOL' }) => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<'USD' | 'SOL'>("USD"); // For buy: pay with; For sell: receive in

  useEffect(() => {
    if (!open) setAmount("");
  }, [open]);

  const pretty = useMemo(() => {
    // Normalize decimals based on currency/mode
    const [i, d] = amount.split(".");
    const ii = i.replace(/^0+(\d)/, "$1");
    const maxDec = mode === 'buy' ? (currency === 'USD' ? 2 : 9) : 6; // sell amount is in token units
    const dd = (d || "").slice(0, maxDec);
    return dd ? `${ii || "0"}.${dd}` : (ii || "0");
  }, [amount, currency, mode]);

  function press(key: string) {
    hapticLight();
    setAmount((prev) => {
      if (key === "back") return prev.slice(0, -1);
      if (key === ".") {
        if (prev.includes(".")) return prev; // only one decimal point
        return prev ? prev + "." : "0."; // start with 0.
      }
      // digit
      if (!/^[0-9]$/.test(key)) return prev;
      // prevent leading zeros like 000
      if (!prev) return key;
      // Cap to reasonable length (7 digits + 1 dot + 2 decimals)
      if (prev.length >= 18) return prev;
      return prev + key;
    });
  }

  const parsed = useMemo(() => {
    const n = Number(pretty);
    return isNaN(n) ? 0 : n;
  }, [pretty]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80">
      <div
        className="w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-black text-white overflow-hidden flex flex-col"
        style={{ maxHeight: "100dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label={`${mode} token`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold capitalize">
            {mode === 'buy' ? 'Buy' : 'Sell'}
          </div>
          <button className="text-white/60 hover:text-white" onClick={onClose}>Close</button>
        </div>
        {/* Scrollable content area */}
        <div className="p-5 pt-6 flex-1 overflow-y-auto">
          {/* Currency / Settlement toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white/60">
              {mode === 'buy' ? 'Pay with' : 'Receive in'}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex gap-1">
              {(['USD','SOL'] as const).map(c => (
                <button key={c} onClick={()=>setCurrency(c)} className={`px-2 py-1 rounded-md text-xs ${currency===c ? 'bg-white text-black font-semibold' : 'text-white/80'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/60 mb-1">
            {mode === 'buy' ? (currency === 'USD' ? 'Amount (USD)' : 'Amount (SOL)') : 'Amount (token)'}
          </div>
          <div className="text-4xl font-bold tracking-tight">{mode==='buy' && currency==='USD' ? '$' : ''}{pretty}</div>
          <div className="text-xs text-white/50 mt-2">Mint: <span className="font-mono text-[11px]">{mint}</span></div>
        </div>
        {/* Keypad (fixed height) */}
        <div className="p-3 grid grid-cols-3 gap-2 select-none">
          {(["1","2","3","4","5","6","7","8","9",".","0","back"] as const).map((k) => (
            <button
              key={k}
              className={`min-h-12 text-base sm:text-lg rounded-xl border border-white/10 bg-white/5 active:bg-white/10 ${k==="back"?"flex items-center justify-center": ""}`}
              onClick={() => press(k as any)}
              aria-label={k === "back" ? "Backspace" : `Key ${k}`}
            >
              {k === "back" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 5H9L2 12l7 7h13V5z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M14 9l6 6M20 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : k}
            </button>
          ))}
        </div>
        {/* Action area with safe-area bottom padding */}
        <div className="p-4 pt-0" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            className="btn w-full min-h-12 text-base"
            disabled={parsed <= 0}
            onClick={() => onConfirm?.(parsed, { mode, mint, currency })}
          >
            {mode === "buy" ? "Continue" : "Continue"}
          </button>
          <div className="text-[11px] text-white/50 mt-2 text-center">This will use the best available route when you confirm.</div>
        </div>
      </div>
    </div>
  );
}
