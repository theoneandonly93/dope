"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { DERIVATION_PRESETS } from "../../../lib/wallet";
import { scanMnemonicForAccounts } from "../../../lib/walletScan";

export default function ImportWallet() {
  const router = useRouter();
  const { importWallet, importKeypair } = useWallet();
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [derivation, setDerivation] = useState<string>('phantom');
  const [scanResults, setScanResults] = useState<{ path: string; pubkey: string; balance: number }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [bip39Passphrase, setBip39Passphrase] = useState<string>("");
  const [keypairJson, setKeypairJson] = useState<string>("");
  const [pendingKeypair, setPendingKeypair] = useState(false);
  const [previewPk, setPreviewPk] = useState<string>("");

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

  function parseSecret(input: string): Uint8Array | null {
    const s = input.trim();
    if (!s) return null;
    try {
      if (s.startsWith("[")) {
        const arr = JSON.parse(s);
        if (Array.isArray(arr)) return new Uint8Array(arr.map((x: any) => Number(x)));
      } else if (/^[A-Za-z0-9+/=]+$/.test(s) && s.includes("=")) {
        const bin = atob(s);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return u8;
      } else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(s)) {
        return bs58.decode(s);
      }
    } catch {}
    return null;
  }

  const onImportKeypair = async () => {
    setError(""); setPendingKeypair(true);
    try {
      await importKeypair(keypairJson, password);
      router.replace('/unlock');
    } catch (e: any) {
      setError(e?.message || 'Failed to import keypair');
    } finally {
      setPendingKeypair(false);
    }
  };

  const onKeypairChange = (val: string) => {
    setKeypairJson(val);
    setPreviewPk("");
    const sk = parseSecret(val);
    if (sk && (sk.length === 64 || sk.length === 32)) {
      try {
        const kp = Keypair.fromSecretKey(sk.length === 64 ? sk : (()=>{ const b=new Uint8Array(64); b.set(sk); return b; })());
        setPreviewPk(kp.publicKey.toBase58());
      } catch {}
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
          <div className="rounded-xl border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
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

      <div className="space-y-3 mt-6">
        <div className="text-sm font-semibold">Or import from keypair (id.json)</div>
        <div className="space-y-3">
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff] min-h-[110px]"
            placeholder="Paste keypair JSON array or base58/base64 secret"
            value={keypairJson}
            onChange={(e)=>onKeypairChange(e.target.value)}
          />
          {previewPk && (
            <div className="text-xs text-white/70">Derived Public Key: <span className="font-mono">{previewPk}</span></div>
          )}
          <button type="button" onClick={onImportKeypair} className="w-full btn disabled:opacity-50" disabled={pendingKeypair || password.length < 6 || keypairJson.trim().length < 3}>
            {pendingKeypair ? 'Importing...' : 'Import Keypair'}
          </button>
          <div className="text-[11px] text-white/50">Tip: To get your JSON, open ~/.config/solana/id.json and paste the full array (e.g., [159,150,...]).</div>
        </div>
      </div>
    </form>
  );
}
