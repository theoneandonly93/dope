import React, { useEffect, useState } from 'react';
import UnlockModal from './UnlockModal';
import { useWallet } from './WalletProvider';
import { getConnection } from '../lib/wallet';
import { getTokenDecimals } from '../lib/tokenMetadataCache';
import { PublicKey } from '@solana/web3.js';

interface SwapModalProps {
  inputMint: string; // initial token mint (from context / token detail)
  inputSymbol: string; // initial symbol or name
  balance: number | null; // initial balance for that mint; may not update when user switches input token
  onClose: () => void;
  onSwapped?: () => void; // callback to refresh balances
  // New optional UX props
  initialAmountIn?: number; // prefill amount (human units)
  autoQuote?: boolean; // if true, automatically fetch quote after mount/prefill
  desiredOutputMint?: string; // lock the output mint to a specific token (e.g. target asset when buying)
  lockOutputMint?: boolean; // if true, user cannot change output mint
  disableInputTokenChange?: boolean; // hide the change token UI
}

// Dynamic token list will be fetched from /tokenlist.json

type Phase = 'idle' | 'quoting' | 'ready' | 'signing' | 'submitted' | 'success' | 'error';

export default function SwapModal({ inputMint, inputSymbol, balance, onClose, onSwapped, initialAmountIn, autoQuote, desiredOutputMint, lockOutputMint, disableInputTokenChange }: SwapModalProps) {
  const { keypair, unlock, tryBiometricUnlock } = useWallet() as any;
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [activeInputMint, setActiveInputMint] = useState<string>(inputMint);
  const [outputMint, setOutputMint] = useState<string>(desiredOutputMint || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // default USDC or locked
  const [filter, setFilter] = useState('');
  const [inputFilter, setInputFilter] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [txSig, setTxSig] = useState('');
  const [slippageBps, setSlippageBps] = useState(50);
  const [showRoute, setShowRoute] = useState(false);
  const [exactOutMode, setExactOutMode] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [onlyDirectRoutes, setOnlyDirectRoutes] = useState(false);
  const [maxAccounts, setMaxAccounts] = useState<number | ''>('');
  const [restrictDexes, setRestrictDexes] = useState('');
  const [preferPumpFun, setPreferPumpFun] = useState(false);
  const platformFeeBps = Number(process.env.NEXT_PUBLIC_JUPITER_PLATFORM_FEE_BPS || 0);
  const feeAccount = process.env.NEXT_PUBLIC_JUPITER_FEE_ACCOUNT as string | undefined;
  const [editInputToken, setEditInputToken] = useState(false);

  useEffect(() => {
    fetch('/tokenlist.json')
      .then(r => r.json())
      .then(list => setTokenList(list))
      .catch(() => setTokenList([]));
  }, []);

  // Prefill amount & optionally auto-quote when props provided
  useEffect(() => {
    if (initialAmountIn && initialAmountIn > 0) {
      setAmountIn(String(initialAmountIn));
      if (autoQuote) {
        // slight defer so token list / state settle
        setTimeout(() => { try { doQuote(); } catch {} }, 50);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAmountIn, autoQuote]);

  // Allow dynamic addition of a custom output mint (user provided) beyond token list
  const [customMint, setCustomMint] = useState<string>('');
  const [customMintError, setCustomMintError] = useState<string>('');
  const [useCustomMint, setUseCustomMint] = useState(false);

  const selectableTokens = tokenList.filter(t => t.mint !== activeInputMint && (!filter || (t.symbol || t.name || '').toLowerCase().includes(filter.toLowerCase())));
  const selectableInputTokens = tokenList.filter(t => t.mint !== outputMint && (!inputFilter || (t.symbol || t.name || '').toLowerCase().includes(inputFilter.toLowerCase())));

  const fetchDecimals = (mint: string) => getTokenDecimals(mint);

  const [minOut, setMinOut] = useState<string>('');
  const [feeApprox, setFeeApprox] = useState<string>('');

  const normalizeMint = (m: string): string => {
    const s = (m || '').trim().toLowerCase();
    if (s === 'sol' || s === 'wsol') return 'So11111111111111111111111111111111111111112';
    if (s === 'btc') return '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'; // renBTC (legacy)
    if (s === 'eth') return '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8'; // soETH (Wormhole)
    return m;
  };

  const isValidMint = (m: string): boolean => {
    const n = normalizeMint(m);
    try { new PublicKey(n); return true; } catch { return false; }
  };

  const doQuote = async () => {
    const amt = Number(amountIn);
    if (!amt || amt <= 0) { setStatus('Enter amount'); return; }
    if (activeInputMint === outputMint) { setStatus('Select different tokens'); return; }
    if (!isValidMint(activeInputMint)) { setStatus('Unsupported input token/mint on Solana'); return; }
    if (!isValidMint(outputMint)) { setStatus('This token is not available on Solana'); return; }
    // Balance check only for initial token (we don't have dynamic balance for arbitrary tokens yet)
    if (activeInputMint === inputMint && balance != null && amt > balance) { setStatus('Amount exceeds balance'); return; }
    setPhase('quoting');
    setStatus('Fetching quote…');
    try {
  const nIn = normalizeMint(activeInputMint);
  const nOut = normalizeMint(outputMint);
  const inDec = await fetchDecimals(nIn);
  const outDec = await fetchDecimals(nOut);
  const scaled = exactOutMode
    ? Math.floor(amt * Math.pow(10, outDec))
    : Math.floor(amt * Math.pow(10, inDec));
  const params = new URLSearchParams({
    in: nIn,
    out: nOut,
    amountAtomic: String(scaled),
    swapMode: exactOutMode ? 'ExactOut' : 'ExactIn',
  });
  if (onlyDirectRoutes) params.set('onlyDirectRoutes', 'true');
  if (maxAccounts !== '' && Number(maxAccounts) > 0) params.set('maxAccounts', String(maxAccounts));
  if (restrictDexes) params.set('restrictDexes', restrictDexes);
  // Prefer Pump.fun pools by hinting DEX restriction when toggled
  if (!restrictDexes && preferPumpFun) params.set('restrictDexes', 'Pump.fun');
  const r = await fetch(`/api/swap/quote?${params.toString()}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'quote failed');
  setQuote(j);
      setPhase('ready');
  // Auto-slippage suggestion: base on price impact when buying small caps
  if (j?.priceImpactPct != null) {
    const imp = Number(j.priceImpactPct) * 100; // percent
    // suggest slippage: clamp between 50 bps and 300 bps; add headroom for exact-out
    const suggested = Math.min(300, Math.max(50, Math.round((imp * 4) + (exactOutMode ? 30 : 0))));
    if (suggested > slippageBps) setSlippageBps(suggested);
  }
  // Estimate min receive or max spend depending on mode
  const outAmtRaw = j?.outAmount || 0;
  const slipFactor = 1 - (slippageBps / 10_000);
  if (!exactOutMode) {
    const min = (outAmtRaw / Math.pow(10, outDec)) * slipFactor;
    setMinOut(min.toLocaleString(undefined, { maximumFractionDigits: 6 }));
  } else {
    // In Exact-Out, show target out and estimated max in after slippage
    const inEstRaw = j?.inAmount || 0;
    const maxIn = (inEstRaw / Math.pow(10, inDec)) / slipFactor;
    setMinOut(`Target out: ${amt.toLocaleString()} | Max spend ≈ ${maxIn.toLocaleString(undefined,{ maximumFractionDigits: 6 })}`);
  }
  // Platform fee estimate (assumes fee taken from output token)
  if (platformFeeBps > 0 && feeAccount && outAmtRaw > 0) {
    const feeOut = (outAmtRaw / Math.pow(10, outDec)) * (platformFeeBps / 10_000);
    setFeeApprox(`${feeOut.toLocaleString(undefined,{ maximumFractionDigits: 6 })} (${platformFeeBps} bps)`);
  } else {
    setFeeApprox('');
  }
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
    if (activeInputMint === outputMint) { setStatus('Select different tokens'); return; }
    setPhase('signing');
    setStatus('Preparing swap transaction…');
    try {
  const nIn = normalizeMint(activeInputMint);
  const nOut = normalizeMint(outputMint);
  const inDec = await fetchDecimals(nIn);
  const outDec = await fetchDecimals(nOut);
  const atomic = exactOutMode
    ? Math.floor(amt * Math.pow(10, outDec))
    : Math.floor(amt * Math.pow(10, inDec));
  const body: any = {
    inputMint: nIn,
    outputMint: nOut,
    amountAtomic: atomic,
    slippageBps,
    userPublicKey: keypair.publicKey.toString(),
    swapMode: exactOutMode ? 'ExactOut' : 'ExactIn',
  };
  if (onlyDirectRoutes) body.onlyDirectRoutes = true;
  if (maxAccounts !== '' && Number(maxAccounts) > 0) body.maxAccounts = Number(maxAccounts);
  if (restrictDexes) body.restrictDexes = restrictDexes;
  if (platformFeeBps > 0 && feeAccount) { body.platformFeeBps = platformFeeBps; body.feeAccount = feeAccount; }
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
        window.dispatchEvent(new CustomEvent('swap-complete', { detail: { inputMint: activeInputMint, outputMint, amount: amt, signature: sig } }));
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

  useEffect(() => { reset(); }, [outputMint, activeInputMint]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/60 flex items-center justify-between">
          <span>You swap</span>
          {!disableInputTokenChange && (
            <button type="button" className="text-[10px] underline text-white/50 hover:text-white" onClick={()=>setEditInputToken(e=>!e)}>{editInputToken ? 'Done' : 'Change Token'}</button>
          )}
        </label>
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 min-w-[55%]">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={amountIn}
              onChange={e => {
                let v = e.target.value.replace(/,/g, '.');
                if (!/^\d*(\.\d*)?$/.test(v)) return;
                if (/^0\d+/.test(v)) v = v.replace(/^0+/, '0');
                setAmountIn(v);
              }}
              className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-sm outline-none"
              placeholder={`0.0${activeInputMint===inputMint && balance!=null ? ' (bal '+balance+')' : ''}`}
            />
          </div>
          {!editInputToken && (
            <div className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-xs flex items-center font-mono max-w-[40%] break-all" title={activeInputMint}>
              {tokenList.find(t=>t.mint===activeInputMint)?.symbol || tokenList.find(t=>t.mint===activeInputMint)?.name || activeInputMint.slice(0,6)+'…'}
            </div>
          )}
        </div>
        {editInputToken && !disableInputTokenChange && (
          <div className="mt-2 p-2 rounded-lg border border-white/10 bg-black/20 space-y-2">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Search input token"
                value={inputFilter}
                onChange={e=>setInputFilter(e.target.value)}
                className="px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none"
              />
              <div className="max-h-32 overflow-auto rounded border border-white/5">
                <ul className="text-[11px]">
                  {selectableInputTokens.slice(0,80).map(t => (
                    <li key={t.mint}>
                      <button
                        type="button"
                        className={`w-full text-left px-2 py-1 hover:bg-white/10 ${t.mint===activeInputMint?'bg-white/5':''}`}
                        onClick={() => setActiveInputMint(t.mint)}
                      >{t.symbol || t.name || t.mint.slice(0,6)} – {t.mint.slice(0,8)}…</button>
                    </li>
                  ))}
                  {selectableInputTokens.length===0 && <li className="px-2 py-1 text-white/40">No matches</li>}
                </ul>
              </div>
              <CustomMintSelector
                label="Custom Input Mint"
                onSelect={(mint)=>{ setActiveInputMint(mint); setEditInputToken(false); }}
                existingMint={activeInputMint}
                avoidMint={outputMint}
              />
            </div>
          </div>
        )}
        <label className="text-xs text-white/60 mt-2">For</label>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search list"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
          />
          {!useCustomMint && !lockOutputMint && (
            <select value={outputMint} onChange={e => setOutputMint(e.target.value)} className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-sm max-h-40 overflow-auto">
              {selectableTokens.map(o => <option key={o.mint} value={o.mint}>{o.symbol || o.name || o.mint.slice(0,4)}</option>)}
            </select>
          )}
          {lockOutputMint && (
            <div className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-xs flex items-center font-mono" title={outputMint}>
              {tokenList.find(t=>t.mint===outputMint)?.symbol || tokenList.find(t=>t.mint===outputMint)?.name || outputMint.slice(0,6)+'…'} (locked)
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            {!lockOutputMint && (
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={useCustomMint} onChange={e => { setUseCustomMint(e.target.checked); if(!e.target.checked) setCustomMintError(''); }} />
                Custom SPL Mint
              </label>
            )}
          </div>
          {useCustomMint && !lockOutputMint && (
            <CustomMintInline
              currentInputMint={activeInputMint}
              avoidMint={activeInputMint}
              onSet={(mint)=>{ setOutputMint(mint); setUseCustomMint(false); setCustomMint(''); setCustomMintError(''); setStatus('Custom output mint set'); }}
              fetchDecimals={fetchDecimals}
              setStatus={setStatus}
            />
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <label className="text-xs text-white/60">Slippage (bps)</label>
          <input type="number" min={1} max={1000} value={slippageBps} onChange={e => setSlippageBps(Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-xs" />
          <label className="flex items-center gap-1 text-[10px] text-white/60 ml-2">
            <input type="checkbox" checked={exactOutMode} onChange={e => setExactOutMode(e.target.checked)} /> Exact-Out
          </label>
          <button type="button" className="text-[10px] underline ml-auto" onClick={()=>setAdvancedOpen(v=>!v)}>{advancedOpen ? 'Hide' : 'Advanced'}</button>
        </div>
        {advancedOpen && (
          <div className="mt-2 p-2 rounded border border-white/10 bg-black/20 space-y-2 text-[11px]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyDirectRoutes} onChange={e=>setOnlyDirectRoutes(e.target.checked)} /> Only direct routes
            </label>
            <div className="flex items-center gap-2">
              <span>Max accounts</span>
              <input type="number" min={1} value={maxAccounts} onChange={e=>setMaxAccounts(e.target.value===''? '' : Number(e.target.value))} className="w-24 px-2 py-1 rounded bg-black/40 border border-white/10 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span>Restrict DEXes</span>
              <input type="text" placeholder="e.g. Orca,Raydium" value={restrictDexes} onChange={e=>setRestrictDexes(e.target.value)} className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-white" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={preferPumpFun} onChange={e=>setPreferPumpFun(e.target.checked)} /> Prefer Pump.fun pools
            </label>
            {(platformFeeBps > 0 && feeAccount) && (
              <div className="text-white/60">Platform fee: {platformFeeBps} bps → fee account {feeAccount.slice(0,4)}…</div>
            )}
          </div>
        )}
      </div>
      {!quote && <button type="button" className="btn" onClick={doQuote} disabled={phase==='quoting'}>{phase==='quoting' ? 'Quoting…' : 'Get Quote'}</button>}
      {quote && phase !== 'success' && (
        <div className="p-2 rounded bg-black/30 border border-white/10 text-[11px] text-white/70 space-y-1">
          <div>Route: {quote?.marketInfos?.length || 1} hop(s)</div>
          <div>{exactOutMode ? 'Estimated In' : 'Estimated Out'}: {(() => {
            const raw = exactOutMode ? (quote?.inAmount || 0) : (quote?.outAmount || 0);
            const decs = exactOutMode ? undefined : 6; // display friendly default; precise shown in minOut line
            const val = raw / 10 ** (decs || 6);
            return val;
          })()}</div>
          {minOut && <div>Min Receive (~): {minOut}</div>}
          <div>Price Impact: {((quote?.priceImpactPct || 0) * 100).toFixed(2)}%</div>
          {(platformFeeBps > 0 && feeAccount && feeApprox) && (
            <div>Platform Fee (est.): {feeApprox}</div>
          )}
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

// Inline component for adding a custom output mint
function CustomMintInline({ currentInputMint, avoidMint, onSet, fetchDecimals, setStatus }: any) {
  const [mint, setMint] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        placeholder="Paste SPL mint (base58)"
        value={mint}
        onChange={e=>{ setMint(e.target.value.trim()); setErr(''); }}
        className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-[11px] outline-none font-mono"
      />
      <div className="flex gap-2">
        <button type="button" className="btn flex-1" onClick={async ()=>{
          if (!mint) { setErr('Enter a mint'); return; }
          try {
            const { PublicKey } = await import('@solana/web3.js');
            const pk = new PublicKey(mint);
            const base58 = pk.toBase58();
            if (base58 === currentInputMint) { setErr('Cannot use same as input'); return; }
            if (base58 === avoidMint) { setErr('Mint already selected'); return; }
            setStatus('Validating custom mint…');
            const dec = await fetchDecimals(base58);
            if (dec < 0 || dec > 18) { setErr('Unusual decimals'); return; }
            onSet(base58);
            setStatus('Custom mint set');
          } catch(e:any){ setErr(e?.message?.includes('Invalid public key') ? 'Invalid base58 mint' : (e?.message || 'Invalid mint')); }
        }}>Use Mint</button>
        <button type="button" className="btn flex-1" onClick={()=>{ onSet(avoidMint); }}>Cancel</button>
      </div>
      {err && <div className="text-red-400 text-[10px]">{err}</div>}
    </div>
  );
}

// Reusable selector for custom input token
function CustomMintSelector({ label, onSelect, existingMint, avoidMint }: any) {
  const [show, setShow] = useState(false);
  const [mint, setMint] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="mt-2">
      {!show && <button type="button" className="text-[10px] underline text-white/50 hover:text-white" onClick={()=>setShow(true)}>Use {label}</button>}
      {show && (
        <div className="p-2 rounded border border-white/10 bg-black/30 space-y-1">
          <div className="text-[10px] text-white/60">{label}</div>
          <input
            type="text"
            value={mint}
            onChange={e=>{ setMint(e.target.value.trim()); setErr(''); }}
            placeholder="Base58 mint"
            className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-[11px] outline-none font-mono"
          />
          <div className="flex gap-2">
            <button type="button" className="btn flex-1" onClick={async ()=>{
              if (!mint) { setErr('Enter mint'); return; }
              try {
                const { PublicKey } = await import('@solana/web3.js');
                const pk = new PublicKey(mint);
                const base58 = pk.toBase58();
                if (base58 === existingMint) { setErr('Already selected'); return; }
                if (base58 === avoidMint) { setErr('Same as output'); return; }
                onSelect(base58);
                setShow(false);
              } catch(e:any) { setErr(e?.message?.includes('Invalid public key') ? 'Invalid base58' : (e?.message || 'Invalid')); }
            }}>Set</button>
            <button type="button" className="btn flex-1" onClick={()=>{ setShow(false); setMint(''); setErr(''); }}>Cancel</button>
          </div>
          {err && <div className="text-red-400 text-[10px]">{err}</div>}
        </div>
      )}
    </div>
  );
}
