import jsPDF from "jspdf";
import type { ContractTemplate } from "@/lib/templates";

const SECTIONS: Record<string, { en: string }[]> = {
  employment: [
    { en: "1. Parties to the Agreement" },
    { en: "2. Job Title & Duties" },
    { en: "3. Commencement Date" },
    { en: "4. Probationary Period" },
    { en: "5. Working Hours" },
    { en: "6. Remuneration & Benefits" },
    { en: "7. Annual Leave" },
    { en: "8. Overtime" },
    { en: "9. Termination & Notice Period" },
    { en: "10. Confidentiality" },
    { en: "11. Governing Law — Oman Labour Law (RD 35/2003)" },
    { en: "12. Signatures" },
  ],
  nda: [
    { en: "1. Parties" },
    { en: "2. Definition of Confidential Information" },
    { en: "3. Obligations of the Receiving Party" },
    { en: "4. Exclusions from Confidentiality" },
    { en: "5. Term of Agreement" },
    { en: "6. Return / Destruction of Information" },
    { en: "7. Remedies & Injunctive Relief" },
    { en: "8. Governing Law — Omani Commercial Law" },
    { en: "9. Signatures" },
  ],
  "service-agreement": [
    { en: "1. Parties" },
    { en: "2. Scope of Services" },
    { en: "3. Deliverables & Timeline" },
    { en: "4. Fees & Payment Terms" },
    { en: "5. Intellectual Property" },
    { en: "6. Confidentiality" },
    { en: "7. Termination" },
    { en: "8. Limitation of Liability" },
    { en: "9. Governing Law" },
    { en: "10. Signatures" },
  ],
  freelance: [
    { en: "1. Parties" },
    { en: "2. Scope of Work" },
    { en: "3. Milestones & Deadlines" },
    { en: "4. Compensation & Payment" },
    { en: "5. Revision Policy" },
    { en: "6. Ownership of Work Product" },
    { en: "7. Independent Contractor Status" },
    { en: "8. Termination" },
    { en: "9. Governing Law" },
    { en: "10. Signatures" },
  ],
  tenancy: [
    { en: "1. Parties (Landlord & Tenant)" },
    { en: "2. Property Description" },
    { en: "3. Term of Tenancy" },
    { en: "4. Rent Amount & Payment Schedule" },
    { en: "5. Security Deposit" },
    { en: "6. Maintenance & Repairs" },
    { en: "7. Utilities" },
    { en: "8. Renewal Terms" },
    { en: "9. Termination & Eviction" },
    { en: "10. Governing Law — Oman Tenancy Law" },
    { en: "11. Signatures" },
  ],
  partnership: [
    { en: "1. Parties" },
    { en: "2. Business Name & Purpose" },
    { en: "3. Capital Contributions" },
    { en: "4. Profit & Loss Sharing" },
    { en: "5. Management & Decision-Making" },
    { en: "6. Partner Duties & Restrictions" },
    { en: "7. New Partners & Transfers" },
    { en: "8. Dissolution & Exit" },
    { en: "9. Governing Law — Omani Commercial Companies Law" },
    { en: "10. Signatures" },
  ],
  "sales-purchase": [
    { en: "1. Parties (Seller & Buyer)" },
    { en: "2. Description of Goods / Asset" },
    { en: "3. Purchase Price" },
    { en: "4. Payment Terms" },
    { en: "5. Delivery & Transfer of Risk" },
    { en: "6. Warranties & Representations" },
    { en: "7. Inspection & Acceptance" },
    { en: "8. Default & Remedies" },
    { en: "9. Dispute Resolution" },
    { en: "10. Governing Law" },
    { en: "11. Signatures" },
  ],
};

export function generateTemplatePdf(template: ContractTemplate, _lang: "en" | "ar"): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const sections = SECTIONS[template.id] ?? [];
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── Red header bar ──────────────────────────────────────
  doc.setFillColor(225, 29, 72);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRACT SCRIBE PRO", margin, 11);
  doc.setFont("helvetica", "normal");
  doc.text("contract-scribe-pro.vercel.app", pageW - margin, 11, { align: "right" });

  // ── Title block ─────────────────────────────────────────
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(template.titleEn.toUpperCase(), margin, 34);

  // ── Description ─────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const descLines = doc.splitTextToSize(template.descEn, contentW);
  doc.text(descLines, margin, 42);

  // ── Divider ──────────────────────────────────────────────
  const divY = 42 + descLines.length * 4 + 4;
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.4);
  doc.line(margin, divY, pageW - margin, divY);

  // ── "Free template" badge ────────────────────────────────
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, divY + 4, 60, 7, 2, 2, "FD");
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("FREE TEMPLATE  ·  contract-scribe-pro.vercel.app", margin + 3, divY + 9);

  // ── Instructions ────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Fill in the sections below or customize this template online at Contract Scribe Pro.",
    margin,
    divY + 19,
  );

  // ── Contract sections ────────────────────────────────────
  let y = divY + 27;

  sections.forEach((section) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    // Section heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 17, 17);
    doc.text(section.en, margin, y);

    y += 6;

    // Three fill-in lines
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 3; i++) {
      doc.line(margin, y + i * 7, pageW - margin, y + i * 7);
    }

    y += 30;
  });

  // ── Signature block ──────────────────────────────────────
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  // Party A
  doc.line(margin, y + 14, margin + 70, y + 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Signature — Party A", margin, y + 19);
  doc.line(margin, y + 28, margin + 70, y + 28);
  doc.text("Date", margin, y + 33);
  // Party B
  doc.line(pageW - margin - 70, y + 14, pageW - margin, y + 14);
  doc.text("Signature — Party B", pageW - margin - 70, y + 19);
  doc.line(pageW - margin - 70, y + 28, pageW - margin, y + 28);
  doc.text("Date", pageW - margin - 70, y + 33);

  // ── Footer on every page ─────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 248, 248);
    doc.rect(0, 284, pageW, 13, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${template.titleEn} — Free Template · Contract Scribe Pro · Page ${p} of ${total}`,
      pageW / 2,
      291,
      { align: "center" },
    );
    doc.text(
      "Customize online: contract-scribe-pro.vercel.app/create-contract",
      pageW / 2,
      296,
      { align: "center" },
    );
  }

  doc.save(`contract-scribe-${template.id}.pdf`);
}
