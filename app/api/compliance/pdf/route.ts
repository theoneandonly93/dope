import { NextResponse } from 'next/server';

// Simple PDF: Compliance Roadmap (timeline-like layout using headings and bullets)
export async function GET() {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ autoFirstPage: true, margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));

    const title = 'Dopelganga – U.S. Compliance Roadmap';
    const version = 'v1.0';
    const generated = new Date().toISOString().slice(0, 10);

    doc.fontSize(18).text(title);
    doc.moveDown(0.25);
    doc.fontSize(10).fillColor('#666').text(`Version: ${version}  •  Generated: ${generated}`);
    doc.moveDown();

    const h = (t: string) => { doc.moveDown(0.5); doc.fontSize(14).fillColor('#000').text(t); doc.moveDown(0.25); doc.fontSize(11).fillColor('#111'); };
    const bullet = (t: string) => { doc.circle(doc.x + 2, doc.y + 6, 1.2).fill('#333'); doc.fill('#111').text('   ' + t, { paragraphGap: 4 }); };

    h('Phase 1: Foundation');
    bullet('Entity Formation: Delaware C‑Corp/LLC, founders’ docs, EIN.');
    bullet('Brand & IP: trademarks (Dopelganga, Dope Wallet), domains under entity.');
    bullet('Public Docs: Privacy Policy, Terms of Service, non‑custodial disclaimers.');

    h('Phase 2: Wallet Compliance');
    bullet('Stay Non‑Custodial: no key custody or pooled funds.');
    bullet('Outsource Fiat On‑Ramps: MoonPay/Ramp/Transak (they do KYC/AML).');
    bullet('User Risk Disclosures: volatility, irreversibility, no investment advice.');

    h('Phase 3: Token & Chain');
    bullet('Token Framing: $DOPE utility; community tokens not marketed as investments.');
    bullet('Avoid Securities Triggers: no profit promises, broad distribution.');
    bullet('Tax & Treasury: bank account, allocation tracking, crypto CPA.');

    h('Phase 4: Regulatory Layer');
    bullet('MSB/FinCEN: only if custodial or direct fiat handling.');
    bullet('State MTLs/NY BitLicense: avoid unless you move to custody (complex/expensive).');
    bullet('Legal Opinions: obtain token non‑security opinion before listings.');

    h('Phase 5: Scaling & Governance');
    bullet('DAO/Foundation: separate governance/treasury (e.g., Cayman/Swiss).');
    bullet('Consumer Protections: clear fee disclosures, email opt‑outs, accessibility.');
    bullet('Ongoing: annual filings, monitor SEC/CFTC, consider cybersecurity insurance.');

    doc.moveDown();
    doc.fontSize(9).fillColor('#666').text('Disclaimer: This roadmap is for general informational purposes only and is not legal advice. Consult qualified counsel.');

    doc.end();
    await new Promise<void>((resolve, reject) => { doc.on('end', () => resolve()); doc.on('error', (e) => reject(e)); });
    const pdf = Buffer.concat(chunks);
    return new NextResponse(pdf, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="dopelganga-compliance-roadmap.pdf"' } });
  } catch (e: any) {
    return NextResponse.json({ error: 'PDF generation failed', detail: e?.message }, { status: 500 });
  }
}
