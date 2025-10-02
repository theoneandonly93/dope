import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { message, address } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    const entry = {
      message,
      address: address || null,
      time: Date.now()
    };
    const filePath = path.join(process.cwd(), "support-messages.json");
    let messages: any[] = [];
    try {
      messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {}
    messages.unshift(entry);
    fs.writeFileSync(filePath, JSON.stringify(messages.slice(0, 100), null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
