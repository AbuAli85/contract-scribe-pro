import jsPDF from "jspdf";
import type { ContractTemplate } from "@/lib/templates";

const SECTIONS: Record<string, { en: string; ar: string }[]> = {
  employment: [
    { en: "1. Parties to the Agreement", ar: "١. أطراف الاتفاقية" },
    { en: "2. Job Title & Duties", ar: "٢. المسمى الوظيفي والمهام" },
    { en: "3. Commencement Date", ar: "٣. تاريخ البدء" },
    { en: "4. Probationary Period", ar: "٤. فترة التجربة" },
    { en: "5. Working Hours", ar: "٥. ساعات العمل" },
    { en: "6. Remuneration & Benefits", ar: "٦. الراتب والمزايا" },
    { en: "7. Annual Leave", ar: "٧. الإجازة السنوية" },
    { en: "8. Overtime", ar: "٨. العمل الإضافي" },
    { en: "9. Termination & Notice Period", ar: "٩. الإنهاء وفترة الإشعار" },
    { en: "10. Confidentiality", ar: "١٠. السرية" },
    { en: "11. Governing Law — Oman Labour Law (RD 35/2003)", ar: "١١. القانون الحاكم — قانون العمل العماني" },
    { en: "12. Signatures", ar: "١٢. التوقيعات" },
  ],
  nda: [
    { en: "1. Parties", ar: "١. الأطراف" },
    { en: "2. Definition of Confidential Information", ar: "٢. تعريف المعلومات السرية" },
    { en: "3. Obligations of the Receiving Party", ar: "٣. التزامات الطرف المتلقي" },
    { en: "4. Exclusions from Confidentiality", ar: "٤. استثناءات السرية" },
    { en: "5. Term of Agreement", ar: "٥. مدة الاتفاقية" },
    { en: "6. Return / Destruction of Information", ar: "٦. إعادة أو تدمير المعلومات" },
    { en: "7. Remedies & Injunctive Relief", ar: "٧. سبل الانتصاف" },
    { en: "8. Governing Law — Omani Commercial Law", ar: "٨. القانون الحاكم — القانون التجاري العماني" },
    { en: "9. Signatures", ar: "٩. التوقيعات" },
  ],
  "service-agreement": [
    { en: "1. Parties", ar: "١. الأطراف" },
    { en: "2. Scope of Services", ar: "٢. نطاق الخدمات" },
    { en: "3. Deliverables & Timeline", ar: "٣. التسليمات والجدول الزمني" },
    { en: "4. Fees & Payment Terms", ar: "٤. الرسوم وشروط الدفع" },
    { en: "5. Intellectual Property", ar: "٥. الملكية الفكرية" },
    { en: "6. Confidentiality", ar: "٦. السرية" },
    { en: "7. Termination", ar: "٧. إنهاء العقد" },
    { en: "8. Limitation of Liability", ar: "٨. حد المسؤولية" },
    { en: "9. Governing Law", ar: "٩. القانون الحاكم" },
    { en: "10. Signatures", ar: "١٠. التوقيعات" },
  ],
  freelance: [
    { en: "1. Parties", ar: "١. الأطراف" },
    { en: "2. Scope of Work", ar: "٢. نطاق العمل" },
    { en: "3. Milestones & Deadlines", ar: "٣. المراحل والمواعيد النهائية" },
    { en: "4. Compensation & Payment", ar: "٤. التعويض والدفع" },
    { en: "5. Revision Policy", ar: "٥. سياسة المراجعة" },
    { en: "6. Ownership of Work Product", ar: "٦. ملكية منتج العمل" },
    { en: "7. Independent Contractor Status", ar: "٧. وضع المتعاقد المستقل" },
    { en: "8. Termination", ar: "٨. إنهاء العقد" },
    { en: "9. Governing Law", ar: "٩. القانون الحاكم" },
    { en: "10. Signatures", ar: "١٠. التوقيعات" },
  ],
  tenancy: [
    { en: "1. Parties (Landlord & Tenant)", ar: "١. الأطراف (المالك والمستأجر)" },
    { en: "2. Property Description", ar: "٢. وصف العقار" },
    { en: "3. Term of Tenancy", ar: "٣. مدة الإيجار" },
    { en: "4. Rent Amount & Payment Schedule", ar: "٤. مبلغ الإيجار وجدول الدفع" },
    { en: "5. Security Deposit", ar: "٥. وديعة الأمان" },
    { en: "6. Maintenance & Repairs", ar: "٦. الصيانة والإصلاحات" },
    { en: "7. Utilities", ar: "٧. الخدمات" },
    { en: "8. Renewal Terms", ar: "٨. شروط التجديد" },
    { en: "9. Termination & Eviction", ar: "٩. الإنهاء والإخلاء" },
    { en: "10. Governing Law — Oman Tenancy Law", ar: "١٠. القانون الحاكم — قانون الإيجار العماني" },
    { en: "11. Signatures", ar: "١١. التوقيعات" },
  ],
  partnership: [
    { en: "1. Parties", ar: "١. الأطراف" },
    { en: "2. Business Name & Purpose", ar: "٢. اسم الشركة والغرض" },
    { en: "3. Capital Contributions", ar: "٣. مساهمات رأس المال" },
    { en: "4. Profit & Loss Sharing", ar: "٤. توزيع الأرباح والخسائر" },
    { en: "5. Management & Decision-Making", ar: "٥. الإدارة وصنع القرار" },
    { en: "6. Partner Duties & Restrictions", ar: "٦. واجبات الشريك والقيود" },
    { en: "7. New Partners & Transfers", ar: "٧. الشركاء الجدد والتحويلات" },
    { en: "8. Dissolution & Exit", ar: "٨. الحل والخروج" },
    { en: "9. Governing Law — Omani Commercial Companies Law", ar: "٩. القانون الحاكم" },
    { en: "10. Signatures", ar: "١٠. التوقيعات" },
  ],
  "sales-purchase": [
    { en: "1. Parties (Seller & Buyer)", ar: "١. الأطراف (البائع والمشتري)" },
    { en: "2. Description of Goods / Asset", ar: "٢. وصف البضائع / الأصول" },
    { en: "3. Purchase Price", ar: "٣. سعر الشراء" },
    { en: "4. Payment Terms", ar: "٤. شروط الدفع" },
    { en: "5. Delivery & Transfer of Risk", ar: "٥. التسليم ونقل المخاطر" },
    { en: "6. Warranties & Representations", ar: "٦. الضمانات والإقرارات" },
    { en: "7. Inspection & Acceptance", ar: "٧. الفحص والقبول" },
    { en: "8. Default & Remedies", ar: "٨. التخلف وسبل الانتصاف" },
    { en: "9. Dispute Resolution", ar: "٩. حل النزاعات" },
    { en: "10. Governing Law", ar: "١٠. القانون الحاكم" },
    { en: "11. Signatures", ar: "١١. التوقيعات" },
  ],
};

export function generateTemplatePdf(template: ContractTemplate, lang: "en" | "ar"): void {
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

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`/ ${template.titleAr}`, margin, 42);

  // ── Description ─────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const descLines = doc.splitTextToSize(template.descEn, contentW);
  doc.text(descLines, margin, 51);

  // ── Divider ──────────────────────────────────────────────
  const divY = 51 + descLines.length * 4 + 4;
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

    // Section heading (EN)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 17, 17);
    doc.text(section.en, margin, y);

    // Arabic label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`(${section.ar})`, pageW - margin, y, { align: "right" });

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
