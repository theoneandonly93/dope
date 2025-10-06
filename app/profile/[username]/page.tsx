"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";
import { useWalletOptional } from "../../../components/WalletProvider";
import TrendingTokens from "../../../components/browser/TrendingTokens";

type PublicProfile = {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  followers: number;
  following: number;
  created_at: string;
};
type MiniUser = { wallet_address: string; username?: string | null; avatar_url?: string | null };

export default function PublicProfileByUsername() {
  const { username } = useParams() as { username: string };
  const router = useRouter();
  const w = useWalletOptional();
  const myAddress = w?.address || "";
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState<MiniUser[] | null>(null);
  const isOwner = !!myAddress && profile?.wallet_address === myAddress;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const sb = getSupabase();
        const { data: prof } = await sb.from("public_profiles").select("*").eq("username", username).maybeSingle();
        if (!cancelled) {
          const cast = (prof as unknown as PublicProfile) || null;
          setProfile(cast);
          if (cast) {
            setFollowersCount(typeof cast.followers === 'number' ? cast.followers : 0);
            setFollowingCount(typeof cast.following === 'number' ? cast.following : 0);
          } else {
            setFollowersCount(0);
            setFollowingCount(0);
          }
        }
        if (prof && myAddress) {
          const { data: f } = await sb.from("follows").select("*").eq("follower_wallet", myAddress).eq("following_wallet", (prof as any).wallet_address).maybeSingle();
          if (!cancelled) setIsFollowing(!!f);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [username, myAddress]);

  const joinDate = useMemo(() => profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "", [profile]);

  const toggleFollow = async () => {
    if (!profile || !myAddress) return;
    const sb = getSupabase();
    if (isFollowing) {
      await sb.from("follows").delete().eq("follower_wallet", myAddress).eq("following_wallet", profile.wallet_address);
      setIsFollowing(false);
      setFollowersCount((c)=> Math.max(0, c-1));
      try { await sb.from("public_profiles").update({ followers: (followersCount-1) }).eq("wallet_address", profile.wallet_address); } catch {}
    } else {
      await sb.from("follows").upsert({ follower_wallet: myAddress, following_wallet: profile.wallet_address });
      setIsFollowing(true);
      setFollowersCount((c)=> c+1);
      try { await sb.from("public_profiles").update({ followers: (followersCount+1) }).eq("wallet_address", profile.wallet_address); } catch {}
    }
  };

  const loadFollowers = async () => {
    if (!profile) return;
    setFollowers(null);
    try {
      const sb = getSupabase();
      const { data: rels } = await sb.from("follows").select("follower_wallet").eq("following_wallet", profile.wallet_address);
      const wallets: string[] = Array.isArray(rels) ? rels.map((r: any) => r.follower_wallet).filter(Boolean) : [];
      if (wallets.length === 0) { setFollowers([]); return; }
      // Fetch profile records for followers where available
      const { data: users } = await sb.from("public_profiles").select("wallet_address,username,avatar_url").in("wallet_address", wallets);
      const byAddr = new Map<string, MiniUser>();
      (users || []).forEach((u: any) => byAddr.set(u.wallet_address, { wallet_address: u.wallet_address, username: u.username, avatar_url: u.avatar_url }));
      const merged: MiniUser[] = wallets.map((wa) => byAddr.get(wa) || { wallet_address: wa });
      setFollowers(merged);
    } catch {
      setFollowers([]);
    }
  };

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-white/60">Loading…</div>}
      {!loading && !profile && (
        <div className="space-y-2">
          <div className="text-lg font-semibold">User not found</div>
          <Link href="/" className="underline">Back</Link>
        </div>
      )}
      {profile && (
        <>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username||"dope")}`} alt="avatar" className="w-12 h-12 rounded-full border border-white/10 bg-white/5" />
            <div>
              <div className="text-xl font-semibold">@{profile.username}</div>
              <div className="text-xs text-white/60">Joined {joinDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner ? (
              <Link href="/settings" className="btn btn-sm">Edit Profile</Link>
            ) : (
              <button className="btn btn-sm" onClick={toggleFollow}>{isFollowing ? "Following" : "Follow"}</button>
            )}
            <a href={`https://solscan.io/account/${encodeURIComponent(profile.wallet_address)}?cluster=mainnet`} className="btn btn-sm" target="_blank" rel="noreferrer">Solscan</a>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <button className="underline decoration-white/30 hover:decoration-white" onClick={()=>{ setShowFollowers(true); loadFollowers(); }}>
              <span className="font-semibold">{followersCount}</span> Followers
            </button>
            <div><span className="font-semibold">{followingCount}</span> Following</div>
          </div>

          {showFollowers && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
              <div className="bg-[#111] border border-white/10 w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold">Followers</div>
                  <button className="text-white/70 hover:text-white" onClick={()=>setShowFollowers(false)}>✕</button>
                </div>
                {followers === null && <div className="text-sm text-white/60">Loading…</div>}
                {followers && followers.length === 0 && <div className="text-sm text-white/60">No followers yet.</div>}
                {followers && followers.length > 0 && (
                  <div className="max-h-80 overflow-auto divide-y divide-white/5">
                    {followers.map((u, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(u.username || u.wallet_address)}`} alt="avatar" className="w-8 h-8 rounded-full border border-white/10 bg-white/5" />
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">{u.username ? `@${u.username}` : `${u.wallet_address.slice(0,4)}…${u.wallet_address.slice(-4)}`}</div>
                          <div className="text-[11px] text-white/50 font-mono">{u.wallet_address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="glass rounded-xl p-3 border border-white/10">
            <div className="text-sm text-white/80">Following Tokens</div>
            <div className="mt-2">
              <TrendingTokens onOpenToken={(mint)=> router.push(`/token/${mint}`)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
