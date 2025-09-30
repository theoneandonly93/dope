"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import { useWallet } from "../../../components/WalletProvider";
import {
  getStoredWallet,
  getMnemonicForActiveWallet,
  deriveChatKeypairFromMnemonic,
  publishChatKey,
  getPublishedChatKeyB64,
  getConversation,
  sendEncryptedChatMessage,
} from "../../../lib/wallet";

type Msg = { id: string; from: "me" | "them"; text: string; at: number | null };

export default function ChatPage() {
  const { keypair, address, unlocked } = useWallet();
  const [scheme, setScheme] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [chatPkB64, setChatPkB64] = useState<string>("");
  const [chatSk, setChatSk] = useState<Uint8Array | null>(null);
  const [recipient, setRecipient] = useState("");
  const [recipientChatB64, setRecipientChatB64] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const s = getStoredWallet();
    setScheme(s?.scheme || "");
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  // Derive chat keys when possible
  const deriveKeys = async () => {
    setError("");
    try {
      const mnemonic = await getMnemonicForActiveWallet(scheme === "password" ? password : undefined);
      const chat = await deriveChatKeypairFromMnemonic(mnemonic);
      setChatSk(chat.secretKey);
      setChatPkB64(Buffer.from(chat.publicKey).toString("base64"));
    } catch (e: any) {
      setError(e?.message || "Failed to derive chat keys");
    }
  };

  const ensureRecipientKey = async () => {
    try {
      const b64 = await getPublishedChatKeyB64(recipient.trim());
      setRecipientChatB64(b64);
    } catch {
      setRecipientChatB64(null);
    }
  };

  useEffect(() => {
    if (!recipient) return;
    ensureRecipientKey();
  }, [recipient]);

  useEffect(() => {
    // poll conversation periodically when we have keys and recipient
    if (!address || !recipient || !chatSk || !chatPkB64) return;
    let alive = true;
    const load = async () => {
      try {
        const list = await getConversation(address, recipient, chatSk, chatPkB64);
        if (alive) setMsgs(list.map((m) => ({ id: m.id, from: m.from, text: m.text, at: m.time })));
      } catch {}
    };
    load();
    const iv = setInterval(load, 15000);
    return () => { alive = false; clearInterval(iv); };
  }, [address, recipient, chatSk, chatPkB64]);

  const publishKey = async () => {
    if (!keypair || !chatPkB64) return;
    try { await publishChatKey(keypair, chatPkB64); } catch (e) { console.error(e); }
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!keypair || !chatSk || !chatPkB64) { setError("Unlock chat first"); return; }
    const t = text.trim();
    if (!t || !recipient) return;
    try {
      await sendEncryptedChatMessage(keypair, chatSk, chatPkB64, recipient, t);
      setText("");
      // refresh conversation shortly
      setTimeout(async () => {
        if (!address) return;
        const list = await getConversation(address, recipient, chatSk, chatPkB64);
        setMsgs(list.map((m) => ({ id: m.id, from: m.from, text: m.text, at: m.time })));
      }, 1200);
    } catch (e: any) {
      setError(e?.message || "Failed to send");
    }
  };

  const needPassword = scheme === "password" && (!chatSk || !chatPkB64);

  return (
    <div className="flex flex-col gap-3 min-h-[calc(100vh-180px)]">
      <div className="glass rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="text-sm font-semibold">Direct Message</div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
          placeholder="Recipient wallet address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <div className="text-xs text-white/60">
          {recipient ? (recipientChatB64 ? "Recipient chat key found." : "Recipient has not published a chat key yet.") : "Enter a wallet address to start."}
        </div>
      </div>

      <div className="glass rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Your Chat Key</div>
          <div className="text-xs text-white/60 break-all max-w-[50%]">{chatPkB64 ? chatPkB64.slice(0,10)+"…"+chatPkB64.slice(-6) : "Not derived"}</div>
        </div>
        {needPassword && (
          <div className="flex gap-2 items-center">
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Wallet password" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none" />
            <button className="btn" onClick={deriveKeys}>Unlock Chat</button>
          </div>
        )}
        {!needPassword && !chatPkB64 && (
          <button className="btn w-full" onClick={deriveKeys}>Generate Chat Keys</button>
        )}
        {chatPkB64 && <button className="btn w-full" onClick={publishKey}>Publish Chat Key</button>}
        {error && <div className="text-xs text-red-400">{error}</div>}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "bg-white text-black" : "glass border border-white/10"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none"
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn">Send</button>
      </form>
    </div>
  );
}
