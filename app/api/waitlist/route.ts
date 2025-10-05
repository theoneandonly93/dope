import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { appendFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string = (body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    try {
      const supabase = getSupabase();
      // Upsert for idempotency; if unique index on email exists, this will be safe
      const { error } = await supabase
        .from("card_waitlist")
        .upsert({ email } as any, { onConflict: "email", ignoreDuplicates: true })
        .select()
        .maybeSingle();

      if (error) {
        const msg = String(error.message || "").toLowerCase();
        const isDuplicate = msg.includes("duplicate") || msg.includes("23505");
        const missingTable = msg.includes("does not exist") || msg.includes("relation") || msg.includes("42p01");
        const conflictUnsupported = msg.includes("on conflict");
        if (isDuplicate) {
          return NextResponse.json({ ok: true });
        }
        if (missingTable || conflictUnsupported) {
          // Fall back to file append in dev/edge environments
          await appendFile("/tmp/dope_waitlist.txt", email + "\n").catch(() => {});
          return NextResponse.json({ ok: true, fallback: true });
        }
        // Unexpected DB error
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      // Supabase not configured or runtime issue – fall back to /tmp file
      try { await appendFile("/tmp/dope_waitlist.txt", email + "\n"); } catch {}
      return NextResponse.json({ ok: true, fallback: true });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
