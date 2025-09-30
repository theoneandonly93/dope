"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ background: "#0b0c10", color: "#fff", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <div style={{ maxWidth: 560, margin: "20vh auto 0", padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
          <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 16 }}>{error.message || "Unhandled error"}</div>
          <button onClick={() => reset()} style={{ padding: "10px 14px", borderRadius: 9999, background: "#fff", color: "#000" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}

