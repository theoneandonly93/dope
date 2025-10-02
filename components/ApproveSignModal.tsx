import React from "react";

interface ApproveSignModalProps {
  open: boolean;
  message: string;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApproveSignModal({ open, message, onApprove, onReject }: ApproveSignModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="rounded-2xl p-6 w-full max-w-sm border border-white/10 bg-black text-white">
        <h2 className="text-lg font-semibold mb-4">Approve & Sign Transaction</h2>
        <div className="mb-4 text-xs text-white/70 break-all">{message}</div>
        <div className="flex gap-3">
          <button className="btn w-full" onClick={onApprove}>Approve & Sign</button>
          <button className="btn w-full" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
}
