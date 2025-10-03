"use client";
import React from 'react';

const sections = [
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'eligibility', title: '1. Eligibility' },
  { id: 'services', title: '2. Services Provided' },
  { id: 'risks', title: '3. Risks of Using Blockchain Services' },
  { id: 'responsibilities', title: '4. User Responsibilities' },
  { id: 'prohibited', title: '5. Prohibited Activities' },
  { id: 'thirdparty', title: '6. Third-Party Services' },
  { id: 'ip', title: '7. Intellectual Property' },
  { id: 'disclaimers', title: '8. Disclaimers' },
  { id: 'liability', title: '9. Limitation of Liability' },
  { id: 'indemnification', title: '10. Indemnification' },
  { id: 'termination', title: '11. Termination' },
  { id: 'law', title: '12. Governing Law' },
  { id: 'changes', title: '13. Changes to Terms' },
  { id: 'contact', title: '14. Contact' }
];

export default function PrivacyTermsPage() {
  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold">Dopelganga Wallet – Privacy Policy & Terms</h1>
  <div className="text-white/60 text-sm mt-1">Effective Date: <span className="font-mono">10/3/2025 1:13 PM</span></div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <a href="/api/legal/pdf" className="btn text-xs" target="_blank" rel="noopener noreferrer">Download PDF</a>
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
      <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-8">
        <section id="privacy">
          <h2>Privacy Policy</h2>
          <p>This Privacy Policy explains how Dopelganga Wallet ("we", "our", "us") handles information when you use the Services. We design Dopelganga as a privacy-forward, non-custodial wallet. We do <strong>not</strong> collect or store your private keys, seed phrases, or on-chain funds.</p>
          <h3>1. Data We (Typically) Do Not Collect</h3>
          <ul>
            <li>No seed phrases or private keys (they never leave your device encrypted state).</li>
            <li>No custodial access to funds or transaction approvals.</li>
            <li>No centralized user account or mandatory registration.</li>
          </ul>
          <h3>2. Minimal Technical Data</h3>
          <p>We may temporarily process minimal technical metadata (e.g., anonymized performance metrics, RPC latency, error logs) to improve reliability. This data is either ephemeral or aggregated and not tied to a natural person.</p>
          <h3>3. Third-Party Integrations</h3>
          <ul>
            <li>Fiat on-ramps (MoonPay, Ramp, Transak) may collect KYC information directly from you under their own policies.</li>
            <li>Analytics (if enabled) would be privacy-preserving or self-hosted; you will see an explicit disclosure if implemented.</li>
          </ul>
          <h3>4. Local Storage</h3>
          <p>Your encrypted wallet data (encrypted mnemonic or secret key) is stored locally in your browser storage. You control its lifecycle (clear, export, rotate).</p>
          <h3>5. Security</h3>
          <p>We use standard browser cryptography (WebCrypto AES-GCM + PBKDF2) for password-based encryption of mnemonics. Biometric unlock (if enabled) gates local decryption only and never transmits biometric data to us.</p>
          <h3>6. Children</h3>
          <p>The Services are not directed to children under 13 (or higher age threshold where applicable). We do not knowingly collect data from minors.</p>
          <h3>7. Changes</h3>
          <p>We may update this Privacy Policy. Material updates will be dated and posted here. Continued use constitutes acceptance.</p>
          <h3>8. Contact</h3>
          <p>Questions: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a></p>
          <p className="text-white/50 text-xs mt-2">This Privacy Policy pairs with the Terms below. Review both together.</p>
        </section>

        <p>These Terms of Service ("Terms") govern your access to and use of Dopelganga Wallet and related websites, applications, smart contracts, and services (collectively, the "Services"). By using the Services, you agree to be bound by these Terms. If you do not agree, do not use the Services.</p>

        <section id="eligibility">
          <h2>1. Eligibility</h2>
          <ul>
            <li>You must be at least 18 years old and legally capable of entering into binding contracts.</li>
            <li>You must comply with all applicable laws in your jurisdiction (including those relating to digital assets, securities, and money transmission).</li>
            <li>We may restrict access in certain regions where regulatory risks are high.</li>
          </ul>
        </section>

        <section id="services">
          <h2>2. Services Provided</h2>
          <p>Dopelganga Wallet is a non-custodial blockchain wallet and ecosystem tool.</p>
          <ul>
            <li>You are solely responsible for securing your private keys, seed phrases, and devices.</li>
            <li>We do not control, access, or recover your keys or funds.</li>
            <li>The Services may include integrations with third-party providers (e.g., MoonPay, Ramp, Transak) for fiat-to-crypto purchases. These providers operate independently under their own terms and policies.</li>
          </ul>
        </section>

        <section id="risks">
          <h2>3. Risks of Using Blockchain Services</h2>
          <p>By using the Services, you acknowledge and accept that:</p>
          <ul>
            <li>Transactions on public blockchains (e.g., Solana) are <strong>irreversible</strong>.</li>
            <li>The value of digital assets is highly volatile and may result in financial loss.</li>
            <li>Smart contracts may contain bugs, exploits, or vulnerabilities that could lead to loss of funds.</li>
            <li>Regulatory changes may impact your ability to use the Services.</li>
            <li>We provide <strong>no guarantee</strong> of profitability, price stability, or value appreciation of any token, including $DOPE and $DWT.</li>
          </ul>
        </section>

        <section id="responsibilities">
          <h2>4. User Responsibilities</h2>
          <ul>
            <li>Safeguard your wallet credentials, private keys, and seed phrases. We cannot restore them if lost.</li>
            <li>Verify all transaction details before confirming.</li>
            <li>Use the Services only for lawful purposes and in compliance with applicable regulations.</li>
            <li>You are responsible for any taxes, reporting obligations, or legal consequences related to your use of the Services.</li>
          </ul>
        </section>

        <section id="prohibited">
          <h2>5. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the Services for unlawful activities (e.g., fraud, money laundering, terrorist financing, sanctions evasion).</li>
            <li>Attempt to disrupt, hack, or exploit the Services.</li>
            <li>Misrepresent affiliation with Dopelganga or other users.</li>
            <li>Use automated bots or scrapers to overload or abuse the Services.</li>
          </ul>
        </section>

        <section id="thirdparty">
          <h2>6. Third-Party Services</h2>
          <ul>
            <li>Fiat on-ramps (e.g., MoonPay, Ramp, Transak) are third-party services subject to their own terms and privacy policies.</li>
            <li>We are not responsible for their actions, KYC/AML processes, or data practices.</li>
            <li>By using such services, you agree to assume any associated risks.</li>
          </ul>
        </section>

        <section id="ip">
          <h2>7. Intellectual Property</h2>
          <ul>
            <li>All Dopelganga branding, logos, content, and software are owned by us or our licensors.</li>
            <li>You may not copy, modify, or distribute our IP without prior written consent.</li>
            <li>You retain ownership of your own content uploaded or shared within Dopelganga Chat.</li>
          </ul>
        </section>

        <section id="disclaimers">
          <h2>8. Disclaimers</h2>
          <ul>
            <li>The Services are provided <strong>“as is” and “as available”</strong> without warranties of any kind.</li>
            <li>We disclaim all liability for errors, downtime, or losses caused by blockchain networks, third-party providers, or user mistakes.</li>
            <li>No advice, information, or communication from us constitutes financial, investment, or legal advice.</li>
          </ul>
        </section>

        <section id="liability">
          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>We are <strong>not liable</strong> for lost profits, data, funds, or indirect damages arising from use of the Services.</li>
            <li>Our total liability to you will not exceed the amount you paid us directly (if any) for accessing the Services in the prior 12 months.</li>
            <li>You use Dopelganga Wallet <strong>at your own risk</strong>.</li>
          </ul>
        </section>

        <section id="indemnification">
          <h2>10. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Dopelganga, its founders, affiliates, and partners from any claims, losses, damages, liabilities, or expenses (including legal fees) arising from your:</p>
          <ul>
            <li>Violation of these Terms.</li>
            <li>Misuse of the Services.</li>
            <li>Violation of applicable laws or third-party rights.</li>
          </ul>
        </section>

        <section id="termination">
          <h2>11. Termination</h2>
          <p>We may suspend or terminate your access to the Services at any time, without notice, if you breach these Terms or if we believe your use poses a risk to us, the network, or other users.</p>
        </section>

        <section id="law">
          <h2>12. Governing Law</h2>
          <p>These Terms shall be governed by and construed under the laws of <span className="italic">[Insert Jurisdiction]</span>. Disputes shall be resolved exclusively in the courts of that jurisdiction.</p>
        </section>

        <section id="changes">
          <h2>13. Changes to Terms</h2>
            <p>We may update these Terms from time to time. The updated version will be posted on our website with a new effective date. Continued use of the Services constitutes acceptance of the revised Terms.</p>
        </section>

        <section id="contact">
          <h2>14. Contact</h2>
          <p>For questions regarding these Terms, contact us at: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a></p>
        </section>

        <section id="summary" className="border-t border-white/10 pt-6">
          <h2>Summary & Coverage</h2>
          <p>This document provides broad legal protection: non-custodial disclaimer, third-party separation, volatility risk disclosure, and liability limitation.</p>
          <p className="text-white/60 text-xs mt-2">You can adapt the language later with formal legal review.</p>
        </section>
      </div>
  <div className="text-xs text-white/40">Last updated: <span className="font-mono">10/3/2025 1:13 PM</span></div>
    </div>
  );
}
