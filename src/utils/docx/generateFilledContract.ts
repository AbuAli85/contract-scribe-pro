// =============================================================
// Filled Contract Generator
//
// Takes a TemplateContent + user-filled values and produces a
// professional bilingual .docx with real legal clauses and
// substituted placeholders.
//
// Output structure:
//   - Cover page (title + subtitle + date)
//   - Per-clause two-column table (EN left, AR right)
//     • Heading row (bold)
//     • Paragraph rows (regular text)
//     • All {token} substitutions applied
//   - Disclaimer footer
//
// Required deps: docx, file-saver
// =============================================================

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  PageOrientation,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { ContractTemplate } from "@/lib/templates";
import type { TemplateContent, TemplateField } from "@/lib/templateContent/types";

// ── Fonts and helpers ────────────────────────────────────────────
const AR_FONT = "Arial"; // ships with every Word install, solid Arabic glyphs
const EN_FONT = "Calibri";

const enRun = (text: string, opts: { bold?: boolean; size?: number } = {}) =>
  new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 22,
    font: { name: EN_FONT },
  });

const arRun = (text: string, opts: { bold?: boolean; size?: number } = {}) =>
  new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 22,
    font: { name: AR_FONT },
    rightToLeft: true,
  });

// Format a value based on the field schema
function formatValue(field: TemplateField, raw: string): string {
  if (!raw) return raw;
  if (field.type === "date") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }
  if (field.type === "currency-omr") {
    const n = Number(raw);
    if (!Number.isNaN(n)) {
      return n.toLocaleString("en-OM", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
  }
  if (field.type === "select" && field.options) {
    // Replace stored value with the human label
    const match = field.options.find((o) => o.value === raw);
    if (match) return match.labelEn;
  }
  return raw;
}

function formatValueAr(field: TemplateField, raw: string): string {
  if (!raw) return raw;
  if (field.type === "date") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("ar-OM", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }
  if (field.type === "currency-omr") {
    const n = Number(raw);
    if (!Number.isNaN(n)) {
      return n.toLocaleString("ar-OM", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
  }
  if (field.type === "select" && field.options) {
    const match = field.options.find((o) => o.value === raw);
    if (match) return match.labelAr;
  }
  return raw;
}

// Substitute all {key} tokens in text using the fields/values mapping
function substitute(
  text: string,
  fields: TemplateField[],
  values: Record<string, string>,
  lang: "en" | "ar"
): string {
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (full, key) => {
    const field = fields.find((f) => f.key === key);
    const raw = values[key] ?? "";
    if (!field) return raw || full;
    return (lang === "ar" ? formatValueAr : formatValue)(field, raw);
  });
}

// ── Table cell helpers ──────────────────────────────────────────
function headingCell(text: string, lang: "en" | "ar"): TableCell {
  const isAr = lang === "ar";
  return new TableCell({
    width: { size: 49, type: WidthType.PERCENTAGE },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isAr,
        spacing: { after: 80 },
        children: [(isAr ? arRun : enRun)(text, { bold: true, size: 24 })],
      }),
    ],
  });
}

function bodyCell(paragraphs: string[], lang: "en" | "ar"): TableCell {
  const isAr = lang === "ar";
  return new TableCell({
    width: { size: 49, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: paragraphs.map(
      (p) =>
        new Paragraph({
          alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isAr,
          spacing: { after: 100 },
          children: [(isAr ? arRun : enRun)(p, { size: 20 })],
        })
    ),
  });
}

function spacerCell(): TableCell {
  return new TableCell({
    width: { size: 2, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [] })],
  });
}

// ── Build the document ──────────────────────────────────────────
export async function generateFilledContract(
  template: ContractTemplate,
  content: TemplateContent,
  values: Record<string, string>
): Promise<Blob> {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // — Cover —
  const cover: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [enRun(template.titleEn.toUpperCase(), { bold: true, size: 40 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 160 },
      children: [arRun(template.titleAr, { bold: true, size: 40 })],
    }),
  ];
  if (content.subtitleEn) {
    cover.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [enRun(content.subtitleEn, { size: 20 })],
      })
    );
  }
  if (content.subtitleAr) {
    cover.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        spacing: { after: 200 },
        children: [arRun(content.subtitleAr, { size: 20 })],
      })
    );
  }
  cover.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [enRun(`Date / التاريخ: ${today}`, { size: 20 })],
    })
  );

  // — One table row per clause: heading row + body row —
  const rows: TableRow[] = [];
  for (const clause of content.clauses) {
    const headEn = substitute(clause.headingEn, content.fields, values, "en");
    const headAr = substitute(clause.headingAr, content.fields, values, "ar");
    rows.push(
      new TableRow({
        tableHeader: false,
        children: [
          headingCell(headEn, "en"),
          spacerCell(),
          headingCell(headAr, "ar"),
        ],
      })
    );

    const bodyEn = clause.paragraphsEn.map((p) =>
      substitute(p, content.fields, values, "en")
    );
    const bodyAr = clause.paragraphsAr.map((p) =>
      substitute(p, content.fields, values, "ar")
    );
    rows.push(
      new TableRow({
        children: [bodyCell(bodyEn, "en"), spacerCell(), bodyCell(bodyAr, "ar")],
      })
    );
  }

  const clausesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:              { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom:           { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left:             { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right:            { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows,
  });

  // — Disclaimer —
  const disclaimer: Paragraph[] = [
    new Paragraph({ children: [enRun("", { size: 20 })], spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        enRun(
          "This template is provided for general informational purposes only and does not constitute legal advice. Consult a licensed attorney for advice specific to your situation.",
          { size: 14 }
        ),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 80 },
      children: [
        arRun(
          "هذا النموذج مقدم لأغراض إعلامية عامة فقط ولا يشكل استشارة قانونية. استشر محامياً مرخصاً للحصول على نصيحة خاصة بحالتك.",
          { size: 14 }
        ),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [
        enRun("Generated by Contract Scribe Pro · contractscribepro.com", { size: 14 }),
      ],
    }),
  ];

  const doc = new Document({
    creator: "Contract Scribe Pro",
    title: template.titleEn,
    description: template.descEn,
    styles: {
      default: {
        document: { run: { font: EN_FONT, size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children: [...cover, clausesTable, ...disclaimer],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export async function downloadFilledContract(
  template: ContractTemplate,
  content: TemplateContent,
  values: Record<string, string>
): Promise<void> {
  const blob = await generateFilledContract(template, content, values);
  const filename = `${template.id}-contract-${Date.now()}.docx`;
  saveAs(blob, filename);
}
