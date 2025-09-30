"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createWalletImmediateSave } from "../../lib/wallet";
import { useWallet } from "../../components/WalletProvider";

function toBase64(u8: Uint8Array) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

export default function GetStarted() {
  const router = useRouter();
  const { hasWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [privB64, setPrivB64] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPriv, setShowPriv] = useState(false);

  useEffect(() => {
    if (hasWallet) {
      router.replace("/");
      return;
    }
    // Generate and immediately save (device-encrypted) on first mount
    (async () => {
      try {
        setPending(true);
        const { mnemonic, address, keypair } = await createWalletImmediateSave();
        setMnemonic(mnemonic);
        setPubkey(address);
        setPrivB64(toBase64(keypair.secretKey));
        // Navigate straight to the wallet home
        router.replace("/");
      } catch (e: any) {
        setError(e?.message || "Failed to create wallet");
      } finally {
        setPending(false);
      }
    })();
  }, [hasWallet, router]);

  const maskedPriv = useMemo(() => (showPriv ? privB64 : privB64.replace(/.{6}$/g, "******")), [privB64, showPriv]);

  return (
    <div className="space-y-5 pb-24">
      <h1 className="text-xl font-semibold">Your New Wallet</h1>
      <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
        <div>
          <div className="text-xs text-white/60">Public Address</div>
          <div className="font-mono break-all text-sm">{pubkey || "Generating..."}</div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Seed Phrase</div>
          <div className="font-mono text-sm leading-7 select-all">{mnemonic || "Generating..."}</div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Private Key (base64)</div>
          <div className="font-mono break-all text-sm select-all">{maskedPriv || "Generating..."}</div>
          <button onClick={() => setShowPriv((s) => !s)} className="mt-2 text-xs underline text-white/70">{showPriv ? "Hide" : "Show"} private key</button>
        </div>
      </div>

      <div className="text-white/70 text-sm">
        Your wallet is being created and saved. You will be redirected to your wallet dashboard automatically.
      </div>
      {error && <div className="text-[12px] text-red-400">{error}</div>}
    </div>
  );
}
