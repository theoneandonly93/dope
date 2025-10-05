"use client";
import React from "react";

type Props = {
  open: boolean;
  mnemonic?: string | null;
  secretBase58: string;
  onClose: () => void;
};

export default function RevealSecretsModal({ open, mnemonic, secretBase58, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg glass rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="text-lg font-semibold">Save Your Recovery Secrets</div>
        <div className="text-xs text-white/60">Write these down and store them safely. Anyone with these can access your funds.</div>
        {mnemonic ? (
          <div>
            <div className="text-xs text-white/60 mb-1">12-word Seed Phrase</div>
            <div className="font-mono text-sm bg-black/30 border border-white/10 rounded p-2 break-words select-all">{mnemonic}</div>
          </div>
        ) : (
          <div className="text-xs text-yellow-400">This wallet was imported from a raw key. No seed phrase is available.</div>
        )}
        <div>
          <div className="text-xs text-white/60 mb-1">Private Key (base58)</div>
          <div className="font-mono text-sm bg-black/30 border border-white/10 rounded p-2 break-words select-all">{secretBase58}</div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn flex-1" onClick={onClose}>I saved these</button>
        </div>
        <div className="text-[10px] text-white/50">Never share these with anyone. We cannot recover them for you.</div>
      </div>
    </div>
  );
}
