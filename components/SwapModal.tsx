import React, { useEffect, useState } from 'react';
import UnlockModal from './UnlockModal';
import { useWallet } from './WalletProvider';
import { getConnection } from '../lib/wallet';
import { getTokenDecimals } from '../lib/tokenMetadataCache';

interface SwapModalProps {
  inputMint: string; // current token mint user is viewing
  inputSymbol: string;
  balance: number | null;
  onClose: () => void;
  onSwapped?: () => void; // callback to refresh balances
}

// Dynamic token list will be fetched from /tokenlist.json

type Phase = 'idle' | 'quoting' | 'ready' | 'signing' | 'submitted' | 'success' | 'error';

export default function SwapModal({ inputMint, inputSymbol, balance, onClose, onSwapped }: SwapModalProps) {
  const { keypair, unlock, tryBiometricUnlock } = useWallet() as any;
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [outputMint, setOutputMint] = useState<string>('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // default USDC
  const [filter, setFilter] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [txSig, setTxSig] = useState('');
  const [slippageBps, setSlippageBps] = useState(50);
  const [showRoute, setShowRoute] = useState(false);
  const [exactOutMode, setExactOutMode] = useState(false); // placeholder (not wired to backend yet)

  useEffect(() => {
    fetch('/tokenlist.json')
      .then(r => r.json())
      .then(list => setTokenList(list))
      .catch(() => setTokenList([]));
  }, []);

  // Allow dynamic addition of a custom output mint (user provided) beyond token list
  const [customMint, setCustomMint] = useState<string>('');
  const [customMintError, setCustomMintError] = useState<string>('');
  const [useCustomMint, setUseCustomMint] = useState(false);

  const selectableTokens = tokenList.filter(t => t.mint !== inputMint && (!filter || (t.symbol || t.name || '').toLowerCase().includes(filter.toLowerCase())));

  const fetchDecimals = (mint: string) => getTokenDecimals(mint);

  const [minOut, setMinOut] = useState<string>('');

  const doQuote = async () => {
    const amt = Number(amountIn);
    if (!amt || amt <= 0) { setStatus('Enter amount'); return; }
    if (balance != null && amt > balance) { setStatus('Amount exceeds balance'); return; }
    setPhase('quoting');
    setStatus('Fetching quote…');
    try {
  const inDec = await fetchDecimals(inputMint);
  const scaled = Math.floor(amt * Math.pow(10, inDec));
  const r = await fetch(`/api/swap/quote?in=${encodeURIComponent(inputMint)}&out=${encodeURIComponent(outputMint)}&amountAtomic=${encodeURIComponent(String(scaled))}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'quote failed');
      setQuote(j);
      setPhase('ready');
  // Estimate min receive (apply  slippage bps over route outAmount if available)
  const outAmtRaw = j?.outAmount || 0;
  const outDec = await fetchDecimals(outputMint);
  const slipFactor = 1 - (slippageBps / 10_000);
  const min = (outAmtRaw / Math.pow(10, outDec)) * slipFactor;
  setMinOut(min.toLocaleString(undefined, { maximumFractionDigits: 6 }));
  setStatus('Quote ready. Review then Swap.');
    } catch (e:any) {
      setPhase('error');
      const raw = typeof e === 'object' ? JSON.stringify(e) : String(e);
      setStatus((e?.message || 'Quote error') + (raw.length < 120 ? ` (${raw})` : ''));
    }
  };

  const doSwap = async () => {
    if (!unlocked) { setShowUnlock(true); return; }
    if (!keypair) { setStatus('Wallet not loaded'); return; }
    const amt = Number(amountIn);
    if (!amt || amt <= 0) { setStatus('Enter amount'); return; }
    setPhase('signing');
    setStatus('Preparing swap transaction…');
    try {
  const inDec = await fetchDecimals(inputMint);
  const atomic = Math.floor(amt * Math.pow(10, inDec));
  const body = { inputMint, outputMint, amountAtomic: atomic, slippageBps, userPublicKey: keypair.publicKey.toString() };
      const r = await fetch('/api/swap/prepare', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'prepare failed');
      if (!j.swapTransaction) throw new Error('Missing swapTransaction');
      const raw = Buffer.from(j.swapTransaction, 'base64');
      const { Transaction } = await import('@solana/web3.js');
      const tx = Transaction.from(raw);
      tx.sign(keypair);
      const conn = getConnection();
      const sig = await conn.sendRawTransaction(tx.serialize());
      setTxSig(sig);
      setPhase('submitted');
      setStatus('Submitted. Confirming…');
      await conn.confirmTransaction(sig, 'confirmed');
      setPhase('success');
      setStatus('Swap successful ✅');
      try {
        window.dispatchEvent(new CustomEvent('swap-complete', { detail: { inputMint, outputMint, amount: amt, signature: sig } }));
      } catch {}
      onSwapped?.();
    } catch (e:any) {
      setPhase('error');
      const raw = typeof e === 'object' ? JSON.stringify(e) : String(e);
      setStatus((e?.message || 'Swap failed') + (raw.length < 160 ? ` (${raw})` : ''));
    }
  };

  const reset = () => {
    setQuote(null);
    setPhase('idle');
    setStatus('');
    setTxSig('');
  };

  useEffect(() => { reset(); }, [outputMint]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60">You swap</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={amountIn}
            onChange={e => {
              let v = e.target.value.replace(/,/g, '.');
              // Allow only digits and single dot
              if (!/^\d*(\.?\d*)?$/.test(v)) return; // reject invalid char
              // Prevent leading zeros like 00 unless decimal
              if (/^0\d+/.test(v)) v = v.replace(/^0+/, '0');
              setAmountIn(v);
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-sm outline-none"
            placeholder={`0.0 (bal ${balance ?? '—'})`}
          />
          <div className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-sm flex items-center font-mono">{inputSymbol}</div>
        </div>
        <label className="text-xs text-white/60 mt-2">For</label>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search list"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
          />
          {!useCustomMint && (
            <select value={outputMint} onChange={e => setOutputMint(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-sm max-h-40 overflow-auto">
              {selectableTokens.map(o => <option key={o.mint} value={o.mint}>{o.symbol || o.name || o.mint.slice(0,4)}</option>)}
            </select>
          )}
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={useCustomMint} onChange={e => { setUseCustomMint(e.target.checked); if(!e.target.checked) setCustomMintError(''); }} />
              Custom SPL Mint
            </label>
          </div>
          {useCustomMint && (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Paste SPL token mint (base58)"
                value={customMint}
                onChange={e => {
                  const v = e.target.value.trim();
                  setCustomMint(v);
                  setCustomMintError('');
                }}
                className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-[11px] outline-none font-mono"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn flex-1"
                  onClick={async () => {
                    if (!customMint) { setCustomMintError('Enter a mint'); return; }
                    // Basic base58 validation & length check
                    try {
                      const { PublicKey } = await import('@solana/web3.js');
                      const pk = new PublicKey(customMint);
                      // Prevent selecting same as input
                      if (pk.toBase58() === inputMint) { setCustomMintError('Cannot swap a token to itself'); return; }
                      // Attempt decimals fetch to ensure it exists
                      setStatus('Validating custom mint…');
                      const dec = await fetchDecimals(pk.toBase58());
                      if (dec < 0 || dec > 18) { setCustomMintError('Unusual decimals – rejected'); return; }
                      setOutputMint(pk.toBase58());
                      setStatus('Custom mint set');
                      setCustomMintError('');
                    } catch (e:any) {
                      setCustomMintError(e?.message?.includes('Invalid public key') ? 'Invalid base58 mint' : (e?.message || 'Invalid mint'));
                    }
                  }}
                >Use Mint</button>
                <button type="button" className="btn flex-1" onClick={() => { setUseCustomMint(false); setCustomMint(''); setCustomMintError(''); }}>Cancel</button>
              </div>
              {customMintError && <div className="text-red-400 text-[10px]">{customMintError}</div>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <label className="text-xs text-white/60">Slippage (bps)</label>
          <input type="number" min={1} max={1000} value={slippageBps} onChange={e => setSlippageBps(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-xs" />
          <label className="flex items-center gap-1 text-[10px] text-white/60 ml-2">
            <input type="checkbox" checked={exactOutMode} onChange={e => setExactOutMode(e.target.checked)} /> Exact-Out (soon)
          </label>
        </div>
      </div>
      {!quote && <button type="button" className="btn" onClick={doQuote} disabled={phase==='quoting'}>{phase==='quoting' ? 'Quoting…' : 'Get Quote'}</button>}
      {quote && phase !== 'success' && (
        <div className="p-2 rounded bg-black/30 border border-white/10 text-[11px] text-white/70 space-y-1">
          <div>Route: {quote?.marketInfos?.length || 1} hop(s)</div>
          <div>Estimated Out: {(quote?.outAmount || 0) / 10 ** 6}</div>
          {minOut && <div>Min Receive (~): {minOut}</div>}
          <div>Price Impact: {((quote?.priceImpactPct || 0) * 100).toFixed(2)}%</div>
          <button type="button" className="text-[10px] underline" onClick={() => setShowRoute(r => !r)}>{showRoute ? 'Hide' : 'Show'} Route Details</button>
          {showRoute && (
            <div className="mt-1 space-y-1 max-h-32 overflow-auto pr-1">
              {(quote?.marketInfos || []).map((m: any, i: number) => (
                <div key={i} className="border border-white/10 rounded p-1">
                  <div className="flex justify-between"><span>AMM</span><span>{m?.ammLabel || m?.label || 'Unknown'}</span></div>
                  <div className="flex justify-between"><span>In</span><span>{m?.inputMint?.slice(0,6)}…</span></div>
                  <div className="flex justify-between"><span>Out</span><span>{m?.outputMint?.slice(0,6)}…</span></div>
                </div>
              ))}
              {!quote?.marketInfos && <div className="text-white/40">No route breakdown available.</div>}
            </div>
          )}
          <div className="flex gap-2 mt-1">
            <button type="button" className="btn flex-1" onClick={doSwap} disabled={phase==='signing'}>{phase==='signing' ? 'Signing…' : 'Swap'}</button>
            <button type="button" className="btn flex-1" onClick={reset}>Reset</button>
          </div>
        </div>
      )}
      {txSig && <div className="text-[10px] text-white/50 break-all">Tx: <a className="underline" target="_blank" rel="noreferrer" href={`https://explorer.solana.com/tx/${txSig}?cluster=mainnet-beta`}>{txSig}</a></div>}
      {status && <div className="text-green-400 text-[11px] whitespace-pre-wrap break-words">{status}</div>}
      {phase==='success' && <button type="button" className="btn" onClick={onClose}>Close</button>}
      {phase!=='success' && <button type="button" className="btn" onClick={onClose}>Cancel</button>}
      {!unlocked && <button type="button" className="btn" onClick={() => setShowUnlock(true)}>Unlock to Swap</button>}
      {showUnlock && (
        <UnlockModal
          onUnlock={async (password) => { await unlock(password); setUnlocked(true); setShowUnlock(false); }}
          onBiometricUnlock={async () => { if (!tryBiometricUnlock) return false; const ok = await tryBiometricUnlock(); if (ok) setUnlocked(true); return ok; }}
          onClose={() => setShowUnlock(false)}
        />
      )}
    </div>
  );
}
