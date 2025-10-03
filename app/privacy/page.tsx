"use client";
import React from 'react';
import Link from 'next/link';

const sections = [
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'scope', title: '1. Scope & Philosophy' },
  { id: 'data-min', title: '2. Data We Avoid Collecting' },
  { id: 'technical', title: '3. Minimal Technical Data' },
  { id: 'third-party', title: '4. Third-Party Integrations' },
  { id: 'local', title: '5. Local Storage & Encryption' },
  { id: 'security', title: '6. Security Measures' },
  { id: 'children', title: '7. Children' },
  { id: 'rights', title: '8. Your Rights' },
  { id: 'state', title: '9. U.S. State / CA Notice' },
  { id: 'complaints', title: '10. Complaints' },
  { id: 'changes', title: '11. Changes' },
  { id: 'contact', title: '12. Contact' }
];

export default function PrivacyPage() {
  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4">
      <div className="pt-4">
    <h1 className="text-2xl font-bold">Dopelganga Wallet – Privacy Policy</h1>
  <div className="text-white/60 text-sm mt-1">Effective Date: <span className="font-mono">10/3/2025</span> · Version: <span className="font-mono">v1.1</span></div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <a href="/api/legal/pdf" className="btn text-xs" target="_blank" rel="noopener noreferrer">Download Combined PDF</a>
          <Link href="/terms" className="text-xs underline text-white/70 hover:text-white">View Terms of Service</Link>
        </div>
      </div>
      <div className="glass border border-white/10 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Quick Jump</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition border border-white/10">{s.title}</a>
          ))}
        </div>
      </div>
      <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-10">
        <section id="privacy">
          <h2>Privacy Policy</h2>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <strong>At a Glance:</strong>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Non-custodial wallet – keys & funds never touch our servers.</li>
              <li>No central user accounts, no ad trackers, no sale of data.</li>
              <li>Minimal transient technical metrics only (performance & abuse defense).</li>
              <li>Fiat on-ramp providers (e.g. MoonPay) are independent data controllers.</li>
              <li>Local encryption uses WebCrypto AES-GCM + PBKDF2; biometric stays local.</li>
              <li>You can clear your data anytime; we designed for data minimization.</li>
              <li>Jurisdiction: Virginia, USA. Contact: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a></li>
            </ul>
            <div className="mt-2 text-[10px] opacity-70">See full sections below for detail. Need Terms? <Link href="/terms" className="underline">View Terms of Service</Link>.</div>
          </div>
          <p className="mt-6">This Privacy Policy explains how Dopelganga Wallet ("we", "our", "us") handles information when you use the Services. We purposely avoid collection of directly identifying personal data. We do <strong>not</strong> collect or store private keys, seed phrases, or on‑chain balances server-side.</p>
        </section>

        <section id="scope">
          <h2>1. Scope & Philosophy</h2>
          <p>Applies to the public interface, embedded wallet UI, and supporting API routes. Design principle: minimize server knowledge of user activity while still providing performance, safety, and reliability.</p>
        </section>

        <section id="data-min">
          <h2>2. Data We Avoid Collecting</h2>
          <ul>
            <li>No seed phrases / private keys (never transmitted).</li>
            <li>No government IDs, selfies, payment cards (handled by on‑ramp providers).</li>
            <li>No behavioral ad tracking / cross-site cookies.</li>
            <li>No centralized login identifier.</li>
          </ul>
        </section>

        <section id="technical">
          <h2>3. Minimal Technical Data</h2>
          <p>Ephemeral or aggregated metrics only, used for operations, abuse prevention, latency optimization, and swap / RPC health routing.</p>
          <h3 className="mt-4 font-semibold">3.1 Categories</h3>
          <ul>
            <li>Latency & error counters (anonymized).</li>
            <li>Rate-limit & abuse signals (hashed IP or derived fingerprint, short TTL).</li>
            <li>Optional fiat on‑ramp status callbacks (success/fail, reference ID).</li>
            <li>Local UI preferences (mode, layout) stored only client side.</li>
          </ul>
          <h3 className="mt-4 font-semibold">3.2 Purposes</h3>
          <ul>
            <li>Service reliability & routing.</li>
            <li>Security / abuse mitigation.</li>
            <li>Feature optimization & debugging.</li>
          </ul>
          <h3 className="mt-4 font-semibold">3.3 Legal Bases</h3>
          <p>Legitimate interests (security, operation) and implied consent by use. For incidental EEA/UK access: Legitimate Interests, Contract, Legal Obligation (if responding to lawful request). We avoid storing directly identifying data.</p>
          <h3 className="mt-4 font-semibold">3.4 Retention</h3>
          <ul>
            <li>Runtime logs ≤ 30 days (rotation).</li>
            <li>Security signals ≤ 90 days (unless active investigation).</li>
            <li>Local encrypted wallet material: persists until user clears browser storage.</li>
            <li>No KYC retention (delegated to providers).</li>
          </ul>
          <h3 className="mt-4 font-semibold">3.5 International Transfer</h3>
          <p>Edge/CDN routing may traverse multiple regions (incl. US). Minimal technical data plus absence of direct personal identifiers reduces transfer risk profile.</p>
        </section>

        <section id="third-party">
          <h2>4. Third-Party Integrations</h2>
          <h3 className="mt-4 font-semibold">4.1 Fiat On‑Ramps (MoonPay etc.)</h3>
          <p>Independent regulated controllers for KYC/AML data. We only receive high-level status (approved/failed, transaction reference). No identity artifacts stored by us.</p>
          <h3 className="mt-4 font-semibold">4.2 Sub‑Processors</h3>
          <p>Infrastructure / security vendors may transiently process operational metadata under confidentiality + DPAs. List available via request: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a>.</p>
        </section>

        <section id="local">
          <h2>5. Local Storage & Encryption</h2>
          <p>Wallet secret material encrypted with password-derived key (PBKDF2 -&gt; AES-GCM). Decryption only occurs locally. Biometric unlock never transmits biometric templates.</p>
        </section>

        <section id="security">
          <h2>6. Security Measures</h2>
          <ul>
            <li>Least-privilege architecture, dependency auditing.</li>
            <li>HTTPS transport; no plaintext secrets over network.</li>
            <li>Abuse throttling and anomaly detection.</li>
            <li>Continuous patching & vulnerability monitoring.</li>
            <li>Design-time threat modeling for swap/bridge flows.</li>
          </ul>
        </section>

        <section id="children">
          <h2>7. Children</h2>
          <p>Not directed to children under 13 (or higher local threshold). We do not knowingly collect information from minors.</p>
        </section>

        <section id="rights">
          <h2>8. Your Rights</h2>
          <p>Because we avoid persistent personal data, requests may result in confirmation that no directly identifying records are held. You may still request: access, deletion, restriction, portability, or objection. We will respond consistent with applicable law.</p>
        </section>

        <section id="state">
          <h2>9. U.S. State / California Notice</h2>
          <p>No sale or sharing of personal information as defined under California law. No profiling decisions. If you believe data exists relating to you, contact us and we will review.</p>
        </section>

        <section id="complaints">
          <h2>10. Complaints</h2>
          <p>Email concerns to <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a>. If unresolved and your jurisdiction provides a supervisory authority mechanism, you may escalate—but please give us an opportunity to address first.</p>
        </section>

        <section id="changes">
          <h2>11. Changes</h2>
          <p>Material updates will be posted here with a new effective date. Continued use indicates acceptance.</p>
        </section>

        <section id="contact">
          <h2>12. Contact</h2>
          <p>Questions: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a>. For Terms of Service see <Link href="/terms" className="underline">/terms</Link>.</p>
        </section>

        <section className="border-t border-white/10 pt-6">
          <h2>Separation Notice</h2>
          <p>The Terms of Service previously bundled with this page are now maintained separately for clarity and easier regulatory review. Download the combined PDF if you require a unified document.</p>
        </section>
      </div>
  <div className="text-xs text-white/40">Last updated: <span className="font-mono">10/3/2025</span> · Version v1.1 · Jurisdiction: Virginia, USA</div>
    </div>
  );
}
