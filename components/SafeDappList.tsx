import React from "react";

const DAPP_LIST = [
  {
    name: "Dopelganga",
    url: "https://dopelganga.com",
    logo: "/logo-192.png"
  },
  {
    name: "Dopelgangachat",
    url: "https://dopelgangachat.com",
    logo: "/logo-192.png"
  },
  {
    name: "Dexsta.fun",
    url: "https://dexsta.fun",
    logo: "/dexta.jpg"
  },
  {
    name: "BasedGunda.com",
    url: "https://basedgunda.com",
    logo: "/gunda.jpg"
  },
  {
    name: "Rugflip.io",
    url: "https://rugflip.io",
    logo: "/rugflip.jpg"
  }
];

export default function SafeDappList({ onSelect }: { onSelect: (url: string) => void }) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/10 mb-6 w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>Safe Dapps</span>
        <span className="text-xs text-white/60">(Recommended)</span>
      </h2>
      <div className="space-y-3">
        {DAPP_LIST.map(dapp => (
          <button
            key={dapp.url}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 hover:bg-white/10 transition"
            onClick={() => onSelect(dapp.url)}
          >
            <img src={dapp.logo} alt={dapp.name} className="w-7 h-7 rounded-full" />
            <span className="font-semibold text-white text-base">{dapp.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
