"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../components/WalletProvider";
import CreatePasswordModal from "../../components/CreatePasswordModal";

export default function GetStarted() {
  const router = useRouter();
  const { hasWallet } = useWallet();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const onCreated = (payload: { mnemonic: string; address: string; secretBase58: string }) => {
    try {
      sessionStorage.setItem("dope:new_wallet_seed", payload.mnemonic);
      sessionStorage.setItem("dope:new_wallet_sk58", payload.secretBase58);
    } catch {}
    router.replace("/");
  };

  return (
    <div className="space-y-5 pb-24">
      <h1 className="text-xl font-semibold">Create your DOPE wallet</h1>
      <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
        <p className="text-white/70 text-sm">Set a password to protect your wallet. You’ll see your recovery seed phrase and private key next.</p>
        <button className="btn" onClick={() => setOpen(true)}>Get Started</button>
        {error && <div className="text-[12px] text-red-400">{error}</div>}
      </div>
      <CreatePasswordModal open={open} onClose={() => setOpen(false)} onCreated={onCreated} />
    </div>
  );
}
