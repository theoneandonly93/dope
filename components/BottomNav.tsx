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
  { href: "/wallet/send", label: "Send", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12h12M10 6l6 6-6 6" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
  { href: "/wallet/receive", label: "Receive", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) },
  { href: "/wallet/chat", label: "Chat", icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12c0 4-3.582 7-8 7-0.69 0-1.36-0.07-2-0.2L6 20l1.2-3C5.85 15.9 4 14.17 4 12 4 8 7.582 5 12 5s8 3 8 7z" stroke={active?"#ffffff":"#9aa0a6"} strokeWidth="2" strokeLinejoin="round" fill="none"/>
      <circle cx="10" cy="12" r="1" fill={active?"#ffffff":"#9aa0a6"} />
      <circle cx="13" cy="12" r="1" fill={active?"#ffffff":"#9aa0a6"} />
      <circle cx="16" cy="12" r="1" fill={active?"#ffffff":"#9aa0a6"} />
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
