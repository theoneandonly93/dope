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

    doc.fontSize(18).text('Dopelganga Wallet – Privacy Policy & Terms', { underline: false });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text('Generated: ' + new Date().toISOString());
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

    addHeading('Privacy Policy');
    para('We do not collect private keys, seed phrases, or custodial funds. Minimal technical metadata may be processed transiently to improve performance and reliability. Third-party fiat on-ramps handle compliance and user KYC directly.');
    para('Encrypted wallet data resides locally in browser storage. Biometric gating never transmits biometric data to our servers.');

    addHeading('1. Eligibility');
    para('You must be 18+ and legally able to enter binding contracts; you are responsible for legal compliance in your jurisdiction.');

    addHeading('2. Services Provided');
    para('Non-custodial wallet tooling; you retain exclusive control of keys and assets. We cannot recover lost secrets.');

    addHeading('3. Risks');
    para('Volatility, smart contract vulnerabilities, regulatory changes, and irreversible blockchain transactions may result in loss.');

    addHeading('4. User Responsibilities');
    para('Safeguard credentials, verify transactions, comply with laws, and handle tax/reporting obligations.');

    addHeading('5. Prohibited Activities');
    para('No unlawful use, abuse, exploitation, automated scraping, or misrepresentation of affiliation.');

    addHeading('6. Third-Party Services');
    para('Fiat ramps & other integrations operate under their own terms and privacy policies; risks accepted by the user.');

    addHeading('7. Intellectual Property');
    para('Branding and software belong to us or licensors; user retains ownership of their own contributed content.');

    addHeading('8. Disclaimers');
    para('Services provided as-is without warranties; no financial, legal, or investment advice.');

    addHeading('9. Limitation of Liability');
    para('No liability for indirect damages or lost profits; total liability capped at direct fees paid (if any) over prior 12 months.');

    addHeading('10. Indemnification');
    para('User indemnifies Dopelganga for claims arising from misuse, violations, or unlawful activities.');

    addHeading('11. Termination');
    para('Access may be suspended or terminated for violations or risk mitigation without prior notice.');

    addHeading('12. Governing Law');
    para('Applies per disclosed jurisdiction; disputes resolved exclusively in its courts.');

    addHeading('13. Changes');
    para('Terms & policy may update; continued use constitutes acceptance of revised versions.');

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
