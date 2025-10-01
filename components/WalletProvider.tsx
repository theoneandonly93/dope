"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  getStoredWallet,
  isUnlocked,
  unlockWithPassword,
  clearStoredWallet,
  createNewWallet,
  importWalletFromMnemonic,
  importWalletWithPath,
  isBiometricAvailable,
  biometricGate,
  unlockWithDevice,
} from "../lib/wallet";

type Ctx = {
  address: string | null;
  unlocked: boolean;
  keypair: Keypair | null;
  hasWallet: boolean;
  ready: boolean;
  createWallet: (password: string) => Promise<{ mnemonic: string; address: string }>;
  importWallet: (
    mnemonic: string,
    password: string,
    derivationKeyOrPath?: string,
    bip39Passphrase?: string
  ) => Promise<{ address: string }>;
  importKeypair: (secretInput: string, password: string) => Promise<{ address: string }>;
  unlock: (password: string) => Promise<void>;
  tryBiometricUnlock: () => Promise<boolean>;
  lock: () => void;
  logout: () => void;
};

export const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [unlocked, setUnlocked] = useState<boolean>(typeof window !== 'undefined' ? isUnlocked() : false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

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

  useEffect(() => {
    // mark provider initialized so pages can gate redirects until state is hydrated
    setReady(true);
  }, []);

  const createWallet = async (password: string) => {
    const res = await createNewWallet(password);
    setAddress(res.address);
    setHasWallet(true);
    return res;
  };

  const importWallet = async (mnemonic: string, password: string, derivationKeyOrPath = 'phantom', bip39Passphrase?: string) => {
    const isPath = typeof derivationKeyOrPath === 'string' && derivationKeyOrPath.startsWith('m/');
    const res = isPath
      ? await importWalletWithPath(mnemonic, password, derivationKeyOrPath as string, bip39Passphrase)
      : await importWalletFromMnemonic(mnemonic, password, derivationKeyOrPath as string, bip39Passphrase);
    setAddress(res.address);
    setHasWallet(true);
    return res;
  };

  const importKeypair = async (secretInput: string, password: string) => {
    let secret: Uint8Array | null = null;
    const s = secretInput.trim();
    try {
      if (s.startsWith("[")) {
        const arr = JSON.parse(s);
        if (Array.isArray(arr)) secret = new Uint8Array(arr.map((x: any) => Number(x)));
      } else if (/^[A-Za-z0-9+/=]+$/.test(s) && s.includes("=")) {
        // base64
        const bin = atob(s);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        secret = u8;
      } else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(s)) {
        // base58
        secret = bs58.decode(s);
      }
    } catch {}
    if (!secret) throw new Error("Invalid keypair input. Paste JSON array, base58, or base64 secret key.");
    const { importWalletFromSecretKey } = await import("../lib/wallet");
    const res = await importWalletFromSecretKey(secret, password);
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
    <WalletContext.Provider value={{ address, unlocked, keypair, hasWallet, ready, createWallet, importWallet, importKeypair, unlock, tryBiometricUnlock, lock, logout }}>
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
