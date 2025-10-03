"use client";
import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold">Dopelganga Wallet – Terms of Service</h1>
        <div className="text-white/60 text-sm mt-1">Effective Date: <span className="font-mono">10/3/2025</span> · Version: <span className="font-mono">v1.1</span></div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <a href="/api/legal/pdf" className="btn text-xs" target="_blank" rel="noopener noreferrer">Download Combined PDF</a>
          <Link href="/privacy" className="text-xs underline text-white/70 hover:text-white">Privacy Policy</Link>
        </div>
      </div>
      <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-8">
        <p>These Terms of Service ("Terms") govern your access to and use of Dopelganga Wallet and related websites, applications, smart contracts, and services (collectively, the "Services"). By using the Services, you agree to these Terms. If you do not agree, do not use the Services.</p>

        <section id="eligibility">
          <h2>1. Eligibility</h2>
          <ul>
            <li>You must be at least 18 years old and legally capable of entering into binding contracts.</li>
            <li>You must comply with all applicable laws in your jurisdiction.</li>
            <li>Access may be restricted in certain sanctioned or high-risk regions.</li>
          </ul>
        </section>

        <section id="services">
          <h2>2. Services Provided</h2>
          <p>Dopelganga Wallet is a non-custodial blockchain wallet and ecosystem tool.</p>
          <ul>
            <li>You are solely responsible for securing your private keys and seed phrases.</li>
            <li>We do not control, access, or recover your keys or funds.</li>
            <li>Third-party provider integrations (e.g., fiat on-ramps) are independent services under their own terms.</li>
          </ul>
        </section>

        <section id="risks">
          <h2>3. Risks of Using Blockchain Services</h2>
          <ul>
            <li>Public blockchain transactions are irreversible.</li>
            <li>Digital asset values are volatile and may result in loss.</li>
            <li>Smart contracts may contain vulnerabilities.</li>
            <li>Regulatory changes may impact service availability.</li>
            <li>No guarantee of profitability or token value appreciation.</li>
          </ul>
        </section>

        <section id="responsibilities">
          <h2>4. User Responsibilities</h2>
          <ul>
            <li>Safeguard wallet credentials; we cannot restore lost secrets.</li>
            <li>Verify all transaction details before confirming.</li>
            <li>Remain compliant with applicable laws and tax obligations.</li>
          </ul>
        </section>

        <section id="prohibited">
          <h2>5. Prohibited Activities</h2>
          <ul>
            <li>Unlawful activities (fraud, money laundering, sanctions evasion).</li>
            <li>Exploiting or disrupting the Services.</li>
            <li>Misrepresentation of affiliation.</li>
            <li>Automated abuse (malicious bots, scraping overload).</li>
          </ul>
        </section>

        <section id="thirdparty">
          <h2>6. Third-Party Services</h2>
          <ul>
            <li>Fiat on-ramps (MoonPay, Ramp, Transak) operate independently.</li>
            <li>We are not responsible for their KYC/AML processes or data handling.</li>
            <li>Using them is at your own risk.</li>
          </ul>
        </section>

        <section id="ip">
          <h2>7. Intellectual Property</h2>
          <ul>
            <li>All Dopelganga branding, logos, and software are owned by us or licensors.</li>
            <li>You may not copy, modify, or distribute our IP without permission.</li>
            <li>You retain ownership of content you contribute.</li>
          </ul>
        </section>

        <section id="disclaimers">
          <h2>8. Disclaimers</h2>
          <ul>
            <li>Services are provided “as is” without warranties.</li>
            <li>No financial, investment, tax, or legal advice is provided.</li>
            <li>We disclaim responsibility for third-party failures and network issues.</li>
          </ul>
        </section>

        <section id="liability">
          <h2>9. Limitation of Liability</h2>
          <p>We are not liable for indirect, incidental, or consequential damages, or loss of profits/data. Aggregate liability is limited to fees paid by you (if any) in the preceding 12 months.</p>
        </section>

        <section id="indemnification">
          <h2>10. Indemnification</h2>
          <p>You agree to indemnify Dopelganga and affiliates for claims arising from violations of these Terms or misuse of the Services.</p>
        </section>

        <section id="termination">
          <h2>11. Termination</h2>
          <p>We may suspend or terminate access for violations or security risk without prior notice.</p>
        </section>

        <section id="law">
          <h2>12. Governing Law</h2>
          <p>These Terms are governed by the laws of the Commonwealth of Virginia, USA (conflict rules excluded). Venue: state or federal courts serving Fairfax County, Virginia.</p>
        </section>

        <section id="changes">
          <h2>13. Changes to Terms</h2>
          <p>We may update these Terms. Continued use after an update signifies acceptance.</p>
        </section>

        <section id="contact">
          <h2>14. Contact</h2>
          <p>Email: <a href="mailto:legal@dopelganga.xyz" className="underline">legal@dopelganga.xyz</a></p>
        </section>

        <section id="summary" className="border-t border-white/10 pt-6">
          <h2>Summary</h2>
          <p>Non-custodial wallet; you control keys. High volatility & on-chain risk. Use at your own risk. Read full Privacy Policy for data handling practices.</p>
        </section>
      </div>
      <div className="text-xs text-white/40">Last updated: <span className="font-mono">10/3/2025</span> · Version v1.1</div>
    </div>
  );
}
