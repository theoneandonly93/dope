"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";

export default function CreateWallet() {
  const router = useRouter();
  const { createWallet, unlock } = useWallet();
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"form" | "show">("form");
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState("");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const { mnemonic, address } = await createWallet(password);
      setMnemonic(mnemonic);
      setAddress(address);
      setStep("show");
    } catch (e: any) {
      setError(e?.message || "Failed to create wallet");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {step === "form" && (
        <form onSubmit={onCreate} className="space-y-4">
          <h1 className="text-xl font-semibold">Create Wallet</h1>
          <p className="text-white/70 text-sm">Set a password to encrypt your secret phrase on this device.</p>
          <input
            type="password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
            placeholder="New password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-[12px] text-red-400">{error}</div>}
          <button disabled={pending || password.length < 6} className="w-full btn disabled:opacity-50">
            {pending ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {step === "show" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Save Your Secret Phrase</h1>
          <div className="text-white/70 text-sm">Write these 12 words down in order and store them safely. Anyone with them can control your funds.</div>
          <div className="glass rounded-xl p-4 border border-white/5 font-mono text-sm leading-7 select-all">
            {mnemonic}
          </div>
          <div className="text-xs text-white/60">Address: <span className="font-mono break-all">{address}</span></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            I saved my secret phrase.
          </label>
          <button
            disabled={!ack}
            onClick={async () => {
              try {
                await unlock(password);
              } catch {}
              router.replace("/");
            }}
            className="w-full btn disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
