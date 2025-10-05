"use client";
import React from "react";
import Link from "next/link";
import FloatingLogos from "../../components/FloatingLogos";
import DgDebitCard from "../../components/DgDebitCard";

export default function CardLandingPage() {
  return (
    <div className="relative">
      <FloatingLogos />
      <div className="relative z-10 rounded-2xl p-6 border border-white/10 text-center space-y-6" style={{ background: "linear-gradient(135deg, rgba(170,140,255,0.20), rgba(255,240,120,0.18))" }}>
        <div className="flex items-center justify-center py-4">
          <DgDebitCard className="w-[280px]" variant="lavender" />
        </div>
        <div className="text-3xl font-semibold leading-tight">Get on the list</div>
        <div className="text-white/70">Be the first to experience the world of New Money.</div>
        <Link href="/card/waitlist" className="btn w-full">Join the waitlist</Link>
      </div>
    </div>
  );
}
