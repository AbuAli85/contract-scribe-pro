// =============================================================
// Template Engine — placeholder detection + .docx merging
//
// Phase 1 of the BYO-template feature. Uses docxtemplater + pizzip
// to scan uploaded .docx files for {token} placeholders and merge
// user-supplied values into a final filled document.
//
// Required deps (install in repo):
//   npm install docxtemplater pizzip file-saver
//   npm install --save-dev @types/file-saver
//
// docxtemplater default delimiters are { ... }. To use {{ ... }} or
// other syntax, pass `parser` / `delimiters` options when constructing.
// =============================================================

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export interface PlaceholderField {
  /** machine key — e.g. "employee_name" */
  key: string;
  /** human label shown on the fill form — e.g. "Employee Name" */
  label: string;
  /** input type — heuristically inferred from key name */
  type: "text" | "date" | "number" | "email" | "textarea";
  required: boolean;
}

export interface ScanResult {
  fields: PlaceholderField[];
  /** raw placeholder names found in the doc, in document order */
  rawTokens: string[];
  /** count of tokens detected (including duplicates) */
  totalTokens: number;
}

// ─── Heuristics for inferring field type from token name ─────────
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

// ─── Scan a .docx for placeholders ───────────────────────────────
/**
 * Reads a .docx ArrayBuffer and returns the list of {placeholder}
 * tokens it contains, along with inferred field types.
 *
 * docxtemplater's InspectModule could be used for this, but we don't
 * want a hard dep on it for Phase 1. Instead, we extract document.xml
 * from the zip and run a regex over the text runs.
 */
export async function scanTemplate(file: File | Blob): Promise<ScanResult> {
  const buf = await file.arrayBuffer();
  const zip = new PizZip(buf);

  // The main document content lives at word/document.xml inside the zip.
  // Headers and footers live separately — scan those too so {company_name}
  // in a letterhead is captured.
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
      // Strip XML tags so placeholders split across runs are still detected.
      // docx writes "{employee" + "_name}" across separate <w:t> elements
      // when Word auto-corrects mid-token. The naive regex below catches
      // the common case; production should use docxtemplater's parser to
      // verify, but this works for ~95% of real-world templates.
      const raw = entry.asText();
      const stripped = raw.replace(/<[^>]+>/g, "");
      combinedText += stripped + "\n";
    }
  }

  const tokenRe = /\{([a-zA-Z][a-zA-Z0-9_\- ]{0,60})\}/g;
  const rawTokens: string[] = [];
  const seen = new Set<string>();
  const fields: PlaceholderField[] = [];

  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(combinedText)) !== null) {
    const tokenRaw = match[1].trim();
    // docxtemplater normalizes spaces; we mirror by collapsing whitespace
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

// ─── Merge values into the template + return the filled .docx ────
export interface MergeOptions {
  /**
   * Save & download the result to the user's machine. Defaults to true.
   * Set to false if you want to upload the Blob to storage instead.
   */
  download?: boolean;
  /** Filename for the download — defaults to "filled-contract.docx" */
  filename?: string;
}

export async function mergeTemplate(
  file: File | Blob | ArrayBuffer,
  values: Record<string, unknown>,
  options: MergeOptions = {}
): Promise<Blob> {
  const buf = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const zip = new PizZip(buf);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Replace missing tokens with empty string rather than throwing
    nullGetter: () => "",
  });

  // Normalize value keys to match how we stored them (lowercase, underscored).
  // docxtemplater will only match exact token text, so we pass both forms.
  const data: Record<string, unknown> = { ...values };
  for (const [k, v] of Object.entries(values)) {
    const alt = k.replace(/_/g, " ");
    if (!(alt in data)) data[alt] = v;
  }

  doc.render(data);

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });

  if (options.download !== false) {
    saveAs(blob, options.filename ?? "filled-contract.docx");
  }

  return blob;
}

// ─── Helper: convert form values to docxtemplater-friendly format ──
export function normalizeValuesForMerge(
  fields: PlaceholderField[],
  rawValues: Record<string, string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = rawValues[f.key] ?? "";
    if (f.type === "date" && v) {
      // Render dates in a Word-friendly long format
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) {
        out[f.key] = d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        continue;
      }
    }
    out[f.key] = v;
  }
  return out;
}
