#!/usr/bin/env node
// =============================================================
// Template ingestion CLI
//
// Drop a .docx (or any text-extractable doc) on this script and
// it produces a draft `src/lib/templateContent/<id>.ts` file ready
// for human review and merge into the catalog.
//
// This is the catalog-expansion lever — instead of hand-authoring
// 50 more templates over the next few months, you can ingest 50
// real-world samples in an afternoon. The human stays in the loop
// as the legal reviewer; the script just writes the boilerplate.
//
// Usage:
//   node scripts/ingest-template.mjs <path-to-doc> [--id <kebab-id>]
//                                                  [--category <name>]
//                                                  [--lang en|ar|bilingual]
//                                                  [--write]
//
// Examples:
//   node scripts/ingest-template.mjs ~/samples/commercial-lease.docx
//   node scripts/ingest-template.mjs ~/samples/sow.docx --id sow --write
//
// Flags:
//   --id        Override the kebab-case ID for the template
//   --category  Hint the category (one of: "Employment & HR", etc.)
//   --lang      Hint the source language
//   --write     Write the file to src/lib/templateContent/<id>.ts
//               (default: print to stdout for preview)
//
// Requires:
//   - The detect-template-fields Edge Function deployed
//   - SUPABASE_URL + SUPABASE_ANON_KEY environment variables
//     (or .env file in repo root)
//   - pizzip installed (already in package.json)
// =============================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";

const __filename = fileURLToPath(import.meta.url);

// ── Parse CLI args ──────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    if (key === "write") {
      flags.write = true;
    } else {
      flags[key] = args[++i];
    }
  } else {
    positional.push(a);
  }
}

const docPath = positional[0];
if (!docPath) {
  console.error("ERROR: missing path to document.\n");
  printUsage();
  process.exit(1);
}

const absDocPath = resolve(docPath);
if (!existsSync(absDocPath)) {
  console.error(`ERROR: file not found: ${absDocPath}`);
  process.exit(1);
}

// ── Load .env if present ────────────────────────────────────
loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set (in env or .env)."
  );
  console.error("       Or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  process.exit(1);
}

// ── Extract text from the .docx ─────────────────────────────
const ext = extname(absDocPath).toLowerCase();
let extractedText;
if (ext === ".docx") {
  extractedText = extractTextFromDocx(absDocPath);
} else if (ext === ".txt" || ext === ".md") {
  extractedText = readFileSync(absDocPath, "utf8");
} else {
  console.error(
    `ERROR: unsupported file extension "${ext}". Supported: .docx, .txt, .md`
  );
  console.error(
    "       For .pdf or .doc, convert to .docx first (Word → Save As .docx, or libreoffice --convert-to docx)."
  );
  process.exit(1);
}

if (extractedText.length < 50) {
  console.error(
    `ERROR: extracted only ${extractedText.length} chars. Document may be image-only (no OCR run).`
  );
  process.exit(1);
}

console.error(`📄 Loaded ${absDocPath}`);
console.error(`   ${extractedText.length.toLocaleString()} characters extracted`);
console.error("");

// ── Call the ingestion Edge Function ────────────────────────
console.error("🧠 Calling Claude via detect-template-fields…");
const startedAt = Date.now();
const result = await callIngestion({
  text: extractedText,
  category: flags.category,
  lang: flags.lang,
  idHint: flags.id || basename(absDocPath, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
});
const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
console.error(`   Done in ${elapsedSec}s`);
console.error("");

if (!result.ok) {
  console.error("ERROR: ingestion failed");
  console.error(result.error);
  process.exit(1);
}

const data = result.result;
const diag = result.diagnostics ?? {};
const usage = result.usage ?? {};

// ── Summary ─────────────────────────────────────────────────
console.error("✅ Ingestion complete");
console.error(`   Template ID:        ${data.templateContent.id}`);
console.error(`   Detected category:  ${data.detectedCategory}`);
console.error(`   Source language:    ${data.detectedLanguage}`);
console.error(`   Confidence:         ${(data.confidence * 100).toFixed(0)}%`);
console.error(`   Fields:             ${diag.fieldCount ?? "?"}`);
console.error(`     · bilingual:      ${diag.bilingualFieldCount ?? "?"}`);
console.error(`   Clauses:            ${diag.clauseCount ?? "?"}`);
console.error(`   Suggestions:        ${data.suggestions?.length ?? 0}`);
if (diag.orphanTokens?.length) {
  console.error(
    `   ⚠  Orphan tokens:    ${diag.orphanTokens.join(", ")} — these reference field keys that don't exist.`
  );
}
if (usage.inputTokens != null) {
  const cacheNote = usage.cacheReadTokens
    ? ` (${usage.cacheReadTokens} from cache ✓)`
    : usage.cacheCreationTokens
    ? ` (${usage.cacheCreationTokens} cached for next run)`
    : "";
  console.error(`   Token usage:        ${usage.inputTokens} in / ${usage.outputTokens} out${cacheNote}`);
}
console.error("");

// ── Render the TS file ──────────────────────────────────────
const tsSource = renderTemplateContentTs(data);
const outPath = resolve(
  process.cwd(),
  "src",
  "lib",
  "templateContent",
  `${data.templateContent.id}.ts`
);

if (flags.write) {
  writeFileSync(outPath, tsSource, "utf8");
  console.error(`💾 Written: ${outPath}`);
  console.error("");
  console.error("Next steps:");
  console.error(`   1. Review the file: ${outPath}`);
  console.error(`   2. Register in src/lib/templateContent/index.ts`);
  console.error(`   3. Add the catalog row to src/lib/templates.ts:`);
  console.error("");
  console.error(renderCatalogRow(data));
} else {
  console.error("(use --write to save to disk)");
  console.error("─────────────────────────── generated TS ───────────────────────────");
  process.stdout.write(tsSource);
}

if (data.suggestions?.length) {
  console.error("");
  console.error("─── Compliance suggestions ───");
  for (const s of data.suggestions) {
    console.error(`  [${s.severity.toUpperCase()}] ${s.type}: ${s.messageEn}`);
  }
}

// ============================================================
// Helpers
// ============================================================

function extractTextFromDocx(path) {
  const buf = readFileSync(path);
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
  for (const p of sources) {
    const entry = zip.file(p);
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

async function callIngestion(body) {
  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/detect-template-fields`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${await res.text()}` };
  }
  return res.json();
}

function renderTemplateContentTs(data) {
  const tc = data.templateContent;
  const banner = `// =============================================================
// ${data.catalogMeta.titleEn}
// ${data.catalogMeta.titleAr}
//
// AI-ingested template. Generated by scripts/ingest-template.mjs
// on ${new Date().toISOString().slice(0, 10)}.
//
// ⚠  REVIEW BEFORE PUBLISHING — confirm legal accuracy, check that
// every {token} resolves to a real field key, and have an Oman-
// licensed lawyer review for high-value contract types.
// =============================================================

import type { TemplateContent } from "./types";

export const ${idToConst(tc.id)}_CONTENT: TemplateContent = `;

  return banner + JSON.stringify(tc, null, 2) + ";\n";
}

function renderCatalogRow(data) {
  const m = data.catalogMeta;
  const tc = data.templateContent;
  return `  {
    id: ${JSON.stringify(tc.id)},
    titleEn: ${JSON.stringify(m.titleEn)},
    titleAr: ${JSON.stringify(m.titleAr)},
    descEn: ${JSON.stringify(m.descEn)},
    descAr: ${JSON.stringify(m.descAr)},
    category: ${JSON.stringify(m.category)},
    icon: ${JSON.stringify(m.icon)},
    status: "ready",
    isPro: false,
  },`;
}

function idToConst(id) {
  return id
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

function printUsage() {
  console.error(`
Template ingestion CLI

Usage:
  node scripts/ingest-template.mjs <path-to-doc> [flags]

Flags:
  --id <kebab-id>     Override template ID (default: derived from filename)
  --category <name>   Category hint
  --lang <lang>       Source language hint: en | ar | bilingual
  --write             Write the generated TS file to src/lib/templateContent/
                      (default: print to stdout)
  --help              Show this message

Supported file types: .docx, .txt, .md

Examples:
  node scripts/ingest-template.mjs ~/samples/sow.docx
  node scripts/ingest-template.mjs ~/samples/lease.docx --id commercial-lease --write
  node scripts/ingest-template.mjs ~/samples/jv.docx --category "Business Agreements" --write
`);
}
