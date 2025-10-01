import React, { useState, useEffect } from "react";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { sendSol } from "../lib/wallet";
import { getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";

export default function SendTokenForm({ mint, balance, keypair }: { mint: string, balance: number | null, keypair: Keypair | null }) {

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [txid, setTxid] = useState<string>("");

  async function getTokenDecimals(connection: Connection, mint: string): Promise<number> {
    try {
      const mintPubkey = new PublicKey(mint);
      const info = await connection.getParsedAccountInfo(mintPubkey);
      // @ts-ignore
      return info?.value?.data?.parsed?.info?.decimals ?? 9;
    } catch {
      return 9;
    }
  }

  const handleSend = async () => {
    setStatus("");
    if (!keypair) {
      setShowUnlock(true);
      setStatus("Unlock your wallet first.");
      return;
    }
    if (!toAddress || !amount || Number(amount) <= 0) {
      setStatus("Enter a valid address and amount.");
      return;
    }
    let recipient: PublicKey;
    try {
      recipient = new PublicKey(toAddress);
    } catch {
      setStatus("Invalid recipient address.");
      return;
    }
    if (balance !== null && Number(amount) > balance) {
      setStatus("Insufficient balance.");
      return;
    }
    setShowApprove(true);
  };

  const handleApprove = async () => {
    setShowApprove(false);
    setSending(true);
    setStatus("Signing and sending transaction...");
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com");
      let txidVal = "";
      if (mint === "So11111111111111111111111111111111111111112") {
        txidVal = await sendSol(keypair, toAddress, Number(amount));
      } else {
        // SPL token send
        const mintPubkey = new PublicKey(mint);
        const decimals = await getTokenDecimals(connection, mint);
        let recipient: PublicKey;
        try {
          recipient = new PublicKey(toAddress);
        } catch {
          setStatus("Invalid recipient address.");
          setSending(false);
          return;
        }
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mintPubkey, keypair.publicKey);
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mintPubkey, recipient);
        txidVal = await transferChecked(
          connection,
          keypair,
          fromTokenAccount.address,
          mintPubkey,
          toTokenAccount.address,
          keypair,
          Number(amount),
          decimals
        );
      }
      setTxid(txidVal);
      setStatus(`Sent! Transaction: ${txidVal}`);
    } catch (e: any) {
      setStatus(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  // Check if wallet is unlocked after redirect from /unlock
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/unlock") {
      // Wait for unlock, then check if keypair is present
      const checkUnlocked = setInterval(() => {
        if (keypair) {
          window.location.replace(window.location.origin + window.location.pathname.replace("/unlock", ""));
        }
      }, 500);
      return () => clearInterval(checkUnlocked);
    }
  }, [keypair]);

  return (
    <div className="space-y-2">
      {!keypair && (
        <div className="mt-2">
          <a href="/unlock" className="btn w-full">Unlock Wallet</a>
        </div>
      )}
      <input
        type="text"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
        placeholder="Recipient address"
        value={toAddress}
        onChange={e => setToAddress(e.target.value)}
        disabled={!keypair}
      />
      <input
        type="number"
        min="0"
        step="any"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
        disabled={!keypair}
      />
      <button className="btn w-full" onClick={handleSend} disabled={sending || !keypair}>{sending ? "Sending..." : "Send"}</button>
      {showApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white">
            <h2 className="text-lg font-semibold mb-4">Approve Transaction</h2>
            <div className="mb-2">You are about to send <span className="font-bold">{amount} {mint === "So11111111111111111111111111111111111111112" ? "SOL" : "Token"}</span> to <span className="font-mono">{toAddress}</span>.</div>
            <div className="mb-4 text-xs text-white/70">Please confirm and sign this transaction to proceed on the blockchain.</div>
            <button className="btn w-full mb-2" onClick={handleApprove}>Approve & Sign</button>
            <button className="btn w-full" onClick={() => setShowApprove(false)}>Cancel</button>
          </div>
        </div>
      )}
      {txid && (
        <div className="mt-2 text-green-400 text-xs">Transaction sent! <a href={`https://explorer.solana.com/tx/${txid}?cluster=mainnet-beta`} target="_blank" rel="noreferrer" className="underline">View on Solana Explorer</a></div>
      )}
      {status && <div className="text-xs text-white/70 mt-2">{status}</div>}
    </div>
  );
}
