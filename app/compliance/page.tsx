"use client";
import React from 'react';

export default function CompliancePage() {
  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-xl font-semibold">U.S. Compliance Playbook</h1>
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <p className="text-xs text-white/70">Think of this as a practical roadmap for Dopelganga (wallet + chain + token). This is general info only, not legal advice.</p>
        <Section title="Phase 1: Foundation" items={[
          'Entity Formation: Delaware C‑Corp or LLC; founders’ agreements; EIN.',
          'Brand & IP: trademarks for Dopelganga / Dope Wallet; domains under the entity.',
          'Public Docs: Privacy Policy; Terms of Service; disclaimers (non‑custodial, no investment advice).',
        ]} />
        <Section title="Phase 2: Wallet Compliance" items={[
          'Stay Non‑Custodial: no key custody, no pooled funds, no custodial staking.',
          'Outsource Fiat On‑Ramps: MoonPay/Ramp/Transak/Onramper handle KYC/AML and fiat settlement.',
          'User Risk Disclosures: volatility, irreversible transactions, no profit promises.',
        ]} />
        <Section title="Phase 3: Token & Chain" items={[
          'Token Framing: $DOPE as utility (governance/access); community tokens not marketed as investments.',
          'Avoid Securities Triggers: no profit promises; broad distribution via usage/airdrops over sales.',
          'Tax & Treasury: corporate bank account; allocation tracking; crypto‑savvy accountant.',
        ]} />
        <Section title="Phase 4: Regulatory Layer" items={[
          'MSB/FinCEN: only if custodial or handling fiat directly; not needed for non‑custodial + outsourced on‑ramps.',
          'State MTLs / NY BitLicense: expensive/slow; avoid unless going custodial.',
          'Legal Opinions: obtain token non‑security opinion prior to exchange listings.',
        ]} />
        <Section title="Phase 5: Scaling & Governance" items={[
          'DAO/Foundation: token voting and separate entity (e.g., Cayman/Swiss) for governance/treasury.',
          'Consumer Protections: transparent fees; email opt‑outs; accessibility standards.',
          'Ongoing Compliance: annual filings, SEC/CFTC monitoring, cybersecurity insurance as treasury grows.',
        ]} />
        <div className="text-[10px] text-white/50">This page is informational and not legal advice. Consult qualified counsel.</div>
        <div>
          <a href="/api/compliance/pdf" className="btn">Download Roadmap PDF</a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{title}</div>
      <ul className="list-disc pl-5 space-y-1 text-xs text-white/80">
        {items.map((t, i) => (<li key={i}>{t}</li>))}
      </ul>
    </div>
  );
}
