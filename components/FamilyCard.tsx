"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";
import { getSupabase } from "../lib/supabase";

type Fam = {
  id: string;
  parent_wallet: string;
  child_wallet: string;
  child_username: string;
  relationship?: string | null;
  approved: boolean;
  created_at?: string;
};

export default function FamilyCard() {
  const { address } = useWallet() as any;
  const [rows, setRows] = useState<Fam[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isParent = useMemo(() => rows.some((r) => r.parent_wallet === address), [rows, address]);
  const isChild = useMemo(() => rows.some((r) => r.child_wallet === address), [rows, address]);

  async function load() {
    if (!address) return;
    setLoading(true);
    setErr(null);
    try {
      const sb = getSupabase();
      const { data: asParent, error: e1 } = await sb
        .from("family_accounts")
        .select("id,parent_wallet,child_wallet,child_username,relationship,approved,created_at")
        .eq("parent_wallet", address);
      if (e1) throw e1;
      const { data: asChild, error: e2 } = await sb
        .from("family_accounts")
        .select("id,parent_wallet,child_wallet,child_username,relationship,approved,created_at")
        .eq("child_wallet", address);
      if (e2) throw e2;
      setRows([...(asParent || []), ...(asChild || [])]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load family accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function toggleApproved(row: Fam, next: boolean) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("family_accounts").update({ approved: next }).eq("id", row.id);
      if (error) throw error;
      setRows((r) => r.map((x) => (x.id === row.id ? { ...x, approved: next } : x)));
    } catch (e: any) {
      setErr(e?.message || "Failed to update status");
    }
  }

  if (!address) return null;

  return (
    <div className="glass rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#00ffb2]/15 border border-[#00ffb2]/30 flex items-center justify-center">👨‍👩‍👧</div>
          <div className="font-semibold">Family</div>
        </div>
        <Link href="/family" className="text-xs underline text-white/70 hover:text-white">Manage</Link>
      </div>
      {loading && <div className="text-xs text-white/60">Loading…</div>}
      {err && <div className="text-xs text-red-400">{err}</div>}
      {rows.length === 0 && !loading && (
        <div className="text-xs text-white/60">
          Link a teen account with parental oversight.
          <div className="mt-2">
            <Link href="/family" className="btn btn-sm">Set up Family</Link>
          </div>
        </div>
      )}
      {rows.length > 0 && (
        <div className="divide-y divide-white/10">
          {rows.map((r) => (
            <div key={r.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{r.child_username} <span className="text-xs text-white/50">({r.relationship || "Child"})</span></div>
                <div className="text-[11px] text-white/50 font-mono">{r.child_wallet.slice(0,6)}…{r.child_wallet.slice(-6)}</div>
              </div>
              {address === r.parent_wallet ? (
                <button
                  className={`btn btn-xs ${r.approved ? "bg-white/10" : "bg-green-500 text-black"}`}
                  onClick={() => toggleApproved(r, !r.approved)}
                >
                  {r.approved ? "Freeze" : "Approve"}
                </button>
              ) : (
                <div className={`text-xs ${r.approved ? "text-green-400" : "text-white/60"}`}>{r.approved ? "Approved" : "Pending"}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
