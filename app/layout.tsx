"use client";
// Load polyfills (Buffer) before any other imports use it
import "../polyfills";
import "../styles/globals.css";
import React, { useEffect, useState } from "react";
import { WalletProvider } from "../components/WalletProvider";
import BottomNav from "../components/BottomNav";
import SideMenu from "../components/SideMenu";
import Link from "next/link";
import { useWalletOptional } from "../components/WalletProvider";
import { useWallet } from "../components/WalletProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Register service worker for PWA (production only, after load)
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined" && "serviceWorker" in navigator) {
      const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  function HeaderBar() {
    const w = useWalletOptional();
    const isLocked = !w?.keypair; // show Unlock when no keypair is in memory
    return (
      <header className="sticky top-0 z-30 backdrop-blur glass px-4 py-3 border-b border-white/5">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2">
            <img src="/logo-192.png" alt="logo" className="w-6 h-6 rounded" />
            <span className="font-semibold tracking-wide">DOPE</span>
          </button>
          <div className="flex items-center gap-3">
            {isLocked && (
              <Link href="/unlock" className="text-xs underline text-white/70">Unlock</Link>
            )}
            <Link href="/wallet/add" className="btn">+ Add</Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2a2b3a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>DOPE</title>
      </head>
      <body className="min-h-screen bg-[#0b0c10] text-white">
        <WalletProvider>
          <HeaderBar />
          <main className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl pb-20 px-4 pt-4" style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}>
            {children}
          </main>
          <BottomNav />
          <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </WalletProvider>
      </body>
    </html>
  );
}
