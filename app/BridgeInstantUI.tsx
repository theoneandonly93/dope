import React, { useCallback, useEffect, useRef, useState } from "react";
import RedeemVAA from "../components/RedeemVAA";
import { useWallet } from "../components/WalletProvider";
import UnlockModal from "../components/UnlockModal";

// Lazy import real wormhole bridge when needed
async function initiate(params: { keypair: any; mint: string; amount: number; toChain: string; toAddress: string }) {
  const { initiateBridge, CHAIN_IDS } = await import("../lib/wormhole");
  const res = await initiateBridge({ from: params.keypair, mint: params.mint, amount: params.amount, toChain: params.toChain, toAddress: params.toAddress });
  return { ...res, CHAIN_IDS } as any;
}

export interface BridgeInstantUIProps {
  mint: string;
  name: string;
  balance: number | null;
  onClose: () => void;
}

type Phase = 'idle' | 'signing' | 'submitted' | 'waitingVAA' | 'vaaAvailable' | 'error';

export default function BridgeInstantUI({ mint, name, balance, onClose }: BridgeInstantUIProps) {
  const { keypair, unlock, tryBiometricUnlock } = useWallet() as any;
  const [toChain, setToChain] = useState("eth");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [phase, setPhase] = useState<Phase>('idle');
  const [loading, setLoading] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockedSession, setUnlockedSession] = useState(false);
  const [txSig, setTxSig] = useState<string>("");
  const [toAddress, setToAddress] = useState("");
  const [vaa, setVaa] = useState<string>("");
  const [sequence, setSequence] = useState<string>("");
  const [emitter, setEmitter] = useState<string>("");
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<number | null>(null);
  const [checkRelayer, setCheckRelayer] = useState(false);
  const [relayerStatus, setRelayerStatus] = useState<string>("");

  const CHAINS = [
    { id: "solana", name: "Solana", supported: true }, // source chain (disabled as target for now)
    { id: "eth", name: "Ethereum", supported: true },
    { id: "bnb", name: "BNB Chain", supported: true },
    { id: "base", name: "Base", supported: true },
    { id: "btc", name: "Bitcoin", supported: false },
    { id: "ape", name: "Ape Chain", supported: false },
    { id: "sei", name: "Sei Network", supported: false }
  ];

  const startPolling = useCallback(async (seq: string, em: string) => {
    if (pollRef.current) window.clearTimeout(pollRef.current);
    setPolling(true);
    setPhase('waitingVAA');
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // ~4 minutes with 4s interval
    const tick = async () => {
      attempts++;
      try {
        const chainId = 1; // Solana chain id in Wormhole
        const res = await fetch(`/api/bridge/vaa?chain=${chainId}&emitter=${em}&sequence=${seq}`);
        if (res.ok) {
          const json = await res.json();
            if (json.error) {
              setStatus(json.error);
            } else if (!json.pending && json.vaa) {
              setVaa(json.vaa);
              setStatus('VAA available. Ready for redemption on target chain.');
              setPhase('vaaAvailable');
              setPolling(false);
              return;
            } else {
              setStatus(`Waiting for guardian signature… (attempt ${attempts})`);
            }
        } else {
          setStatus(`Guardian query failed (attempt ${attempts})`);
        }
      } catch (err:any) {
        setStatus(`Polling error: ${err?.message || 'unknown'}`);
      }
      if (attempts < MAX_ATTEMPTS && phase !== 'vaaAvailable') {
        pollRef.current = window.setTimeout(tick, 4000);
      } else if (attempts >= MAX_ATTEMPTS) {
        setStatus('Stopped polling: max attempts reached. Use manual Check VAA.');
        setPolling(false);
      }
    };
    tick();
  }, [phase]);

  // Relayer status stub: pretend to poll a relayer service
  useEffect(() => {
    if (!checkRelayer || phase !== 'waitingVAA') { setRelayerStatus(''); return; }
    let cancelled = false;
    const loop = async () => {
      while (!cancelled && phase === 'waitingVAA') {
        setRelayerStatus('Relayer: monitoring (stub)…');
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    loop();
    return () => { cancelled = true; };
  }, [checkRelayer, phase]);

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    if (!unlockedSession || !keypair) { setShowUnlock(true); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setStatus("Enter a valid amount"); return; }
    if (balance != null && amt > balance) { setStatus("Amount exceeds balance"); return; }
    const selected = CHAINS.find(c => c.id === toChain);
    if (!selected?.supported) { setStatus("Selected target chain not yet supported."); return; }
    if (!toAddress || !toAddress.startsWith('0x')) { setStatus("Enter a valid EVM 0x destination address"); return; }
    setLoading(true);
    setPhase('signing');
    setStatus("Preparing and signing Wormhole transfer…");
    try {
      const res: any = await initiate({ keypair, mint, amount: amt, toChain, toAddress });
      setTxSig(res.signature);
      setStatus("Transaction submitted. Confirming & extracting sequence…");
      setPhase('submitted');
      if (res.sequence) {
        setSequence(res.sequence);
        setEmitter(res.emitterAddress);
        setStatus("Sequence obtained. Polling guardian for VAA…");
        startPolling(res.sequence, res.emitterAddress);
      } else {
        setStatus("Waiting for sequence (may take a few seconds). You can try 'Check VAA' shortly.");
      }
    } catch (e:any) {
      setPhase('error');
      setStatus(e?.message || 'Bridge failed');
    } finally {
      setLoading(false);
    }
  };

  const manualCheck = async () => {
    if (!sequence || !emitter) { setStatus('No sequence yet. Wait a bit.'); return; }
    setStatus('Manual VAA check…');
    try {
      const res = await fetch(`/api/bridge/vaa?chain=1&emitter=${emitter}&sequence=${sequence}`);
      if (res.ok) {
        const json = await res.json();
        if (!json.pending && json.vaa) {
          setVaa(json.vaa);
          setPhase('vaaAvailable');
          setStatus('VAA available. Ready for redemption.');
          setPolling(false);
        } else {
          setStatus('Still pending guardian signature.');
        }
      } else {
        setStatus('Guardian query failed');
      }
    } catch (e:any) {
      setStatus(e?.message || 'Manual check failed');
    }
  };

  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);
  return (
    <form onSubmit={handleBridge} className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <span className="text-white/60">To Chain:</span>
        <select value={toChain} onChange={e => setToChain(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white">
          {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}{!c.supported ? ' (soon)' : ''}</option>)}
        </select>
      </div>
      <input
        type="text"
        className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
        placeholder="Destination EVM 0x address"
        value={toAddress}
        onChange={e => setToAddress(e.target.value.trim())}
        disabled={loading}
      />
      <input
        type="number"
        min="0"
        max={balance ?? undefined}
        step="any"
        className="px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
        placeholder={`Amount (max ${balance ?? "—"})`}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={loading}
      />
      {!unlockedSession && (
        <button type="button" className="btn" onClick={() => setShowUnlock(true)}>Unlock to Bridge</button>
      )}
      {unlockedSession && (
        <button className="btn" type="submit" disabled={loading || phase==='waitingVAA'}>{loading ? "Signing…" : phase==='waitingVAA' ? 'Polling VAA…' : "Bridge"}</button>
      )}
      <label className="flex items-center gap-2 text-[10px] text-white/50 mt-1">
        <input type="checkbox" checked={checkRelayer} onChange={e => setCheckRelayer(e.target.checked)} /> Relayer Monitor (stub)
      </label>
      {relayerStatus && <div className="text-[10px] text-white/40">{relayerStatus}</div>}
      {sequence && phase !== 'vaaAvailable' && (
        <button type="button" className="btn" onClick={manualCheck} disabled={polling}>Check VAA</button>
      )}
      {status && <div className="text-green-400 text-xs mt-2 whitespace-pre-wrap break-words">{status}</div>}
      {txSig && (
        <div className="text-xs text-white/70 break-all mt-1">Tx: <a className="underline" target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${txSig}?cluster=mainnet-beta`}>{txSig}</a></div>
      )}
      {sequence && <div className="text-[10px] text-white/40 break-all">Sequence: {sequence}</div>}
      {emitter && <div className="text-[10px] text-white/40 break-all">Emitter: {emitter}</div>}
      {vaa && (
        <div className="mt-2 p-2 bg-black/30 rounded border border-white/10 flex flex-col gap-1">
          <div className="text-xs text-white/70">Signed VAA (base64):</div>
          <textarea readOnly value={vaa} className="w-full text-[10px] bg-black/40 p-1 rounded h-24"></textarea>
          <button type="button" className="btn" onClick={() => { navigator.clipboard.writeText(vaa); setStatus('VAA copied to clipboard'); }}>Copy VAA</button>
          <RedeemVAA vaa={vaa} targetChain={toChain} />
        </div>
      )}
      <button className="btn mt-2" type="button" onClick={onClose}>Close</button>
      <div className="mt-2 text-xs text-white/60 text-center">Alpha Wormhole integration. After VAA appears, redeem on destination chain (redemption flow coming soon).</div>
      {showUnlock && (
        <UnlockModal
          onUnlock={async (password) => {
            await unlock(password);
            setUnlockedSession(true);
            setShowUnlock(false);
          }}
          onBiometricUnlock={async () => {
            if (!tryBiometricUnlock) return false;
            const ok = await tryBiometricUnlock();
            if (ok) setUnlockedSession(true);
            return ok;
          }}
          onClose={() => setShowUnlock(false)}
        />
      )}
    </form>
  );
}