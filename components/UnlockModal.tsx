import React, { useState } from "react";
import { useWalletOptional } from "./WalletProvider";

export default function UnlockModal({ onUnlock, onClose, onBiometricUnlock }: { onUnlock: (password: string) => Promise<void>, onClose: () => void, onBiometricUnlock?: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const walletCtx = useWalletOptional();

  const handleUnlock = async () => {
    setError("");
    setLoading(true);
    try {
      await onUnlock(password);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Unlock failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    if (!onBiometricUnlock) return;
    setError("");
    setBioLoading(true);
    try {
      const ok = await onBiometricUnlock();
      if (ok) {
        onClose();
      } else {
        setError("Biometric unlock failed or not available.");
      }
    } catch (e:any) {
      setError(e?.message || "Biometric unlock failed");
    } finally {
      setBioLoading(false);
    }
  };

  const biometricCapable = !!onBiometricUnlock && !!walletCtx?.tryBiometricUnlock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white">
        <h2 className="text-lg font-semibold mb-4">Unlock Wallet</h2>
        <input
          type="password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white mb-2"
          placeholder="Wallet password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        <button className="btn w-full mb-2" onClick={handleUnlock} disabled={loading || !password}>{loading ? "Unlocking..." : "Unlock"}</button>
        {biometricCapable && (
          <button className="btn w-full mb-2" onClick={handleBiometric} disabled={bioLoading}>{bioLoading ? "Verifying…" : "Use Biometric"}</button>
        )}
        <button className="btn w-full" onClick={onClose} disabled={loading}>Cancel</button>
        {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      </div>
    </div>
  );
}
