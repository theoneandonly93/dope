"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicProfilePage() {
  const params = useParams();
  const address = (params?.address as string) || "";
  const short = useMemo(() => address ? `${address.slice(0,4)}…${address.slice(-4)}` : "", [address]);
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    try {
      const u = localStorage.getItem("dope_username");
      const uploaded = localStorage.getItem("dope_profile_avatar_data");
      const custom = localStorage.getItem("dope_profile_avatar_url") || localStorage.getItem("dope_profile_photo");
      const chosen = uploaded && uploaded.length > 0 ? uploaded : (custom || "");
      setUsername(u || "");
      setAvatar(chosen || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(address||"dope")}`);
    } catch {}
  }, [address]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full border border-white/10 bg-white/5" />
        <div>
          <div className="text-xl font-semibold">{username ? `@${username}` : short}</div>
          <div className="font-mono text-xs text-white/60 break-all">{address}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/wallet/receive?for=${encodeURIComponent(address)}`} className="btn">Send To</Link>
        <a href={`https://solscan.io/account/${encodeURIComponent(address)}?cluster=mainnet`} target="_blank" rel="noreferrer" className="btn">View on Solscan</a>
      </div>
      <div className="text-xs text-white/60">
        This is a public profile. Only the address and basic metadata are shown.
      </div>
    </div>
  );
}
