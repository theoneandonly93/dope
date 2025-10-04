"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from './WalletProvider';
import UnlockModal from './UnlockModal';
import { getConnection, getSolBalance } from '../lib/wallet';
import { getTokenDecimals } from '../lib/tokenMetadataCache';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';

type Props = {
  defaultFromMint?: string;
  defaultToMint?: string;
  onSwapped?: () => void;
};

const WSOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

function normalizeMint(m: string): string {
  const s = (m || '').trim().toLowerCase();
  if (s === 'sol' || s === 'wsol') return WSOL;
  if (s === 'btc') return '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E';
  if (s === 'eth') return '7vfCXTUXx5WJVxrzS2KHGfJo3AmoQ39kuixZ7Z6w7R8';
  return m;
}

function isValidMint(mint: string) {
  try { new PublicKey(mint); return true; } catch { return false; }
}

export default function SimpleSwap({ defaultFromMint = WSOL, defaultToMint = USDC, onSwapped }: Props) {
  const { keypair, unlocked, unlock, tryBiometricUnlock, address } = useWallet() as any;
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [fromMint, setFromMint] = useState<string>(defaultFromMint);
  const [toMint, setToMint] = useState<string>(defaultToMint);
  const [amount, setAmount] = useState<string>('');
  const [fromDec, setFromDec] = useState<number>(9);
  const [toDec, setToDec] = useState<number>(6);
  const [quote, setQuote] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);
  const [showUnlock, setShowUnlock] = useState<boolean>(false);
  const [solBal, setSolBal] = useState<number | null>(null);

  // Load token list
  useEffect(() => {
    fetch('/tokenlist.json').then(r => r.json()).then(setTokenList).catch(()=>setTokenList([]));
  }, []);

  // Resolve decimals on mint change
  useEffect(() => { getTokenDecimals(fromMint).then(setFromDec).catch(()=>setFromDec(9)); }, [fromMint]);
  useEffect(() => { getTokenDecimals(toMint).then(setToDec).catch(()=>setToDec(9)); }, [toMint]);

  // Pull SOL balance for MAX helper
  useEffect(() => {
    let stop = false;
    (async () => {
      if (!address) { setSolBal(null); return; }
      try { const v = await getSolBalance(address); if (!stop) setSolBal(v); } catch { setSolBal(null); }
    })();
    return () => { stop = true; };
  }, [address]);

  const canSwap = !!keypair && !!unlocked;
  const amountAtomic = useMemo(() => {
    const n = Number(amount);
    if (!(n > 0)) return 0;
    return Math.floor(n * Math.pow(10, fromDec || 9));
  }, [amount, fromDec]);

  const doQuote = async () => {
    setStatus(''); setQuote(null);
    const nFrom = normalizeMint(fromMint); const nTo = normalizeMint(toMint);
    if (!isValidMint(nFrom) || !isValidMint(nTo)) { setStatus('Enter valid token mints'); return; }
    if (nFrom === nTo) { setStatus('Choose different tokens'); return; }
    if (!(amountAtomic > 0)) { setStatus('Enter amount'); return; }
    setLoading(true);
    try {
      const qs = new URLSearchParams({ in: nFrom, out: nTo, amountAtomic: String(amountAtomic), swapMode: 'ExactIn' });
      const r = await fetch(`/api/swap/quote?${qs.toString()}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Quote failed');
      setQuote(j);
      setStatus('Quote ready');
    } catch (e:any) {
      setStatus(e?.message || 'Quote failed');
    } finally { setLoading(false); }
  };

  // Auto-quote with debounce like Phantom
  useEffect(() => {
    if (!amount) { setQuote(null); return; }
    const t = setTimeout(doQuote, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromMint, toMint, fromDec]);

  const executeSwap = async () => {
    if (!canSwap) { setShowUnlock(true); return; }
    setSigning(true); setStatus('Preparing swap…');
    try {
      const body: any = {
        inputMint: normalizeMint(fromMint),
        outputMint: normalizeMint(toMint),
        amountAtomic,
        slippageBps: 50,
        userPublicKey: keypair.publicKey.toString(),
        swapMode: 'ExactIn',
      };
      const r = await fetch('/api/swap/prepare', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Prepare failed');
      const b64 = j?.swapTransaction as string;
      if (!b64) throw new Error('No transaction');
      const raw = Buffer.from(b64, 'base64');
      const tx = VersionedTransaction.deserialize(raw);
      tx.sign([keypair]);
      const conn = getConnection();
      const sig = await conn.sendRawTransaction(tx.serialize());
      await conn.confirmTransaction(sig, 'confirmed');
      setStatus('Swap successful');
      onSwapped?.();
    } catch (e:any) {
      setStatus(e?.message || 'Swap failed');
    } finally { setSigning(false); }
  };

  const switchTokens = () => {
    const a = fromMint; setFromMint(toMint); setToMint(a); setQuote(null); setStatus('');
  };

  const outUi = useMemo(() => {
    if (!quote) return '';
    const rawOut = quote?.outAmount || 0;
    return (rawOut / Math.pow(10, toDec || 6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [quote, toDec]);

  const displayForMint = (mint: string) => tokenList.find(t => t.mint === mint)?.symbol || tokenList.find(t => t.mint === mint)?.name || (mint?.slice(0, 6) + '…');

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-3 border border-white/10 space-y-3">
        <div className="text-xs text-white/70">You pay</div>
        <div className="flex items-center gap-2">
          <input
            value={amount}
            onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*?)\..*/,'$1'))}
            placeholder="0.0"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm"
          />
          <TokenSelector mint={fromMint} setMint={setFromMint} tokenList={tokenList} avoidMint={toMint} />
        </div>
        {normalizeMint(fromMint) === WSOL && solBal !== null && (
          <div className="text-[10px] text-white/50">Balance: {solBal.toLocaleString(undefined,{ maximumFractionDigits: 6 })} SOL <button className="underline ml-2" onClick={()=>{ if (solBal!==null) setAmount(String(Math.max(0, solBal - 0.001).toFixed(4))); }}>MAX</button></div>
        )}
        <div className="flex justify-center"><button className="text-[10px] underline text-white/60" onClick={switchTokens}>Swap direction ⇅</button></div>

        <div className="text-xs text-white/70">You receive</div>
        <div className="flex items-center gap-2">
          <input value={outUi} readOnly className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm text-white/70" />
          <TokenSelector mint={toMint} setMint={setToMint} tokenList={tokenList} avoidMint={fromMint} />
        </div>
        {quote && (
          <div className="text-[11px] text-white/60">
            Price impact: {quote.priceImpactPct ? (quote.priceImpactPct*100).toFixed(2) : '—'}% • Route hops: {quote.marketInfos?.length || 1}
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn flex-1" disabled={loading || !amountAtomic} onClick={doQuote}>{loading ? 'Quoting…' : 'Get Quote'}</button>
          <button className="btn flex-1" disabled={signing || !amountAtomic} onClick={executeSwap}>{signing ? 'Swapping…' : (canSwap ? 'Swap' : 'Unlock to Swap')}</button>
        </div>
        {status && <div className="text-[11px] text-green-400 break-words">{status}</div>}
      </div>

      {showUnlock && (
        <UnlockModal
          onUnlock={async (pw) => { await unlock(pw); setShowUnlock(false); }}
          onBiometricUnlock={async () => { if (!tryBiometricUnlock) return false; const ok = await tryBiometricUnlock(); if (ok) setShowUnlock(false); return ok; }}
          onClose={()=>setShowUnlock(false)}
        />
      )}
    </div>
  );
}

function TokenSelector({ mint, setMint, tokenList, avoidMint }: { mint: string; setMint: (m: string)=>void; tokenList: any[]; avoidMint: string }) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('');
  const [custom, setCustom] = useState('');
  const items = useMemo(() => tokenList.filter(t => t.mint !== avoidMint && (!filter || (t.symbol||t.name||'').toLowerCase().includes(filter.toLowerCase()))).slice(0, 100), [tokenList, filter, avoidMint]);
  const label = tokenList.find(t => t.mint === mint)?.symbol || tokenList.find(t => t.mint === mint)?.name || (mint?.slice(0, 6) + '…');
  return (
    <div className="relative">
      <button type="button" className="px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-white text-xs" onClick={()=>setShow(s=>!s)}>{label}</button>
      {show && (
        <div className="absolute right-0 z-20 mt-1 w-64 bg-black/90 border border-white/10 rounded-lg p-2 space-y-2">
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search" className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-[11px]" />
          <div className="max-h-40 overflow-auto">
            {items.map((t:any) => (
              <button key={t.mint} className={`w-full text-left text-[11px] px-2 py-1 hover:bg-white/10 ${t.mint===mint?'bg-white/5':''}`} onClick={()=>{ setMint(t.mint); setShow(false); }}>{t.symbol || t.name} • {t.mint.slice(0,6)}…</button>
            ))}
            {items.length===0 && <div className="text-[11px] text-white/40 px-2 py-1">No matches</div>}
          </div>
          <div className="text-[10px] text-white/60">Custom mint</div>
          <div className="flex gap-2">
            <input value={custom} onChange={e=>setCustom(e.target.value.trim())} placeholder="Base58 mint" className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 text-white text-[11px] font-mono" />
            <button className="btn btn-xs" onClick={()=>{
              try { const pk = new PublicKey(custom); const b58 = pk.toBase58(); if (b58===avoidMint) return; setMint(b58); setShow(false); setFilter(''); setCustom(''); } catch {}
            }}>Use</button>
          </div>
        </div>
      )}
    </div>
  );
}
