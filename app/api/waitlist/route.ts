import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string = (body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
  const supabase = getSupabase();
    // Upsert for idempotency; requires a unique constraint on email in Supabase
    const { error } = await supabase
      .from("card_waitlist")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
      .select()
      .maybeSingle();
    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
      // If already exists, treat as success to avoid leaking
      // But only ignore unique violation errors
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
