// =============================================================
// Template Engine — placeholder detection + .docx merging +
// AI-powered ingestion (delegates to detect-template-fields).
// =============================================================

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceholderField {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "email" | "textarea";
  required: boolean;
}

export interface ScanResult {
  fields: PlaceholderField[];
  rawTokens: string[];
  totalTokens: number;
}

const DATE_HINTS = /(date|start|end|expiry|expires|dob|birthday|joining)/i;
const NUMBER_HINTS = /(salary|amount|rate|count|quantity|qty|years|age|months|days|fee)/i;
const EMAIL_HINTS = /(email|e_?mail)/i;
const LONG_HINTS = /(address|description|notes|terms|clause|paragraph|details)/i;

function inferType(key: string): PlaceholderField["type"] {
  if (DATE_HINTS.test(key)) return "date";
  if (NUMBER_HINTS.test(key)) return "number";
  if (EMAIL_HINTS.test(key)) return "email";
  if (LONG_HINTS.test(key)) return "textarea";
  return "text";
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function scanTemplate(file: File | Blob): Promise<ScanResult> {
  const buf = await file.arrayBuffer();
  const zip = new PizZip(buf);

  const sources = [
    "word/document.xml",
    "word/header1.xml",
    "word/header2.xml",
    "word/header3.xml",
    "word/footer1.xml",
    "word/footer2.xml",
    "word/footer3.xml",
  ];

  let combinedText = "";
  for (const path of sources) {
    const entry = zip.file(path);
    if (entry) {
      const raw = entry.asText();
      const stripped = raw.replace(/<[^>]+>/g, "");
      combinedText += stripped + "\n";
    }
  }

  const tokenRe = /\{+([a-zA-Z][a-zA-Z0-9_\- ]{0,60})\}+/g;
  const rawTokens: string[] = [];
  const seen = new Set<string>();
  const fields: PlaceholderField[] = [];

  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(combinedText)) !== null) {
    const tokenRaw = match[1].trim();
    const key = tokenRaw.replace(/\s+/g, "_").toLowerCase();
    rawTokens.push(tokenRaw);
    if (seen.has(key)) continue;
    seen.add(key);
    fields.push({
      key,
      label: humanizeKey(key),
      type: inferType(key),
      required: true,
    });
  }

  return { fields, rawTokens, totalTokens: rawTokens.length };
}

export interface MergeOptions {
  download?: boolean;
  filename?: string;
}

function isDuplicateTagError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;

  const hasDupOpen = (sub: unknown): boolean => {
    if (!sub || typeof sub !== "object") return false;
    const s = sub as Record<string, unknown>;
    const id = (s.properties as Record<string, unknown>)?.id;
    return id === "duplicate_open_tag" || id === "duplicate_close_tag";
  };

  // Single error at top level
  if (hasDupOpen(e)) return true;

  // Multi-error: properties.errors  (standard docxtemplater format)
  const propErrors = (e.properties as Record<string, unknown>)?.errors;
  if (Array.isArray(propErrors) && (propErrors as unknown[]).some(hasDupOpen)) return true;

  // Multi-error: top-level errors array
  if (Array.isArray(e.errors) && (e.errors as unknown[]).some(hasDupOpen)) return true;

  // Multi-error: top-level error array (seen when the thrown value is {error:[...]})
  if (Array.isArray(e.error) && (e.error as unknown[]).some(hasDupOpen)) return true;

  return false;
}

// ── XML run-merger: fixes {{tags}} split across <w:t> elements by Word ──

function countUnbalancedOpens(text: string, start: string, end: string): number {
  let depth = 0, i = 0;
  while (i < text.length) {
    if (text.startsWith(start, i)) { depth++; i += start.length; }
    else if (text.startsWith(end, i)) { depth--; i += end.length; }
    else i++;
  }
  return depth;
}

function hasTrailingPartialDelimiter(text: string, delim: string): boolean {
  for (let n = delim.length - 1; n >= 1; n--) {
    if (text.endsWith(delim.slice(0, n))) return true;
  }
  return false;
}

function fixXmlRuns(xml: string, startDelim: string, endDelim: string): string {
  const RE = /(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;
  type Wt = { idx: number; len: number; open: string; text: string };
  const wts: Wt[] = [];
  let m: RegExpExecArray | null;
  while ((m = RE.exec(xml)) !== null) {
    wts.push({ idx: m.index, len: m[0].length, open: m[1], text: m[2] });
  }

  const groups: Wt[][] = [];
  let i = 0;
  while (i < wts.length) {
    const wt = wts[i];
    const unbal = countUnbalancedOpens(wt.text, startDelim, endDelim);
    const partial = hasTrailingPartialDelimiter(wt.text, startDelim);
    if (unbal > 0 || partial) {
      const group: Wt[] = [wt];
      let depth = Math.max(unbal, partial ? 1 : 0);
      for (let j = i + 1; j < wts.length && depth > 0; j++) {
        group.push(wts[j]);
        depth += countUnbalancedOpens(wts[j].text, startDelim, endDelim);
      }
      if (group.length > 1) {
        groups.push(group);
        i += group.length;
        continue;
      }
    }
    i++;
  }

  if (groups.length === 0) return xml;

  let result = xml;
  for (let g = groups.length - 1; g >= 0; g--) {
    const group = groups[g];
    const first = group[0], last = group[group.length - 1];
    const mergedText = group.map(w => w.text).join("");
    const hasPreserve = group.some(w => w.open.includes("preserve"));
    const openTag = hasPreserve ? '<w:t xml:space="preserve">' : "<w:t>";
    result =
      result.slice(0, first.idx) +
      `${openTag}${mergedText}</w:t>` +
      result.slice(last.idx + last.len);
  }
  return result;
}

function fixDocxXmlRuns(zip: PizZip, startDelim: string, endDelim: string): void {
  const FILES = [
    "word/document.xml",
    "word/header1.xml", "word/header2.xml", "word/header3.xml",
    "word/footer1.xml", "word/footer2.xml", "word/footer3.xml",
  ];
  for (const path of FILES) {
    const f = zip.file(path);
    if (f) zip.file(path, fixXmlRuns(f.asText(), startDelim, endDelim));
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function mergeTemplate(
  file: File | Blob | ArrayBuffer,
  values: Record<string, unknown>,
  options: MergeOptions = {}
): Promise<Blob> {
  const buf = file instanceof ArrayBuffer ? file : await file.arrayBuffer();

  const data: Record<string, unknown> = { ...values };
  for (const [k, v] of Object.entries(values)) {
    const alt = k.replace(/_/g, " ");
    if (!(alt in data)) data[alt] = v;
  }

  const tryMerge = (delimiters: { start: string; end: string }): Blob => {
    const zip = new PizZip(buf);
    fixDocxXmlRuns(zip, delimiters.start, delimiters.end);
    const doc = new Docxtemplater(zip, {
      delimiters,
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });
    doc.render(data);
    return doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE",
    });
  };

  let blob: Blob;
  try {
    blob = tryMerge({ start: "{", end: "}" });
  } catch (err) {
    if (isDuplicateTagError(err)) {
      // Document uses {{double_braces}} — retry with Mustache-style delimiters
      blob = tryMerge({ start: "{{", end: "}}" });
    } else {
      throw err;
    }
  }

  if (options.download !== false) {
    saveAs(blob, options.filename ?? "filled-contract.docx");
  }

  return blob;
}

export async function extractTextFromDocx(
  file: File | Blob
): Promise<string> {
  const buf = await file.arrayBuffer();
  const zip = new PizZip(buf);
  const sources = [
    "word/document.xml",
    "word/header1.xml",
    "word/header2.xml",
    "word/header3.xml",
    "word/footer1.xml",
    "word/footer2.xml",
    "word/footer3.xml",
  ];
  let combined = "";
  for (const path of sources) {
    const entry = zip.file(path);
    if (entry) {
      const raw = entry
        .asText()
        .replace(/<\/w:p>/g, "</w:p>\n")
        .replace(/<w:br[^>]*\/?>/g, "\n");
      combined += raw.replace(/<[^>]+>/g, "") + "\n";
    }
  }
  return combined
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

// ─── AI ingestion result types ───────────────────────────────

export type AiFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency-omr"
  | "date"
  | "select"
  | "email"
  | "phone";

export interface AiTemplateField {
  key: string;
  group: string;
  groupAr: string;
  labelEn: string;
  labelAr: string;
  type: AiFieldType;
  required: boolean;
  helperEn?: string;
  helperAr?: string;
  options?: { value: string; labelEn: string; labelAr: string }[];
  defaultValue?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  bilingual?: boolean;
}

export interface AiTemplateClause {
  headingEn: string;
  headingAr: string;
  paragraphsEn: string[];
  paragraphsAr: string[];
}

export interface AiSuggestion {
  type: "missing_clause" | "ambiguous_language" | "compliance_issue";
  severity: "low" | "medium" | "high";
  messageEn: string;
  messageAr: string;
}

export interface AiCatalogMeta {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  category: string;
  icon: string;
}

export interface AiTemplateContent {
  id: string;
  subtitleEn?: string;
  subtitleAr?: string;
  fields: AiTemplateField[];
  clauses: AiTemplateClause[];
}

export interface AiIngestionResult {
  templateContent: AiTemplateContent;
  suggestions: AiSuggestion[];
  detectedCategory: string;
  detectedLanguage: "en" | "ar" | "bilingual";
  catalogMeta: AiCatalogMeta;
  confidence: number;
  diagnostics?: {
    orphanTokens: string[];
    fieldCount: number;
    clauseCount: number;
    bilingualFieldCount: number;
  };
  usage?: {
    inputTokens: number | null;
    outputTokens: number | null;
    cacheReadTokens: number | null;
    cacheCreationTokens: number | null;
  };
}

export async function scanTemplateWithAi(
  file: File | Blob,
  options: {
    category?: string;
    lang?: "en" | "ar" | "bilingual";
    idHint?: string;
    mode?: "full" | "fields-only";
  } = {}
): Promise<AiIngestionResult> {
  const text = await extractTextFromDocx(file);
  if (text.length < 50) {
    throw new Error(
      "Document text too short to analyze. Make sure the file contains readable text (not just images)."
    );
  }

  const { data, error } = await supabase.functions.invoke(
    "detect-template-fields",
    {
      body: {
        text,
        category: options.category,
        lang: options.lang,
        idHint: options.idHint,
        mode: options.mode ?? "full",
      },
    }
  );

  if (error) throw new Error(error.message ?? "AI scan failed");
  if (!data?.ok) {
    throw new Error(
      data?.error ?? "AI returned an error. Please try again or use manual scan."
    );
  }
  return { ...data.result, diagnostics: data.diagnostics, usage: data.usage };
}

export async function scanTextWithAi(
  text: string,
  options: {
    category?: string;
    lang?: "en" | "ar" | "bilingual";
    idHint?: string;
    mode?: "full" | "fields-only";
  } = {}
): Promise<AiIngestionResult> {
  if (text.length < 50) {
    throw new Error("Text too short to analyze (minimum 50 characters).");
  }
  const { data, error } = await supabase.functions.invoke(
    "detect-template-fields",
    {
      body: {
        text,
        category: options.category,
        lang: options.lang,
        idHint: options.idHint,
        mode: options.mode ?? "full",
      },
    }
  );
  if (error) throw new Error(error.message ?? "AI scan failed");
  if (!data?.ok) throw new Error(data?.error ?? "AI returned an error.");
  return { ...data.result, diagnostics: data.diagnostics, usage: data.usage };
}

const DATE_FMT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };

export function normalizeValuesForMerge(
  fields: PlaceholderField[],
  rawValues: Record<string, string>,
  options: { lang?: "en" | "ar" | "bilingual" } = {}
): Record<string, unknown> {
  const lang = options.lang ?? "en";
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = rawValues[f.key] ?? "";
    if (f.type === "date" && v) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) {
        const enDate = d.toLocaleDateString("en-GB", DATE_FMT);
        const arDate = d.toLocaleDateString("ar-OM", DATE_FMT);
        if (lang === "ar") {
          out[f.key] = arDate;
        } else if (lang === "bilingual") {
          out[f.key] = enDate;           // English placeholder → English date
          out[f.key + "_ar"] = arDate;   // Arabic placeholder → Arabic date
        } else {
          out[f.key] = enDate;
        }
        continue;
      }
    }
    out[f.key] = v;
  }
  return out;
}
