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
    const address = w?.address || null;
    const [walletName, setWalletName] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    useEffect(() => {
      // Get the active wallet's display name from store and any custom avatar URL in localStorage
      const loadMeta = async () => {
        try {
          const mod = await import("../lib/wallet");
          const aw = mod.getActiveWallet?.();
          setWalletName((aw?.name || "").trim());
        } catch {}
        try {
          if (typeof window !== "undefined") {
            // Prefer uploaded data URL, then URL string fallback
            const uploaded = localStorage.getItem("dope_profile_avatar_data");
            const custom = localStorage.getItem("dope_profile_avatar_url") || localStorage.getItem("dope_profile_photo");
            const chosen = uploaded && uploaded.length > 0 ? uploaded : (custom || "");
            if (chosen && chosen.trim().length > 0) { setAvatarUrl(chosen); return; }
          }
        } catch {}
        // Fallback to deterministic identicon based on address
        const seed = encodeURIComponent(address || "dope");
        const url = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
        setAvatarUrl(url);
      };
      loadMeta();
      const onStore = () => loadMeta();
      if (typeof window !== "undefined") {
        window.addEventListener("dope:store", onStore);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("dope:store", onStore);
        }
      };
      // Re-run when address changes (wallet switched)
    }, [address]);

    const displayName = walletName || (address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "Wallet");

    // Header stays clean; Unlock is only shown contextually on pages (e.g., DOPE Sync row)
    return (
      <header className="sticky top-0 z-30 backdrop-blur glass px-4 py-3 border-b border-white/5">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2">
            <img src={avatarUrl || "/logo-192.png"} alt="profile" className="w-8 h-8 rounded-full object-cover border border-white/10 bg-white/5" />
            <div className="flex flex-col items-start min-w-0">
              <span className="font-semibold tracking-wide truncate max-w-[42vw] text-left leading-5">{displayName}</span>
              <HeaderUsername />
            </div>
          </button>
          <div className="flex items-center gap-3">
            <Link href="/wallet/add" className="btn">+ Add</Link>
          </div>
        </div>
      </header>
    );
  }

  function HeaderUsername() {
    const [username, setUsername] = useState<string>("");
    useEffect(() => {
      try {
        if (typeof window !== 'undefined') {
          setUsername(localStorage.getItem('dope_username') || "");
          const onStore = () => setUsername(localStorage.getItem('dope_username') || "");
          window.addEventListener('dope:store', onStore);
          return () => window.removeEventListener('dope:store', onStore);
        }
      } catch {}
    }, []);
    if (!username) return null;
    return <span className="text-xs text-white/60 truncate max-w-[42vw]">@{username}</span>;
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
      <body className="min-h-[100dvh] bg-[#0b0c10] text-white">
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
