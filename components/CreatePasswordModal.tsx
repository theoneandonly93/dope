"use client";
import React, { useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";
import { DERIVATION_PRESETS, mnemonicToKeypairFromPath } from "../lib/wallet";
import bs58 from "bs58";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (payload: { mnemonic: string; address: string; secretBase58: string }) => void;
};

export default function CreatePasswordModal({ open, onClose, onCreated }: Props) {
  const { createWallet } = useWallet() as any;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-5
  }, [password]);

  if (!open) return null;

  const canSubmit = password.length >= 8 && password === confirm && !pending;

  const submit = async () => {
    setError("");
    if (!canSubmit) return;
    try {
      setPending(true);
      const res = await createWallet(password);
      const mnemonic: string = res.mnemonic;
      const address: string = res.address;
      // Derive keypair immediately using default Phantom path to get base58 secret
      const path = (DERIVATION_PRESETS[0] && DERIVATION_PRESETS[0].path) || "m/44'/501'/0'/0'";
      const kp = await mnemonicToKeypairFromPath(mnemonic, path);
      const secretBase58 = bs58.encode(kp.secretKey);
      onCreated?.({ mnemonic, address, secretBase58 });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to create wallet");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="text-lg font-semibold">Create Password</div>
        <div className="text-xs text-white/60">Protect your wallet with a password. You’ll need it to unlock.</div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-white/60 mb-1">Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm"
              placeholder="Enter a strong password"
            />
            <div className="text-[10px] text-white/50 mt-1">Strength: {['Very Weak','Weak','Fair','Good','Strong','Very Strong'][strength]}</div>
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Confirm Password</div>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm"
              placeholder="Re-enter your password"
            />
            {confirm && confirm !== password && (
              <div className="text-[10px] text-red-400 mt-1">Passwords do not match</div>
            )}
          </div>
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn flex-1" onClick={submit} disabled={!canSubmit}>{pending ? 'Creating…' : 'Create Wallet'}</button>
          <button type="button" className="btn flex-1" onClick={onClose} disabled={pending}>Cancel</button>
        </div>
        <div className="text-[10px] text-white/50">Tip: Use at least 8 characters with letters, numbers and symbols.</div>
      </div>
    </div>
  );
}
