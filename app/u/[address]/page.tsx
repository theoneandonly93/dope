"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";
import { useWalletOptional } from "../../../components/WalletProvider";

export default function PublicProfilePage() {
  const params = useParams();
  const address = (params?.address as string) || "";
  const me = useWalletOptional();
  const myAddress = me?.address || "";
  const short = useMemo(() => address ? `${address.slice(0,4)}…${address.slice(-4)}` : "", [address]);
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const isOwner = myAddress && address && myAddress === address;

  const doShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      if (navigator.share) {
        await navigator.share({ title: `${username ? '@'+username : short} on DopeWallet`, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Profile link copied');
      }
    } catch {}
  };

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

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const { data: prof } = await sb.from('public_profiles').select('*').eq('wallet_address', address).maybeSingle();
        if (prof) {
          setUsername((prof as any).username || username);
          setAvatar((prof as any).avatar_url || avatar);
          setFollowers((prof as any).followers || 0);
          setFollowing((prof as any).following || 0);
        }
        if (myAddress && address && myAddress !== address) {
          const { data: f } = await sb.from('follows').select('*').eq('follower_wallet', myAddress).eq('following_wallet', address).maybeSingle();
          setIsFollowing(!!f);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, myAddress]);

  const toggleFollow = async () => {
    try {
      const sb = getSupabase();
      if (isFollowing) {
        await sb.from('follows').delete().eq('follower_wallet', myAddress).eq('following_wallet', address);
        setIsFollowing(false);
        setFollowers((c)=> Math.max(0, c-1));
        try { await sb.from('public_profiles').update({ followers: followers-1 }).eq('wallet_address', address); } catch {}
      } else {
        await sb.from('follows').upsert({ follower_wallet: myAddress, following_wallet: address });
        setIsFollowing(true);
        setFollowers((c)=> c+1);
        try { await sb.from('public_profiles').update({ followers: followers+1 }).eq('wallet_address', address); } catch {}
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center mt-2">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-emerald-400 blur opacity-70 scale-110" aria-hidden="true"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="avatar" className="relative w-20 h-20 rounded-full border-2 border-white/20 bg-white/5" />
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold">{username ? `@${username}` : short}</div>
          <div className="font-mono text-xs text-white/60 break-all">{address}</div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
          <div><span className="font-semibold">{followers}</span> Followers</div>
          <div><span className="font-semibold">{following}</span> Following</div>
        </div>
        <div className="mt-4 flex gap-2">
          {isOwner ? (
            <>
              <Link href="/settings" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl">Edit Profile</Link>
              <button onClick={doShare} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl">Share Profile</button>
            </>
          ) : (
            <>
              <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl" onClick={toggleFollow}>{isFollowing ? 'Following' : 'Follow'}</button>
              <button onClick={doShare} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl">Share Profile</button>
            </>
          )}
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
