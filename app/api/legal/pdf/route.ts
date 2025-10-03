import { NextResponse } from 'next/server';

// Lazy require pdfkit only when needed (optional dependency)
export async function GET() {
  try {
    // Dynamically import so build doesn't choke if optional dep missing
    const PDFDocument = (await import('pdfkit')).default;
    const { Readable } = await import('stream');

    const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));

  const VERSION = 'v1.1';
  const EFFECTIVE = '2025-10-03';
  const JURISDICTION = 'Commonwealth of Virginia, USA';

  doc.fontSize(18).text('Dopelganga Wallet – Privacy Policy & Terms of Service', { underline: false });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555').text(`Version: ${VERSION}  |  Effective: ${EFFECTIVE}  |  Jurisdiction: ${JURISDICTION}`);
  doc.fontSize(9).fillColor('#777').text('Generated: ' + new Date().toISOString());
    doc.moveDown();

    const addHeading = (title: string) => {
      doc.moveDown();
      doc.fontSize(14).fillColor('#000').text(title, { underline: false });
      doc.moveDown(0.25);
      doc.fontSize(10).fillColor('#222');
    };

    const para = (t: string) => {
      doc.fontSize(10).fillColor('#222').text(t, { paragraphGap: 6 });
    };

  addHeading('Privacy Policy (Summary At a Glance)');
  para('Non-custodial wallet: keys never leave the user device. No centralized accounts, no ad tracking, no sale of data. Minimal transient operational metrics only. Fiat on‑ramp partners (e.g., MoonPay) are independent controllers for KYC/AML data. Local encryption uses WebCrypto (PBKDF2 → AES‑GCM).');

  addHeading('1. Scope & Philosophy');
  para('Applies to public interface, wallet UI, and supporting APIs. Principle: strict data minimization balanced with reliability, safety, and compliance support.');

  addHeading('2. Data We Avoid Collecting');
  para('No seed phrases, private keys, government IDs, payment cards, behavioral ads tracking, or centralized login identifiers.');

  addHeading('3. Minimal Technical Data');
  para('Ephemeral / aggregated metrics: latency, error counters, rate‑limit signals (hashed/short TTL), fiat on‑ramp status (success/fail, ref ID), local UI mode stored client side only.');
  para('Purposes: reliability, security / abuse mitigation, feature optimization. Legal bases: legitimate interests, implied consent; incidental EEA/UK access may rely on Legitimate Interests, Contract, Legal Obligation.');
  para('Retention: logs ≤30d, security signals ≤90d (unless investigation), local encrypted wallet data until user clears storage, no KYC retention. Transfers: CDN edge routing may span regions; minimal personally identifying data reduces risk.');

  addHeading('4. Third‑Party Integrations');
  para('Fiat on‑ramps are independent controllers for identity/KYC. We receive only status callbacks. Sub‑processors (infra/security) handle transient operational metadata under confidentiality; list available on request.');

  addHeading('5. Local Storage & Encryption');
  para('Password‑derived key (PBKDF2 → AES‑GCM) encrypts wallet secret material locally. Biometric unlock never leaves the device.');

  addHeading('6. Security Measures');
  para('Least‑privilege architecture, dependency auditing, HTTPS, abuse throttling, anomaly detection, patch cadence, threat modeling for swap/bridge flows.');

  addHeading('7. Children');
  para('Not directed to children under 13 (or higher threshold where applicable). No knowing collection from minors.');

  addHeading('8. Your Rights');
  para('Access / deletion / restriction / portability / objection requests honored where applicable; often we hold no directly identifying data to retrieve.');

  addHeading('9. U.S. State / CA Notice');
  para('No sale or sharing of personal information; no profiling decisions. Contact us if you believe we hold personal data.');

  addHeading('10. Complaints');
  para('Email concerns to legal@dopelganga.xyz; escalate to authority only after giving us a chance to respond.');

  addHeading('11. Changes');
  para('Material updates posted with new effective date; continued use = acceptance.');

  addHeading('12. Contact');
  para('legal@dopelganga.xyz');

  // Page break before Terms
  doc.addPage();
  addHeading('Terms of Service');
  para('These Terms govern use of Dopelganga Wallet and related services. By using the Services you agree to these Terms. If you do not agree, discontinue use.');

  addHeading('1. Eligibility');
  para('Must be 18+ and legally capable; user responsible for jurisdictional compliance.');

  addHeading('2. Services Provided');
  para('Non‑custodial wallet tooling; exclusive user control of keys; we cannot restore lost secrets. Third‑party integrations under their own terms.');

  addHeading('3. Risks');
  para('Volatility, smart contract bugs, regulatory shifts, irreversible transactions, potential total loss of asset value. No profitability guarantees.');

  addHeading('4. User Responsibilities');
  para('Safeguard credentials, verify transactions, comply with law, manage tax/reporting obligations.');

  addHeading('5. Prohibited Activities');
  para('No unlawful use, exploitation, sanctions evasion, abuse, automated overload, or misrepresentation.');

  addHeading('6. Third‑Party Services');
  para('Fiat on‑ramps & other providers independent; user assumes associated risk; we disclaim responsibility for their actions.');

  addHeading('7. Intellectual Property');
  para('Branding/software owned by us or licensors; no copying/modification without permission; user retains own contributed content ownership.');

  addHeading('8. Disclaimers');
  para('Services provided “as is” without warranties; no financial/investment/legal advice; network / third‑party failures outside our control.');

  addHeading('9. Limitation of Liability');
  para('No indirect, incidental, consequential damages or lost profits; aggregate liability capped at direct fees paid in prior 12 months (if any).');

  addHeading('10. Indemnification');
  para('User indemnifies Dopelganga for claims arising from violations, misuse, unlawful conduct.');

  addHeading('11. Termination');
  para('Access may be suspended/terminated without notice for violations or risk/security reasons.');

  addHeading('12. Governing Law');
  para(`${JURISDICTION}; exclusive venue in its competent courts.`);

  addHeading('13. Changes');
  para('Updates posted; continued use after changes constitutes acceptance.');

  addHeading('14. Contact');
  para('legal@dopelganga.xyz');

    doc.end();

    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => resolve());
      doc.on('error', (e) => reject(e));
    });

    const pdfBuffer = Buffer.concat(chunks);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="dopelganga-legal.pdf"'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'PDF generation failed', detail: e?.message }, { status: 500 });
  }
}
