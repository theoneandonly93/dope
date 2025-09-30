"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../components/WalletProvider";
import { getStoredWallet } from "../../lib/wallet";

export default function UnlockPage() {
  const router = useRouter();
  const { address, unlocked, unlock, tryBiometricUnlock } = useWallet();
  const [scheme, setScheme] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (unlocked) router.replace("/");
  }, [unlocked, router]);

  useEffect(() => {
    const stored = getStoredWallet();
    if (stored?.scheme) setScheme(stored.scheme);
  }, []);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("dope_install_hint_dismissed");
      setShowInstall(!dismissed);
    } catch {}
  }, []);

  const onUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await unlock(password);
      router.replace("/");
    } catch (e: any) {
      setError(e?.message || "Failed to unlock");
    } finally {
      setPending(false);
    }
  };

  const onBiometric = async () => {
    setError("");
    setPending(true);
    try {
      const ok = await tryBiometricUnlock();
      if (ok) router.replace("/");
      else setError("Biometric unavailable or session expired");
    } catch (e: any) {
      setError(e?.message || "Biometric failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mt-2">
        <img src="/logo-192.png" alt="DOPE" className="w-16 h-16 fade-in" />
      </div>

      {showInstall && (
        <div className="glass border border-white/10 rounded-2xl p-3 flex items-start gap-3">
          <div className="text-sm leading-snug text-white/90">
            For the best experience, add DOPE Wallet to your home screen.
          </div>
          <button
            aria-label="Dismiss"
            className="ml-auto text-white/60 hover:text-white"
            onClick={() => {
              try { localStorage.setItem("dope_install_hint_dismissed", "1"); } catch {}
              setShowInstall(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="text-center space-y-1">
        <div className="text-xs text-white/60">Wallet</div>
        <div className="font-semibold text-lg tracking-wide">{address || "No wallet yet"}</div>
      </div>
      {scheme === "device" && (
        <div className="text-xs text-white/60 text-center">This wallet uses device encryption. If you cleared site data, you may need to recreate/import.</div>
      )}
      <form onSubmit={onUnlock} className="space-y-3">
        <input
          type="password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <div className="text-[12px] text-red-400">{error}</div>}
        <button disabled={pending || password.length < 4} className="w-full btn disabled:opacity-50">
          {pending ? "Unlocking..." : "Unlock"}
        </button>
      </form>
      <div className="flex items-center justify-center">
        <button onClick={onBiometric} className="text-sm text-white/80 underline">Use biometric</button>
      </div>
      <div className="text-center text-xs text-white/50">
        Don’t have a wallet? <a href="/wallet/create" className="underline">Create</a> or <a href="/wallet/import" className="underline">Import</a>
      </div>
    </div>
  );
}
