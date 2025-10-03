import React, { useState } from 'react';

interface RedeemVAAProps {
  vaa: string;
  targetChain: string; // e.g. 'eth'
}

// Placeholder EVM redemption stub: in production this would build a provider & send a contract tx
export default function RedeemVAA({ vaa, targetChain }: RedeemVAAProps) {
  const [status, setStatus] = useState<string>('');
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    setStatus('Preparing redemption (stub)…');
    setRedeeming(true);
    try {
      // Future: call backend or directly use ethers + wormhole-sdk redeemOnEth
      await new Promise(r => setTimeout(r, 1200));
      setStatus('Redemption stub complete. Implement chain-specific contract call next.');
    } catch (e:any) {
      setStatus(e?.message || 'Redeem failed');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="mt-3 p-2 border border-white/10 rounded bg-black/30 text-[11px] text-white/70 space-y-2">
      <div className="font-semibold text-white/80">Redeem on {targetChain.toUpperCase()} (Alpha)</div>
      <div className="text-white/50">This is a stub. In a future release this will post the VAA to the token bridge contract.</div>
      <button type="button" className="btn w-full" disabled={redeeming} onClick={handleRedeem}>{redeeming ? 'Redeeming…' : 'Redeem VAA (Stub)'}</button>
      {status && <div className="text-green-400 break-words">{status}</div>}
    </div>
  );
}
