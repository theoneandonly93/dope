"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export const LEGAL_VERSION = 'v1.1';
const LS_KEY = `dope_legal_accept_${LEGAL_VERSION}`;

export function hasAcceptedLegal() {
  if (typeof window === 'undefined') return true; // SSR skip
  return !!localStorage.getItem(LS_KEY);
}

export function markAcceptedLegal() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, new Date().toISOString());
}

export default function LegalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      ref.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
        if (e.key === 'Tab') {
          // rudimentary focus trap
          const focusables = ref.current?.querySelectorAll<HTMLElement>(
            'a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
          ) || [];
          const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
          if (!list.length) return;
          const first = list[0];
            const last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.removeEventListener('keydown', onKey);
        prev?.focus();
      };
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    markAcceptedLegal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 shadow-xl text-white overflow-hidden"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-2 right-2 p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          ✕
        </button>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm leading-relaxed">
          <h2 id="legal-modal-title" className="text-lg font-semibold">Privacy & Terms Acknowledgment</h2>
          <div className="text-xs text-white/60">Version {LEGAL_VERSION}. Please review key points below. Closing this dialog logs your acceptance.</div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <strong className="block mb-1">At a Glance</strong>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Non-custodial wallet – we never hold keys or funds.</li>
                <li>No ad tracking, no sale of data, minimal transient metrics.</li>
                <li>Fiat on-ramps (MoonPay etc.) are independent controllers.</li>
                <li>Local encryption: PBKDF2 → AES-GCM. Biometric stays local.</li>
                <li>You accept volatility & on-chain risk; irreversible txs.</li>
              </ul>
            </div>
            <div className="text-xs text-white/70 space-y-2">
              <p>Full documents:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><Link className="underline" href="/privacy" target="_blank">Privacy Policy</Link></li>
                <li><Link className="underline" href="/terms" target="_blank">Terms of Service</Link></li>
                <li><a className="underline" href="/api/legal/pdf" target="_blank" rel="noopener noreferrer">Download Combined PDF</a></li>
              </ul>
            </div>
            <div className="text-[11px] text-white/50">
              By continuing you confirm you have read and accept the Privacy Policy and Terms. You may revoke usage by discontinuing use and clearing local storage (non-custodial design - no server deletion request necessary).
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleClose} className="btn flex-1">Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}
