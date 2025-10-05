"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingLogos from "../../../components/FloatingLogos";

export default function WaitlistPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr("");
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: v }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || "failed");
      router.replace("/card/success");
    } catch (e: any) {
      setErr("Could not join right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-160px)] flex flex-col justify-center">
      <FloatingLogos />
      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="text-2xl font-semibold">Enter your email</div>
        <div className="text-white/60">We'll notify you once you have access</div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 outline-none"
          />
          {err && <div className="text-xs text-red-400">{err}</div>}
          <button type="submit" className="btn w-full" disabled={loading}>{loading ? "Joining…" : "Join Waitlist"}</button>
        </form>
      </div>
    </div>
  );
}
