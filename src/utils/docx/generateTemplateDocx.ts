// =============================================================
// Bilingual Contract Template — .docx Generator
//
// Replaces the previous jsPDF-based flow (which couldn't render
// Arabic because it only had helvetica). This builds a real Word
// document with proper RTL shaping and bilingual side-by-side
// section titles.
//
// Required dep:
//   npm install docx file-saver
//   npm install --save-dev @types/file-saver
// =============================================================

import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { ContractTemplate } from "@/lib/templates";

/** A single section heading + body shown in both languages */
interface BilingualSection {
  en: string;
  ar: string;
}

/** Section content for each template, keyed by template.id */
const SECTIONS: Record<string, BilingualSection[]> = {
  employment: [
    { en: "1. Parties to the Agreement", ar: "1. أطراف الاتفاقية" },
    { en: "2. Job Title & Duties", ar: "2. المسمى الوظيفي والمهام" },
    { en: "3. Commencement Date", ar: "3. تاريخ بدء العمل" },
    { en: "4. Probationary Period", ar: "4. فترة التجربة" },
    { en: "5. Working Hours", ar: "5. ساعات العمل" },
    { en: "6. Remuneration & Benefits", ar: "6. الأجر والمزايا" },
    { en: "7. Annual Leave", ar: "7. الإجازة السنوية" },
    { en: "8. Overtime", ar: "8. العمل الإضافي" },
    { en: "9. Termination & Notice Period", ar: "9. الإنهاء وفترة الإشعار" },
    { en: "10. Confidentiality", ar: "10. السرية" },
    { en: "11. Governing Law — Oman Labour Law (RD 35/2003)", ar: "11. القانون الحاكم — قانون العمل العماني (المرسوم السلطاني 35/2003)" },
    { en: "12. Signatures", ar: "12. التوقيعات" },
  ],
  nda: [
    { en: "1. Parties", ar: "1. الأطراف" },
    { en: "2. Definition of Confidential Information", ar: "2. تعريف المعلومات السرية" },
    { en: "3. Obligations of the Receiving Party", ar: "3. التزامات الطرف المستلم" },
    { en: "4. Exclusions from Confidentiality", ar: "4. الاستثناءات من السرية" },
    { en: "5. Term of Agreement", ar: "5. مدة الاتفاقية" },
    { en: "6. Return / Destruction of Information", ar: "6. إعادة / إتلاف المعلومات" },
    { en: "7. Remedies & Injunctive Relief", ar: "7. سبل الانتصاف والأوامر القضائية" },
    { en: "8. Governing Law — Omani Commercial Law", ar: "8. القانون الحاكم — القانون التجاري العماني" },
    { en: "9. Signatures", ar: "9. التوقيعات" },
  ],
  "service-agreement": [
    { en: "1. Parties", ar: "1. الأطراف" },
    { en: "2. Scope of Services", ar: "2. نطاق الخدمات" },
    { en: "3. Deliverables & Timeline", ar: "3. التسليمات والجدول الزمني" },
    { en: "4. Fees & Payment Terms", ar: "4. الرسوم وشروط الدفع" },
    { en: "5. Intellectual Property", ar: "5. الملكية الفكرية" },
    { en: "6. Confidentiality", ar: "6. السرية" },
    { en: "7. Termination", ar: "7. الإنهاء" },
    { en: "8. Limitation of Liability", ar: "8. حدود المسؤولية" },
    { en: "9. Governing Law", ar: "9. القانون الحاكم" },
    { en: "10. Signatures", ar: "10. التوقيعات" },
  ],
  freelance: [
    { en: "1. Parties", ar: "1. الأطراف" },
    { en: "2. Scope of Work", ar: "2. نطاق العمل" },
    { en: "3. Milestones & Deadlines", ar: "3. المراحل والمواعيد النهائية" },
    { en: "4. Compensation & Payment", ar: "4. التعويض والدفع" },
    { en: "5. Revision Policy", ar: "5. سياسة المراجعة" },
    { en: "6. Ownership of Work Product", ar: "6. ملكية المنتج النهائي" },
    { en: "7. Independent Contractor Status", ar: "7. وضع المتعاقد المستقل" },
    { en: "8. Termination", ar: "8. الإنهاء" },
    { en: "9. Governing Law", ar: "9. القانون الحاكم" },
    { en: "10. Signatures", ar: "10. التوقيعات" },
  ],
  tenancy: [
    { en: "1. Parties (Landlord & Tenant)", ar: "1. الأطراف (المؤجر والمستأجر)" },
    { en: "2. Property Description", ar: "2. وصف العقار" },
    { en: "3. Term of Tenancy", ar: "3. مدة الإيجار" },
    { en: "4. Rent Amount & Payment Schedule", ar: "4. مبلغ الإيجار وجدول الدفع" },
    { en: "5. Security Deposit", ar: "5. مبلغ التأمين" },
    { en: "6. Maintenance & Repairs", ar: "6. الصيانة والإصلاحات" },
    { en: "7. Utilities", ar: "7. الخدمات (مياه، كهرباء)" },
    { en: "8. Renewal Terms", ar: "8. شروط التجديد" },
    { en: "9. Termination & Eviction", ar: "9. الإنهاء والإخلاء" },
    { en: "10. Governing Law — Oman Tenancy Law", ar: "10. القانون الحاكم — قانون الإيجار العماني" },
    { en: "11. Signatures", ar: "11. التوقيعات" },
  ],
  partnership: [
    { en: "1. Parties", ar: "1. الأطراف" },
    { en: "2. Business Name & Purpose", ar: "2. اسم النشاط والغرض" },
    { en: "3. Capital Contributions", ar: "3. مساهمات رأس المال" },
    { en: "4. Profit & Loss Sharing", ar: "4. توزيع الأرباح والخسائر" },
    { en: "5. Management & Decision-Making", ar: "5. الإدارة واتخاذ القرارات" },
    { en: "6. Partner Duties & Restrictions", ar: "6. واجبات الشركاء والقيود" },
    { en: "7. New Partners & Transfers", ar: "7. الشركاء الجدد والتحويلات" },
    { en: "8. Dissolution & Exit", ar: "8. الحل والخروج" },
    { en: "9. Governing Law — Omani Commercial Companies Law", ar: "9. القانون الحاكم — قانون الشركات التجارية العماني" },
    { en: "10. Signatures", ar: "10. التوقيعات" },
  ],
  "sales-purchase": [
    { en: "1. Parties (Seller & Buyer)", ar: "1. الأطراف (البائع والمشتري)" },
    { en: "2. Goods / Asset Description", ar: "2. وصف البضائع / الأصول" },
    { en: "3. Purchase Price", ar: "3. ثمن الشراء" },
    { en: "4. Payment Terms", ar: "4. شروط الدفع" },
    { en: "5. Delivery & Transfer of Title", ar: "5. التسليم ونقل الملكية" },
    { en: "6. Warranties", ar: "6. الضمانات" },
    { en: "7. Risk of Loss", ar: "7. تحمل المخاطر" },
    { en: "8. Dispute Resolution", ar: "8. حل النزاعات" },
    { en: "9. Governing Law", ar: "9. القانون الحاكم" },
    { en: "10. Signatures", ar: "10. التوقيعات" },
  ],
  "hr-bundle": [
    { en: "Part I — Employee Handbook", ar: "الجزء الأول — دليل الموظف" },
    { en: "Part II — Disciplinary Policy", ar: "الجزء الثاني — سياسة التأديب" },
    { en: "Part III — Leave Policy", ar: "الجزء الثالث — سياسة الإجازات" },
    { en: "Part IV — Code of Conduct", ar: "الجزء الرابع — مدونة قواعد السلوك" },
    { en: "Part V — Grievance Procedure", ar: "الجزء الخامس — إجراءات التظلم" },
    { en: "Part VI — Compliance with Oman Labour Law", ar: "الجزء السادس — الامتثال لقانون العمل العماني" },
  ],
};

const SOURCE_LINE: BilingualSection = {
  en: "Generated by Contract Scribe Pro — bilingual contract platform for Oman businesses.",
  ar: "تم إنشاؤه بواسطة Contract Scribe Pro — منصة العقود ثنائية اللغة للأعمال في عُمان.",
};

const PLACEHOLDER_LINE: BilingualSection = {
  en: "[ Insert clause text here — replace this placeholder when filling in the contract. ]",
  ar: "[ أدخل نص البند هنا — استبدل هذا النص النائب عند تعبئة العقد. ]",
};

const FOOTER_DISCLAIMER: BilingualSection = {
  en: "This template is provided for general informational purposes only and does not constitute legal advice. Consult a licensed attorney for advice specific to your situation.",
  ar: "هذا النموذج مقدم لأغراض إعلامية عامة فقط ولا يشكل استشارة قانونية. استشر محامياً مرخصاً للحصول على نصيحة خاصة بحالتك.",
};

// ── Helpers ─────────────────────────────────────────────────────
const HEADING_FONT_EN = "Calibri";
const HEADING_FONT_AR = "Arial"; // Arial has solid Arabic glyphs on every Word version
const BODY_FONT_EN = "Calibri";
const BODY_FONT_AR = "Arial";

function arRun(text: string, opts: { bold?: boolean; size?: number } = {}): TextRun {
  return new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 22, // half-points → 11pt
    font: { name: HEADING_FONT_AR },
    rightToLeft: true,
  });
}

function enRun(text: string, opts: { bold?: boolean; size?: number } = {}): TextRun {
  return new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 22,
    font: { name: HEADING_FONT_EN },
  });
}

function titleCell(text: string, lang: "en" | "ar"): TableCell {
  const isAr = lang === "ar";
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isAr,
        children: [
          isAr
            ? arRun(text, { bold: true, size: 24 })
            : enRun(text, { bold: true, size: 24 }),
        ],
      }),
    ],
  });
}

function bodyCell(text: string, lang: "en" | "ar"): TableCell {
  const isAr = lang === "ar";
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isAr,
        spacing: { after: 120 },
        children: [
          isAr
            ? arRun(text, { size: 20 })
            : enRun(text, { size: 20 }),
        ],
      }),
    ],
  });
}

function spacerCell(): TableCell {
  return new TableCell({
    width: { size: 2, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [] })],
  });
}

// ── Build the document ──────────────────────────────────────────
function buildDocument(template: ContractTemplate): Document {
  const sections = SECTIONS[template.id] ?? [];
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Title heading (bilingual, stacked rather than side-by-side so it
  // looks like a proper cover page).
  const titleParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [
        enRun(template.titleEn, { bold: true, size: 40 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [
        arRun(template.titleAr, { bold: true, size: 40 }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        enRun(`Date: ${today}`, { size: 20 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [enRun("", { size: 20 })],
    }),
  ];

  // Table-per-section: title row + body row (placeholder)
  const sectionRows: TableRow[] = [];

  sections.forEach((s) => {
    sectionRows.push(
      new TableRow({
        tableHeader: false,
        children: [
          titleCell(s.en, "en"),
          spacerCell(),
          titleCell(s.ar, "ar"),
        ],
      })
    );
    sectionRows.push(
      new TableRow({
        children: [
          bodyCell(PLACEHOLDER_LINE.en, "en"),
          spacerCell(),
          bodyCell(PLACEHOLDER_LINE.ar, "ar"),
        ],
      })
    );
  });

  const sectionsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: sectionRows,
  });

  // Disclaimer footer
  const disclaimerParagraphs: Paragraph[] = [
    new Paragraph({ children: [enRun("", { size: 20 })], spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [enRun(FOOTER_DISCLAIMER.en, { size: 16 })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      children: [arRun(FOOTER_DISCLAIMER.ar, { size: 16 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        enRun(SOURCE_LINE.en, { size: 14 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [
        arRun(SOURCE_LINE.ar, { size: 14 }),
      ],
    }),
  ];

  return new Document({
    creator: "Contract Scribe Pro",
    title: template.titleEn,
    description: template.descEn,
    styles: {
      default: {
        document: {
          run: { font: BODY_FONT_EN, size: 22 },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children: [...titleParagraphs, sectionsTable, ...disclaimerParagraphs],
      },
    ],
  });
}

// ── Public API ──────────────────────────────────────────────────
export async function generateTemplateDocx(
  template: ContractTemplate,
  // language arg kept for API compatibility with old generateTemplatePdf call sites
  // — output is always bilingual now, but we use this to set the prompt direction
  // of the filename and any future per-language tweaks.
  _language: "en" | "ar" = "en"
): Promise<void> {
  const doc = buildDocument(template);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `contract-scribe-${template.id}-bilingual.docx`);
}
