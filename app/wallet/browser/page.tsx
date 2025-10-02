"use client";
import React, { useState } from "react";

export default function BrowserPage() {
  const [url, setUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let input = url.trim();
    if (!input.startsWith("http")) input = "https://" + input;
    setIframeUrl(input);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-8 px-4">
      <h1 className="text-xl font-bold mb-4">Dapp Browser</h1>
      <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-black/20 text-white outline-none"
          placeholder="Enter dapp URL (e.g. pump.fun)"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button className="btn" type="submit">Go</button>
      </form>
      {iframeUrl && (
        <div className="w-full max-w-md h-[600px] border border-white/10 rounded-lg overflow-hidden">
          <iframe src={iframeUrl} title="Dapp Browser" className="w-full h-full bg-black" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        </div>
      )}
      <div className="mt-6 text-xs text-white/60 text-center">
        Search and connect to dapps like Phantom browser.<br />
        Wallet connection support coming soon!
      </div>
    </div>
  );
}
