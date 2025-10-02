import React, { useEffect, useState } from "react";

export default function NftList({ address }: { address?: string }) {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`https://api.helius.xyz/v0/addresses/${address}/nfts?api-key=helius-demo`)
      .then(res => res.json())
      .then(data => {
        // Ensure data is always an array
        if (Array.isArray(data)) setNfts(data);
        else if (data && Array.isArray(data.nfts)) setNfts(data.nfts);
        else setNfts([]);
      })
      .catch(() => setNfts([]))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return <div className="text-white/60 text-sm">No address provided.</div>;

  return (
    <div className="space-y-2">
      {loading && <div className="text-white/60 text-sm">Loading NFTs...</div>}
      {!loading && nfts.length === 0 && <div className="text-white/60 text-sm">No NFTs found.</div>}
      <div className="grid grid-cols-2 gap-3">
        {nfts.map(nft => (
          <div key={nft.mint} className="rounded-xl bg-black/30 p-2 flex flex-col items-center">
            <img src={nft.content?.links?.image || "/logo-192.png"} alt={nft.content?.metadata?.name || "NFT"} className="w-20 h-20 rounded-lg mb-2 object-cover" />
            <div className="text-xs font-semibold text-white/80 text-center truncate w-full">{nft.content?.metadata?.name || nft.mint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
