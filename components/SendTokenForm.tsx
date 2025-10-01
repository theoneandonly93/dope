import React, { useState } from "react";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { sendSol } from "../lib/wallet";
import { getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";

export default function SendTokenForm({ mint, balance, keypair }: { mint: string, balance: number | null, keypair: Keypair | null }) {

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

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
      setStatus("Unlock your wallet first.");
      return;
    }
    if (!toAddress || amount <= 0) {
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
    if (balance !== null && amount > balance) {
      setStatus("Insufficient balance.");
      return;
    }
    setSending(true);
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com");
      let txid = "";
      if (mint === "So11111111111111111111111111111111111111112") {
        txid = await sendSol(keypair, toAddress, amount);
      } else {
        // SPL token send
        const mintPubkey = new PublicKey(mint);
        const decimals = await getTokenDecimals(connection, mint);
        // Only use owner as payer for sender's ATA, recipient's ATA should use owner as payer only if not exists
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mintPubkey, keypair.publicKey);
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mintPubkey, recipient);
        txid = await transferChecked(
          connection,
          keypair,
          fromTokenAccount.address,
          mintPubkey,
          toTokenAccount.address,
          keypair,
          amount,
          decimals
        );
      }
      setStatus(`Sent! Transaction: ${txid}`);
    } catch (e: any) {
      setStatus(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
        placeholder="Recipient address"
        value={toAddress}
        onChange={e => setToAddress(e.target.value)}
      />
      <input
        type="number"
        min="0"
        step="any"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />
      <button className="btn w-full" onClick={handleSend} disabled={sending}>{sending ? "Sending..." : "Send"}</button>
      {status && <div className="text-xs text-white/70 mt-2">{status}</div>}
    </div>
  );
}
