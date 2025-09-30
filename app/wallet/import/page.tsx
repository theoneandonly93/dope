"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";

export default function ImportWallet() {
  const router = useRouter();
  const { importWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await importWallet(mnemonic.trim().toLowerCase(), password);
      router.replace("/unlock");
    } catch (e: any) {
      setError(e?.message || "Failed to import");
    } finally {
      setPending(false);
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
      {error && <div className="text-[12px] text-red-400">{error}</div>}
      <button disabled={pending || password.length < 6 || mnemonic.split(" ").length < 12} className="w-full btn disabled:opacity-50">
        {pending ? "Importing..." : "Import"}
      </button>
    </form>
  );
}
