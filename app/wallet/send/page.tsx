"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../components/WalletProvider";
import { sendSol } from "../../../lib/wallet";
import { PublicKey } from "@solana/web3.js";

export default function SendPage() {
  const router = useRouter();
  const { unlocked, keypair } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [sig, setSig] = useState("");
  const [pending, setPending] = useState(false);
  const [validTo, setValidTo] = useState<boolean>(false);

  useEffect(() => {
    if (!unlocked) router.replace("/unlock");
  }, [unlocked, router]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSig("");
    if (!keypair) return setError("Wallet is locked");
    const amt = parseFloat(amount);
    if (!(amt > 0)) return setError("Enter a valid amount");
    try { new PublicKey(to.trim()); setValidTo(true); } catch { setValidTo(false); return setError("Invalid recipient address"); }
    setPending(true);
    try {
      const tx = await sendSol(keypair, to.trim(), amt);
      setSig(tx);
    } catch (e: any) {
      setError(e?.message || "Failed to send");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSend} className="space-y-4">
      <h1 className="text-xl font-semibold">Send DOPE</h1>
      <input
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
        placeholder="Recipient address"
        value={to}
        onChange={(e) => { setTo(e.target.value); try { new PublicKey(e.target.value.trim()); setValidTo(true);} catch { setValidTo(false);} }}
      />
      <input
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none focus:border-[#a58cff]"
        placeholder="Amount (DOPE)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error && <div className="text-[12px] text-red-400">{error}</div>}
      {sig && (
        <div className="text-[12px] text-green-400 break-all">
          Sent. Signature: {sig}
        </div>
      )}
      <button disabled={pending || !validTo} className="w-full btn disabled:opacity-50">
        {pending ? "Sending..." : "Send"}
      </button>
      <div className="text-[11px] text-white/60 bg-black/20 border border-white/10 rounded p-2">
        Non‑custodial wallet: you control your keys. On‑chain transfers are irreversible. Double‑check the recipient address and amount before sending. No financial or investment advice.
      </div>
    </form>
  );
}
