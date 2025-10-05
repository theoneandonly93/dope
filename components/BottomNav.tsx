"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const items = [
  { href: "/", label: "Home", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" fill={active?"#ffffff":"#9aa0a6"}/>
    </svg>
  ) },
  { href: "/tokens", label: "Tokens", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="4" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" />
      <circle cx="16" cy="16" r="4" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" />
    </svg>
  ) },
  { href: "/card", label: "Card", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" />
      <rect x="6" y="12" width="6" height="2" fill={active?"#ffffff":"#9aa0a6"} />
      <rect x="14" y="12" width="4" height="2" fill={active?"#ffffff":"#9aa0a6"} />
      <rect x="3" y="8" width="18" height="2" fill={active?"#ffffff":"#9aa0a6"} />
    </svg>
  ) },
  { href: "/transactions", label: "Activity", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12l4 4 8-8" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
  { href: "/wallet/browser", label: "Browser", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" fill="none"/>
      <path d="M2 12h20M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" fill="none"/>
    </svg>
  ) },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="m-3 rounded-2xl glass border border-white/5 backdrop-blur px-4 py-2 flex items-center justify-between bg-white/5">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link key={it.href} href={it.href} className="flex flex-col items-center gap-1 py-1 px-2">
                {it.icon(active)}
                <span className={`text-[10px] ${active ? "text-white" : "text-white/60"}`}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
