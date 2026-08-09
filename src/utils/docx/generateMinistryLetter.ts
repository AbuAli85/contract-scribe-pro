// =============================================================
// Ministry Letter — .docx Generator (LOCKED LAYOUT)
//
// Approved sample: SPF installment letter, Aug 2026.
// The layout below is the permanent standard for ALL letters to
// Oman government authorities. DO NOT restyle — only placeholder
// values change.
//
// Layout rules (verified against the approved sample):
//   • NO letterhead block — printed on company letterhead paper
//     (top margin 2160 twips leaves the space).
//   • Times New Roman, 12pt body, 1.5 line, justified,
//     bidirectional on every paragraph.
//   • AlignmentType.START = visual RIGHT in RTL paragraphs
//     (RIGHT can flip to the left — verified empirically).
//   • Addressee spread across the line via a borderless 3-cell
//     table: الفاضل / {title} … المحترم (المحترم at far left).
//   • Subject: visual right, bold + underlined.
//   • Signature block centered. No attachments section by default.
// =============================================================

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { MinistryAuthority, MinistryLetterType, LetterValues } from "@/lib/ministryLetters/types";

const FONT = { ascii: "Times New Roman", hAnsi: "Times New Roman", cs: "Times New Roman" } as const;

interface RunOpts {
  size?: number;
  bold?: boolean;
  underline?: boolean;
}
const run = (text: string, o: RunOpts = {}) =>
  new TextRun({
    text,
    rightToLeft: true,
    font: FONT,
    size: o.size ?? 24,
    bold: !!o.bold,
    underline: o.underline ? { type: UnderlineType.SINGLE } : undefined,
  });

interface ParaOpts extends RunOpts {
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  after?: number;
}
const p = (text: string, o: ParaOpts = {}) =>
  new Paragraph({
    bidirectional: true,
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 160, line: 360 },
    children: [run(text, o)],
  });

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const borders = {
  top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder,
} as const;

const cell = (text: string, align: ParaOpts["align"], bold: boolean) =>
  new TableCell({
    borders,
    width: { size: 33, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        bidirectional: true,
        alignment: align,
        spacing: { after: 0, line: 360 },
        children: [run(text, { bold })],
      }),
    ],
  });

/** Arabic date with Arabic-Indic digits, e.g. ٩ أغسطس ٢٠٢٦م */
export function arabicDateToday(): string {
  const s = new Intl.DateTimeFormat("ar-OM-u-nu-arab", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
  return `${s}م`;
}

/** Replace {tokens} in a template string from the values map */
function fill(template: string, values: LetterValues): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? "");
}

export interface MinistryLetterInput {
  authority: MinistryAuthority;
  letterType: MinistryLetterType;
  values: LetterValues;
  /** Override the auto date if needed */
  dateAr?: string;
}

export function buildMinistryLetterDoc({ authority, letterType, values, dateAr }: MinistryLetterInput): Document {
  const computed: LetterValues = {
    ...values,
    authority_praise: authority.praiseAr,
    authority_law_clause: authority.lawAr ?? "الأنظمة واللوائح المعمول بها لديكم",
  };

  const subject = fill(letterType.subjectAr, computed);
  const bodyParas = letterType.bodyAr.map((t) => fill(t, computed)).filter((t) => t.trim().length > 0);

  const children: (Paragraph | Table)[] = [
    p(`التاريخ: ${dateAr ?? arabicDateToday()}`, { align: AlignmentType.START, after: 240 }),
    new Table({
      visuallyRightToLeft: true,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [
        new TableRow({
          children: [
            cell(`الفاضل / ${authority.recipientTitleAr}`, AlignmentType.START, true),
            cell("...", AlignmentType.CENTER, false),
            cell("المحترم", AlignmentType.LEFT, true),
          ],
        }),
      ],
    }),
    p(authority.nameAr, { align: AlignmentType.START, bold: true, after: 480 }),
    p("السلام عليكم ورحمة الله وبركاته،", { align: AlignmentType.START, after: 240 }),
    p(`الموضوع: ${subject}`, { align: AlignmentType.START, bold: true, underline: true, after: 300 }),
    ...bodyParas.map((t) => p(t)),
    p("شاكرين لكم حسن تعاونكم وتفهمكم،", { after: 120 }),
    p("وتفضلوا بقبول فائق الاحترام والتقدير،", { after: 720 }),
    p(`مقدم الطلب: ${computed.applicant_name ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p(`الصفة: ${computed.applicant_capacity ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p(`رقم التواصل: ${computed.applicant_phone ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p("التوقيع والختم:", { align: AlignmentType.CENTER, after: 160 }),
  ];

  return new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 2160, bottom: 1080, left: 1080, right: 1080 } },
        },
        children,
      },
    ],
  });
}

/** Generate and trigger browser download */
export async function downloadMinistryLetter(input: MinistryLetterInput): Promise<void> {
  const doc = buildMinistryLetterDoc(input);
  const blob = await Packer.toBlob(doc);
  const safeSubject = fill(input.letterType.subjectAr, input.values).replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
  saveAs(blob, `${safeSubject || input.letterType.titleAr}.docx`);
}
