"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { useWallet } from "../../components/WalletProvider";

type Fam = {
  id: string;
  parent_wallet: string;
  child_wallet: string;
  child_username: string;
  relationship?: string | null;
  approved: boolean;
  created_at?: string;
};

export default function FamilyPage() {
  const { address } = useWallet() as any;
  const [rows, setRows] = useState<Fam[]>([]);
  const [childWallet, setChildWallet] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [relationship, setRelationship] = useState("Teen");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!address) return;
    setErr(null);
    const sb = getSupabase();
    const { data, error } = await sb
      .from("family_accounts")
      .select("id,parent_wallet,child_wallet,child_username,relationship,approved,created_at")
      .or(`parent_wallet.eq.${address},child_wallet.eq.${address}`)
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setErr(null);
    try {
      const sb = getSupabase();
      const { error } = await sb.from("family_accounts").insert({
        parent_wallet: address,
        child_wallet: childWallet.trim(),
        child_username: childUsername.trim() || "Teen",
        relationship,
        approved: false,
      });
      if (error) throw error;
      setChildWallet("");
      setChildUsername("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to add child");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Family</div>
        <Link href="/" className="text-sm text-white/60">Home</Link>
      </div>
      <div className="glass rounded-2xl p-5 border border-white/10 mb-4">
        <div className="font-medium mb-3">Add a teen</div>
        <form onSubmit={addChild} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="input input-bordered bg-white/5"
            placeholder="Teen wallet address"
            value={childWallet}
            onChange={(e) => setChildWallet(e.target.value)}
            required
          />
          <input
            className="input input-bordered bg-white/5"
            placeholder="Username (optional)"
            value={childUsername}
            onChange={(e) => setChildUsername(e.target.value)}
          />
          <select className="select select-bordered bg-white/5" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option>Teen</option>
            <option>Child</option>
            <option>Dependent</option>
          </select>
          <button className="btn md:col-span-3" disabled={loading}>
            {loading ? "Adding…" : "Invite / Link"}
          </button>
        </form>
        <p className="text-xs text-white/60 mt-2">They will appear below. You can approve/freeze spending anytime.</p>
        {err && <div className="text-xs text-red-400 mt-2">{err}</div>}
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="font-medium mb-3">Linked accounts</div>
        <div className="divide-y divide-white/10">
          {rows.map((r) => (
            <div className="py-3 flex items-center justify-between" key={r.id}>
              <div>
                <div className="text-sm font-medium">{r.child_username} <span className="text-xs text-white/50">({r.relationship || "Child"})</span></div>
                <div className="text-[11px] text-white/50 font-mono">{r.child_wallet.slice(0,6)}…{r.child_wallet.slice(-6)}</div>
              </div>
              <div className={`text-xs ${r.approved ? "text-green-400" : "text-white/60"}`}>{r.approved ? "Approved" : "Pending"}</div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-sm text-white/60">No linked accounts yet.</div>}
        </div>
      </div>
    </div>
  );
}
