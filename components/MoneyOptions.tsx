"use client";
import Link from "next/link";

export default function MoneyOptions() {
  const items = [
    { key: "cash-deposit", label: "Deposit Paper Money", href: "/wallet/card/topup?tab=fiat", icon: "💵" },
    { key: "check", label: "Deposit a Check", href: "/wallet/card/topup?tab=fiat", icon: "📄" },
    { key: "auto-reload", label: "Auto Reload", href: "/settings", icon: "🔁" },
    { key: "direct-deposit", label: "Direct Deposit", href: "/settings", icon: "🏦" },
    { key: "wire", label: "Wire Transfer", href: "/settings", icon: "📨" },
  ];

  return (
    <div className="glass rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">💳</div>
          <div className="font-semibold">Money options</div>
        </div>
      </div>
      <ul className="divide-y divide-white/10">
        {items.map((it) => (
          <li key={it.key} className="py-3">
            <Link href={it.href} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="text-lg">{it.icon}</span>
                </div>
                <span className="text-sm">{it.label}</span>
              </div>
              <span className="text-white/40">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
