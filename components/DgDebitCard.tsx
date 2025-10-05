"use client";
import React from "react";

type Props = {
  className?: string;
  variant?: "lavender" | "sunset";
};

export default function DgDebitCard({ className = "", variant = "lavender" }: Props) {
  const bg =
    variant === "sunset"
      ? "linear-gradient(135deg, rgba(255,184,120,0.28), rgba(255,120,120,0.22))"
      : "linear-gradient(135deg, rgba(170,140,255,0.28), rgba(255,240,120,0.20))";
  return (
    <div className={`relative ${className}`}>
      {/* Ghost aura */}
      <div className="absolute -inset-6 rounded-3xl bg-white/5 blur-2xl animate-ghost-glow" />
      {/* Card */}
      <div
        className="relative rounded-3xl border border-white/15 p-5 backdrop-blur-sm shadow-[0_10px_50px_rgba(0,0,0,0.25)] overflow-hidden"
        style={{ background: bg }}
      >
        {/* Decorative bubbles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-192.png" alt="Dopelganga" className="w-6 h-6 rounded" />
            <div className="font-semibold tracking-wide">Dopelganga</div>
          </div>
          <div className="text-xs text-white/70">Virtual</div>
        </div>
        {/* Number placeholder */}
        <div className="mt-6 font-mono tracking-widest text-white/90">**** **** **** 4242</div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/70">
          <div>
            <div className="uppercase text-[10px] opacity-70">Member</div>
            <div className="font-semibold">DOPE USER</div>
          </div>
          <div className="text-right">
            <div className="uppercase text-[10px] opacity-70">Exp</div>
            <div className="font-semibold">12/29</div>
          </div>
        </div>
      </div>
    </div>
  );
}
