// =============================================================
// Ministry Letter — .docx Generator (LOCKED LAYOUT)
//
// Approved sample: SPF installment letter, Aug 2026.
// The layout below is the permanent standard for ALL letters to
// Oman government authorities. DO NOT restyle — only placeholder
// values change.
//
// Arabic layout rules (verified against the approved sample):
//   • NO letterhead block — printed on company letterhead paper
//     (top margin 2160 twips leaves the space).
//   • Times New Roman, 12pt body, 1.5 line, justified,
//     bidirectional on every paragraph.
//   • AlignmentType.START = visual RIGHT in RTL paragraphs
//     (RIGHT can flip to the left — verified empirically).
//   • Addressee spread across the line via a borderless 3-cell
//     table: {composed title} … {closing} (closing at far left). Both the
//     title's honorific and the closing are data-driven (Addressing
//     Protocol v1.0) — the renderer no longer hardcodes «الفاضل /» or
//     «المحترم».
//   • subject: CENTER (owner-approved 2026-08-10) — bold + underlined.
//   • Signature block centered. No attachments section by default.
//
// English layout (Sprint 2) is the SAME page — A4, Times New Roman
// 12pt, 1.5 line, 2160-twip letterhead margin, centered signature —
// mirrored to LTR. The Arabic path is frozen: every Arabic paragraph
// is built exactly as before, so Arabic output is unchanged.
//
// mirrored to LTR — except the subject, which is centred in both
// languages (owner-approved 2026-08-10).
//
// Addressee, English: a single bold left-aligned "To: {title}" over
// the authority name, NOT the mirrored 3-cell table. The Arabic
// الفاضل … المحترم pair is an Arabic correspondence convention; its
// literal mirror ("Dear …" / "Respected,") reads as a mistranslation
// to an English reader and Word leaves a visible cell gap across the
// line. "To:" is the standard formal English opening and renders flat.
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
// Through the barrel, never into L0's individual files: index.ts IS the
// layer's contract surface, so L0 stays free to reshuffle its internals
// (split letterTypes.ts, add skeletons/) without touching this file.
import { authorityCode, TOKEN_VALUE_EN } from "@/lib/ministryLetters";
import type {
  LetterLanguage,
  LetterValues,
  MinistryAuthority,
  MinistryLetterType,
} from "@/lib/ministryLetters";

const FONT = { ascii: "Times New Roman", hAnsi: "Times New Roman", cs: "Times New Roman" } as const;

interface RunOpts {
  size?: number;
  bold?: boolean;
  underline?: boolean;
  /** Defaults to true — the Arabic path relies on that default. */
  rtl?: boolean;
}
const run = (text: string, o: RunOpts = {}) =>
  new TextRun({
    text,
    rightToLeft: o.rtl ?? true,
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

// ---------------------------------------------------------------
// English paragraphs
// ---------------------------------------------------------------

// Escapes, not literals: the ranges end at U+FEFF, which is invisible
// whitespace in source and trips no-irregular-whitespace.
const AR = "\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF";
const ARABIC_CHAR = new RegExp(`[${AR}]`);
/** An Arabic phrase: Arabic words plus the spaces/punctuation between them. */
const ARABIC_PHRASE = new RegExp(
  `[${AR}]+(?:[\\s\\u060C\\u061B.\\u066B\\u066C-]+[${AR}]+)*`,
  "g",
);

/**
 * An Arabic company name dropped into an English sentence has to be its
 * own run marked rightToLeft, otherwise Word applies the paragraph's LTR
 * direction to it and the surrounding English scrambles around it. Split
 * the text into Arabic and non-Arabic segments and mark each correctly.
 */
function englishRuns(text: string, o: RunOpts): TextRun[] {
  if (!ARABIC_CHAR.test(text)) return [run(text, { ...o, rtl: false })];

  const runs: TextRun[] = [];
  let cursor = 0;
  for (const match of text.matchAll(ARABIC_PHRASE)) {
    const start = match.index ?? 0;
    if (start > cursor) runs.push(run(text.slice(cursor, start), { ...o, rtl: false }));
    runs.push(run(match[0], { ...o, rtl: true }));
    cursor = start + match[0].length;
  }
  if (cursor < text.length) runs.push(run(text.slice(cursor), { ...o, rtl: false }));
  return runs;
}

const pEn = (text: string, o: ParaOpts = {}) =>
  new Paragraph({
    bidirectional: false,
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 160, line: 360 },
    children: englishRuns(text, o),
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

/** Gregorian date in Western digits, e.g. 9 August 2026 */
export function englishDateToday(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date());
}

/** Replace {tokens} in a template string from the values map */
function fill(template: string, values: LetterValues): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => values[key] ?? "");
}

export interface MinistryLetterInput {
  authority: MinistryAuthority;
  letterType: MinistryLetterType;
  values: LetterValues;
  /** Output language. Defaults to Arabic — the approved original. */
  language?: LetterLanguage;
  /** Override the auto date if needed */
  dateAr?: string;
  dateEn?: string;
  /**
   * Arabic third-cell closing honorific («المحترم» / «الموقر»). Data-driven
   * from the chosen addressee (Addressing Protocol v1.0). Defaults to
   * «المحترم» — the value hardcoded before the protocol. Arabic only; the
   * English layout has no closing cell.
   */
  closingAr?: string;
}

export function buildMinistryLetterDoc({
  authority, letterType, values, language = "ar", dateAr, dateEn, closingAr,
}: MinistryLetterInput): Document {
  const children: (Paragraph | Table)[] =
    language === "en"
      ? buildEnglishBody({ authority, letterType, values, dateEn })
      : buildArabicBody({ authority, letterType, values, dateAr, closingAr });

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

// ---------------------------------------------------------------
// Arabic — approved Aug 2026, frozen. Do not restyle.
// ---------------------------------------------------------------
function buildArabicBody({
  authority, letterType, values, dateAr, closingAr,
}: Omit<MinistryLetterInput, "language">): (Paragraph | Table)[] {
  const computed: LetterValues = {
    ...values,
    authority_praise: authority.praiseAr,
    authority_law_clause: authority.lawAr ?? "الأنظمة واللوائح المعمول بها لديكم",
  };

  const subject = fill(letterType.subjectAr, computed);
  const bodyParas = letterType.bodyAr.map((t) => fill(t, computed)).filter((t) => t.trim().length > 0);

  return [
    p(`التاريخ: ${dateAr ?? arabicDateToday()}`, { align: AlignmentType.START, after: 240 }),
    new Table({
      visuallyRightToLeft: true,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [
        new TableRow({
          children: [
            // Addressee and closing are now data-driven (Addressing Protocol
            // v1.0): the composed title carries its own honorific, and the
            // third cell prints the addressee's closing. No «الفاضل /» prefix,
            // no hardcoded «المحترم».
            cell(authority.recipientTitleAr, AlignmentType.START, true),
            cell("...", AlignmentType.CENTER, false),
            cell(closingAr ?? "المحترم", AlignmentType.LEFT, true),
          ],
        }),
      ],
    }),
    p(authority.nameAr, { align: AlignmentType.START, bold: true, after: 480 }),
    p("السلام عليكم ورحمة الله وبركاته،", { align: AlignmentType.START, after: 240 }),
    p(`الموضوع: ${subject}`, { align: AlignmentType.CENTER, bold: true, underline: true, after: 300 }),
    ...bodyParas.map((t) => p(t)),
    p("شاكرين لكم حسن تعاونكم وتفهمكم،", { after: 120 }),
    p("وتفضلوا بقبول فائق الاحترام والتقدير،", { after: 720 }),
    p(`مقدم الطلب: ${computed.applicant_name ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p(`الصفة: ${computed.applicant_capacity ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p(`رقم التواصل: ${computed.applicant_phone ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    p("التوقيع والختم:", { align: AlignmentType.CENTER, after: 160 }),
  ];
}

// ---------------------------------------------------------------
// English — same page, mirrored to LTR, no Arabic greeting line.
// ---------------------------------------------------------------
function buildEnglishBody({
  authority, letterType, values, dateEn,
}: Omit<MinistryLetterInput, "language">): (Paragraph | Table)[] {
  // Select options and seeded defaults are stored in Arabic; render the
  // English equivalent so an English letter never carries a stray Arabic
  // word. Free text the user typed is left exactly as written.
  const translated: LetterValues = {};
  for (const [key, value] of Object.entries(values)) {
    translated[key] = TOKEN_VALUE_EN[value] ?? value;
  }

  const computed: LetterValues = {
    ...translated,
    authority_praise: authority.praiseEn,
    authority_law_clause: authority.lawEn ?? "the regulations in force at your good offices",
  };

  const subject = fill(letterType.subjectEn, computed);
  const bodyParas = letterType.bodyEn.map((t) => fill(t, computed)).filter((t) => t.trim().length > 0);

  return [
    pEn(`Date: ${dateEn ?? englishDateToday()}`, { align: AlignmentType.LEFT, after: 240 }),
    pEn(`To: ${authority.recipientTitleEn}`, { align: AlignmentType.LEFT, bold: true, after: 0 }),
    pEn(authority.nameEn, { align: AlignmentType.LEFT, bold: true, after: 480 }),
    pEn(`Subject: ${subject}`, {
      align: AlignmentType.CENTER, bold: true, underline: true, after: 300,
    }),
    ...bodyParas.map((t) => pEn(t)),
    pEn("Thanking you for your kind cooperation and understanding,", { after: 120 }),
    pEn("Please accept our highest respect and appreciation,", { after: 720 }),
    pEn(`Applicant: ${computed.applicant_name ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    pEn(`Capacity: ${computed.applicant_capacity ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    pEn(`Contact Number: ${computed.applicant_phone ?? ""}`, { align: AlignmentType.CENTER, after: 160 }),
    pEn("Signature & Stamp:", { align: AlignmentType.CENTER, after: 160 }),
  ];
}

/** Windows-safe file name, e.g. Installment_Request_SPF.docx */
export function ministryLetterFileName(input: MinistryLetterInput): string {
  const strip = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").trim();

  if (input.language === "en") {
    // Titles carry UI hints — "Custom Letter (describe it)" must not become
    // part of the file the user sends to a ministry.
    const title = strip(input.letterType.titleEn)
      .replace(/\([^)]*\)/g, " ")
      .replace(/[^A-Za-z0-9-]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return `${title || "Letter"}_${authorityCode(input.authority.id)}.docx`;
  }

  const subject = strip(fill(input.letterType.subjectAr, input.values)).slice(0, 60);
  return `${subject || input.letterType.titleAr}.docx`;
}

/** Generate and trigger browser download */
export async function downloadMinistryLetter(input: MinistryLetterInput): Promise<void> {
  const doc = buildMinistryLetterDoc(input);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, ministryLetterFileName(input));
}
