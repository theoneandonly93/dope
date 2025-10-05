"use client";
import React from "react";
import FloatingLogos from "../../../components/FloatingLogos";

export default function CardSuccessPage() {
  const share = async () => {
    const text = "I'm on the Dope Wallet Virtual Card waitlist. Join me!";
    const url = typeof window !== 'undefined' ? window.location.origin + "/card" : "https://dope.app/card";
    try {
      // @ts-ignore - supported in modern browsers
      if (navigator.share) {
        await navigator.share({ title: "Dope Wallet", text, url });
        return;
      }
    } catch {}
    // Fallback: Telegram share
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tg, "_blank");
  };

  return (
    <div className="relative">
      <FloatingLogos />
      <div className="relative z-10 rounded-2xl p-6 border border-white/10 text-center space-y-6" style={{ background: "linear-gradient(135deg, rgba(255,180,120,0.22), rgba(255,120,60,0.18))" }}>
        <div className="w-24 h-24 rounded-2xl mx-auto" style={{ background: "radial-gradient(circle, rgba(255,180,120,0.6), transparent 65%)" }} />
        <div className="text-3xl font-semibold leading-tight">You're on the list</div>
        <div className="text-white/80">Your waitlist spot is locked. Keep an eye out for your invite.</div>
        <button className="btn w-full" onClick={share}>Share</button>
      </div>
    </div>
  );
}
