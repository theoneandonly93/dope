import React, { useState, useEffect } from "react";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { sendSol } from "../lib/wallet";
import { getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";
import UnlockModal from "./UnlockModal";
import { useWallet } from "./WalletProvider";

export default function SendTokenForm({ mint, balance, keypair }: { mint: string, balance: number | null, keypair: Keypair | null }) {
  // Local transaction log for UI feedback
  function logLocalTx({ signature, status, time, change }: { signature: string, status: string, time: number, change: number|null }) {
    const log = JSON.parse(localStorage.getItem('dope_local_tx_log') || '[]');
    log.unshift({ signature, status, time, change });
    localStorage.setItem('dope_local_tx_log', JSON.stringify(log.slice(0, 20)));
  }
  const { unlock } = useWallet();

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
      return;
    }
    if (!toAddress || !amount || Number(amount) <= 0) {
      setStatus("Enter a valid address and amount.");
      logLocalTx({ signature: '', status: 'error', time: Date.now()/1000, change: null });
      return;
    }
    let recipient: PublicKey;
    try {
      recipient = new PublicKey(toAddress);
    } catch {
      setStatus("Invalid recipient address.");
      logLocalTx({ signature: '', status: 'error', time: Date.now()/1000, change: null });
      return;
    }
    if (balance !== null && Number(amount) > balance) {
      setStatus(`Insufficient balance. You have ${balance} and tried to send ${amount}.`);
      logLocalTx({ signature: '', status: 'error', time: Date.now()/1000, change: null });
      return;
    }
    setShowApprove(true);
  };

  const handleApprove = async () => {
    setShowApprove(false);
    setSending(true);
    setStatus("Signing and sending transaction...");
    logLocalTx({ signature: '', status: 'pending', time: Date.now()/1000, change: null });
    try {
      const { getConnection } = await import("../lib/wallet");
      const connection = getConnection();
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
          logLocalTx({ signature: '', status: 'error', time: Date.now()/1000, change: null });
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
      // Robust post-send check: fetch transaction and check status
      let txStatus = 'success';
      try {
        const tx = await connection.getParsedTransaction(txidVal, { commitment: "confirmed" });
        if (tx?.meta?.err) {
          txStatus = 'error';
        }
      } catch {}
      if (txStatus === 'success') {
        setStatus(`Sent! Transaction: ${txidVal}`);
      } else {
        setStatus(`Send failed. Transaction: ${txidVal}`);
      }
      logLocalTx({ signature: txidVal, status: txStatus, time: Date.now()/1000, change: Number(amount) });
    } catch (e: any) {
      setStatus(e?.message || "Send failed");
      logLocalTx({ signature: '', status: 'error', time: Date.now()/1000, change: null });
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
        disabled={sending}
      />
      <input
        type="number"
        min="0"
        step="any"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-white"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
        disabled={sending}
      />
      <button className="btn w-full" onClick={handleSend} disabled={sending}>{sending ? "Sending..." : "Send"}</button>
      {showUnlock && (
        <UnlockModal
          onUnlock={async (password) => {
            await unlock(password);
            setShowUnlock(false);
          }}
          onClose={() => setShowUnlock(false)}
        />
      )}
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
      {status && (
        <div className={`text-xs mt-2 ${status.toLowerCase().includes('fail') || status.toLowerCase().includes('error') ? 'text-red-400' : 'text-white/70'}`}>{status}</div>
      )}
    </div>
  );
}
