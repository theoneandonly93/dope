"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";
import { DERIVATION_PRESETS } from "../../../lib/wallet";
import { scanMnemonicForAccounts } from "../../../lib/walletScan";

export default function ImportWallet() {
  const router = useRouter();
  const { importWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [derivation, setDerivation] = useState<string>('phantom');
  const [scanResults, setScanResults] = useState<{ path: string; pubkey: string; balance: number }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [bip39Passphrase, setBip39Passphrase] = useState<string>("");

  const onImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await importWallet(mnemonic.trim().toLowerCase(), password, derivation, bip39Passphrase || undefined);
      router.replace("/unlock");
    } catch (e: any) {
      setError(e?.message || "Failed to import");
    } finally {
      setPending(false);
    }
  };

  const onScan = async () => {
    setScanning(true); setScanResults([]); setError("");
    try {
      const res = await scanMnemonicForAccounts(mnemonic.trim().toLowerCase(), bip39Passphrase || undefined);
      setScanResults(res);
    } catch (e: any) {
      setError(e?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const setAsMain = async (path: string) => {
    const key = DERIVATION_PRESETS.find((p)=>p.path===path)?.key || 'phantom';
    setDerivation(key);
    // If password filled, proceed to import directly
    if (password.length >= 6) {
      try {
        setPending(true);
        // Use raw path to ensure exact match and include optional BIP39 passphrase
        await importWallet(mnemonic.trim().toLowerCase(), password, path, bip39Passphrase || undefined);
        router.replace('/unlock');
      } catch (e: any) {
        setError(e?.message || 'Failed to import');
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <form onSubmit={onImport} className="space-y-4">
      <h1 className="text-xl font-semibold">Import Wallet</h1>
      <textarea
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff] min-h-[110px]"
        placeholder="Secret phrase (12 or 24 words)"
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
      />
      <input
        type="password"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
        placeholder="BIP39 passphrase (optional)"
        value={bip39Passphrase}
        onChange={(e)=>setBip39Passphrase(e.target.value)}
      />
      <div className="flex gap-2">
        <button type="button" onClick={onScan} className="btn" disabled={scanning || mnemonic.split(' ').length < 12}>{scanning? 'Scanning...' : 'Scan Accounts'}</button>
      </div>
      <div>
        <div className="text-xs text-white/60 mb-1">Derivation Path</div>
        <select
          value={derivation}
          onChange={(e)=>setDerivation(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
        >
          {DERIVATION_PRESETS.map((p)=> (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <div className="text-[11px] text-white/50 mt-1">Pick the path where the wallet was originally created (Phantom/Sollet/etc).</div>
      </div>
      {error && <div className="text-[12px] text-red-400">{error}</div>}
      <button disabled={pending || password.length < 6 || mnemonic.split(" ").length < 12} className="w-full btn disabled:opacity-50">
        {pending ? "Importing..." : "Import"}
      </button>

      {scanResults.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="text-sm font-semibold">Detected Accounts</div>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-white/5">
                  <th className="px-3 py-2">Derivation Path</th>
                  <th className="px-3 py-2">Public Key</th>
                  <th className="px-3 py-2">DOPE Balance</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.map((r, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-3 py-2 font-mono text-xs break-all">{r.path}</td>
                    <td className="px-3 py-2 font-mono text-xs break-all">{r.pubkey}</td>
                    <td className="px-3 py-2">{r.balance.toFixed(4)} DOPE</td>
                    <td className="px-3 py-2">
                      <button type="button" className="btn text-xs" onClick={()=>setAsMain(r.path)}>Set as Main</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </form>
  );
}
