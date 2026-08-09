// =============================================================
// Bring Your Own Format — placeholder detection
//
// Deterministic, no model call. Every hit is a SUGGESTION: nothing
// becomes a placeholder until the user confirms it, so the cost of a
// false positive is one tap, and the cost of a miss is a manual add.
// That asymmetry is why the patterns below lean inclusive.
//
// Rules run in priority order and later rules cannot claim characters
// an earlier rule already took, so "9 August 2026" is a date, not a
// stray amount.
// =============================================================

import type { DocxParagraph } from "./tagDocx";

export interface FieldSuggestion {
  /** Token written into the docx: {field} */
  field: string;
  labelAr: string;
  labelEn: string;
  /** The exact text matched in the original — doubles as the sample value */
  sample: string;
  /** Every place this exact text occurs; all are tagged with one field */
  spans: { paragraphIndex: number; start: number; end: number }[];
  /** True when the user added it by hand rather than detection */
  manual?: boolean;
}

interface Rule {
  base: string;
  labelAr: string;
  labelEn: string;
  find: (text: string) => { start: number; end: number }[];
}

const AR_DIGITS = "٠-٩";
const MONTHS_EN =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const MONTHS_AR =
  "يناير|فبراير|مارس|أبريل|إبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر";

/** Collect every match of a global regex, optionally a capture group. */
function matches(text: string, re: RegExp, group = 0): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex += 1;
      continue;
    }
    const value = group === 0 ? m[0] : m[group];
    if (!value) continue;
    const offset = group === 0 ? 0 : m[0].indexOf(value);
    out.push({ start: m.index + offset, end: m.index + offset + value.length });
  }
  return out;
}

/** Find a number that sits just after one of the given labels. */
function afterLabel(
  text: string,
  labelRe: RegExp,
  valueRe: RegExp,
  window = 60,
): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  labelRe.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = labelRe.exec(text)) !== null) {
    const from = m.index + m[0].length;
    const slice = text.slice(from, from + window);
    const v = new RegExp(valueRe.source, valueRe.flags.replace("g", "")).exec(slice);
    if (v) out.push({ start: from + v.index, end: from + v.index + v[0].length });
  }
  return out;
}

const RULES: Rule[] = [
  {
    base: "date",
    labelAr: "التاريخ",
    labelEn: "Date",
    find: (t) => [
      // ٩ أغسطس ٢٠٢٦م
      ...matches(t, new RegExp(`[${AR_DIGITS}]{1,2}\\s+(?:${MONTHS_AR})\\s+[${AR_DIGITS}]{4}\\s*م?`, "g")),
      // 9 August 2026 / 9 أغسطس 2026
      ...matches(t, new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS_EN}|${MONTHS_AR})\\s+\\d{4}\\b`, "g")),
      // 09/08/2026, 9-8-2026, 31 / 12 / 2026م
      ...matches(t, /\b\d{1,2}\s*[/\-.]\s*\d{1,2}\s*[/\-.]\s*\d{2,4}\s*م?/g),
      ...matches(t, new RegExp(`[${AR_DIGITS}]{1,2}\\s*[/\\-]\\s*[${AR_DIGITS}]{1,2}\\s*[/\\-]\\s*[${AR_DIGITS}]{2,4}`, "g")),
    ],
  },
  {
    base: "cr_number",
    labelAr: "رقم السجل التجاري",
    labelEn: "Commercial Registration No.",
    // Real letters spell this label a dozen ways: "رقم السجل التجاري",
    // "سجل تجاري رقم", the bare abbreviation "س.ت" (with or without dots
    // or spaces), "C.R.", "CR No", "CR:". Miss the label and the number
    // is never offered as a field, which is the whole point of the rule.
    find: (t) =>
      afterLabel(
        t,
        // The bare "س.ت" needs Arabic-letter boundaries: without them it
        // matches the "ست" inside ordinary words like استكمال and would
        // drag an unrelated number into the field.
        new RegExp(
          "(?:(?:ال)?سجل\\s*(?:ال)?تجاري" +
            "|(?<![\\u0600-\\u06FF])س\\s*\\.?\\s*ت\\s*\\.?(?![\\u0600-\\u06FF])" +
            "|\\bC\\s*\\.?\\s*R\\s*\\.?(?:\\s*(?:No|Number)\\s*\\.?)?" +
            "|\\bCommercial\\s+Registration(?:\\s+(?:No|Number)\\s*\\.?)?)",
          "gi",
        ),
        new RegExp(`\\d{6,8}|[${AR_DIGITS}]{6,8}`),
      ),
  },
  {
    base: "amount",
    labelAr: "المبلغ",
    labelEn: "Amount",
    find: (t) => [
      // 443.191 ريال عماني  |  443.191 OMR
      ...matches(t, new RegExp(`([\\d${AR_DIGITS}][\\d${AR_DIGITS},.]*)\\s*(?:ريال\\s*عماني|ر\\.ع\\.?|OMR|R\\.O\\.?)`, "gi"), 1),
      // OMR 443.191
      ...matches(t, new RegExp(`(?:OMR|ر\\.ع\\.?|ريال\\s*عماني)\\s*([\\d${AR_DIGITS}][\\d${AR_DIGITS},.]*)`, "gi"), 1),
    ],
  },
  {
    base: "phone",
    labelAr: "رقم التواصل",
    labelEn: "Contact Number",
    find: (t) => [
      ...matches(t, /(?<![\d])[97]\d{7}(?![\d])/g),
      ...matches(t, new RegExp(`(?<![${AR_DIGITS}])[٩٧][${AR_DIGITS}]{7}(?![${AR_DIGITS}])`, "g")),
    ],
  },
  {
    base: "applicant_name",
    labelAr: "اسم مقدم الطلب",
    labelEn: "Applicant Name",
    find: (t) => {
      const out: { start: number; end: number }[] = [];
      const labelRe = /(?:مقدم\s+الطلب|الاسم|Applicant(?:\s+Name)?|Name)\s*[:：]\s*/g;
      let m: RegExpExecArray | null;
      while ((m = labelRe.exec(t)) !== null) {
        const from = m.index + m[0].length;
        const rest = t.slice(from);
        // To end of line, or the next labelled field on the same line.
        const stop = rest.search(/\s{3,}|[|]|$/);
        const value = rest.slice(0, stop === -1 ? rest.length : stop).trim();
        if (value.length >= 2 && value.length <= 80) {
          out.push({ start: from, end: from + value.length });
        }
      }
      return out;
    },
  },
  {
    base: "company_name",
    labelAr: "اسم الشركة",
    labelEn: "Company Name",
    find: (t) => [
      ...matches(t, /(?:شركة|مؤسسة)\s[^\n]{1,60}?\s*(?:ش\.م\.م|ش\.ش\.و|ش\.م\.ع\.م)/g),
      ...matches(t, /\b[A-Z][A-Za-z&.\-' ]{2,60}?\s(?:LLC|SPC|SAOC|SAOG)\b/g),
    ],
  },
];

const overlaps = (
  a: { start: number; end: number },
  b: { start: number; end: number },
) => a.start < b.end && b.start < a.end;

/**
 * Scan the body paragraphs and propose placeholders.
 *
 * Identical matched text collapses into ONE field that fills every
 * occurrence — a date printed twice is one question to the user, not two.
 */
export function detectPlaceholders(paragraphs: DocxParagraph[]): FieldSuggestion[] {
  // sample text -> suggestion, so repeats merge
  const bySample = new Map<string, FieldSuggestion>();
  const usedBase = new Map<string, number>();

  for (const para of paragraphs) {
    const claimed: { start: number; end: number }[] = [];

    for (const rule of RULES) {
      let hits: { start: number; end: number }[] = [];
      try {
        hits = rule.find(para.text);
      } catch {
        hits = []; // a pathological paragraph must not kill the whole scan
      }

      for (const hit of hits.sort((a, b) => a.start - b.start)) {
        if (hit.end <= hit.start) continue;
        if (claimed.some((c) => overlaps(c, hit))) continue;

        const sample = para.text.slice(hit.start, hit.end).trim();
        if (!sample) continue;

        // Re-derive exact bounds after trimming so the tag replaces the
        // value and not the whitespace around it.
        const lead = para.text.slice(hit.start, hit.end).indexOf(sample);
        const start = hit.start + (lead < 0 ? 0 : lead);
        const end = start + sample.length;

        claimed.push({ start, end });

        const existing = bySample.get(sample);
        if (existing) {
          existing.spans.push({ paragraphIndex: para.index, start, end });
          continue;
        }

        const n = (usedBase.get(rule.base) ?? 0) + 1;
        usedBase.set(rule.base, n);
        bySample.set(sample, {
          field: n === 1 ? rule.base : `${rule.base}_${n}`,
          labelAr: n === 1 ? rule.labelAr : `${rule.labelAr} ${n}`,
          labelEn: n === 1 ? rule.labelEn : `${rule.labelEn} ${n}`,
          sample,
          spans: [{ paragraphIndex: para.index, start, end }],
        });
      }
    }
  }

  return [...bySample.values()];
}

/**
 * Add a placeholder for text the user picked out themselves. Matches every
 * occurrence of the exact string, so one manual add covers repeats too.
 */
export function manualSuggestion(
  paragraphs: DocxParagraph[],
  text: string,
  field: string,
  labelAr: string,
  labelEn: string,
): FieldSuggestion | null {
  const needle = text.trim();
  if (!needle) return null;

  const spans: FieldSuggestion["spans"] = [];
  for (const para of paragraphs) {
    let from = 0;
    for (;;) {
      const at = para.text.indexOf(needle, from);
      if (at === -1) break;
      spans.push({ paragraphIndex: para.index, start: at, end: at + needle.length });
      from = at + needle.length;
    }
  }

  if (!spans.length) return null;
  return { field, labelAr, labelEn, sample: needle, spans, manual: true };
}

/** Token names must be docxtemplater-safe and unique. */
export function normalizeFieldName(raw: string, taken: Set<string>): string {
  let base = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!base) base = "field";

  let name = base;
  let n = 2;
  while (taken.has(name)) name = `${base}_${n++}`;
  return name;
}
