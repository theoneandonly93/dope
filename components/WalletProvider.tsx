"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Keypair } from "@solana/web3.js";
import {
  getStoredWallet,
  isUnlocked,
  unlockWithPassword,
  clearStoredWallet,
  createNewWallet,
  importWalletFromMnemonic,
  isBiometricAvailable,
  biometricGate,
  unlockWithDevice,
} from "../lib/wallet";

type Ctx = {
  address: string | null;
  unlocked: boolean;
  keypair: Keypair | null;
  hasWallet: boolean;
  createWallet: (password: string) => Promise<{ mnemonic: string; address: string }>;
  importWallet: (mnemonic: string, password: string) => Promise<{ address: string }>;
  unlock: (password: string) => Promise<void>;
  tryBiometricUnlock: () => Promise<boolean>;
  lock: () => void;
  logout: () => void;
};

export const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStoredWallet();
    if (stored) {
      setAddress(stored.pubkey);
      setHasWallet(true);
    } else {
      setHasWallet(false);
    }
    setUnlocked(isUnlocked());
    isBiometricAvailable().then(setBioAvailable).catch(() => setBioAvailable(false));
    // Auto-unlock device-scheme wallets
    (async () => {
      try {
        if (stored?.scheme === "device") {
          const kp = await unlockWithDevice();
          setKeypair(kp);
          setUnlocked(true);
        }
      } catch {
        // ignore, user can still use unlock page
      }
    })();
    const onStore = () => {
      const s = getStoredWallet();
      if (s) {
        setAddress(s.pubkey);
        setHasWallet(true);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('dope:store', onStore);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('dope:store', onStore);
      }
    };
  }, []);

  const createWallet = async (password: string) => {
    const res = await createNewWallet(password);
    setAddress(res.address);
    setHasWallet(true);
    return res;
  };

  const importWallet = async (mnemonic: string, password: string) => {
    const res = await importWalletFromMnemonic(mnemonic, password);
    setAddress(res.address);
    setHasWallet(true);
    return res;
  };

  const unlock = async (password: string) => {
    const kp = await unlockWithPassword(password);
    setKeypair(kp);
    setUnlocked(true);
  };

  const tryBiometricUnlock = async () => {
    if (!bioAvailable) return false;
    const ok = await biometricGate();
    // Biometric is used as a quick gate; actual key is still password-based.
    // For convenience, if a session is already considered unlocked by prior password use,
    // biometric alone will allow re-entry on return to app while session storage persists.
    if (ok && isUnlocked()) {
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    setKeypair(null);
    // keep session flag to allow biometric quick re-entry unless user logs out
    setUnlocked(false);
  };

  const logout = () => {
    setKeypair(null);
    clearStoredWallet();
    setUnlocked(false);
    setAddress(null);
    setHasWallet(false);
  };

  return (
    <WalletContext.Provider value={{ address, unlocked, keypair, hasWallet, createWallet, importWallet, unlock, tryBiometricUnlock, lock, logout }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function useWalletOptional() {
  return useContext(WalletContext);
}
