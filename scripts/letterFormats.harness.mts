// =============================================================
// Regression harness — Bring Your Own Format
//
// The repo has no frontend test runner, so this stands in for one on
// the part of the letters product that silently breaks: detection over
// real-world phrasing, and tagging across Word's split runs.
//
// Run:  npx vite-node scripts/letterFormats.harness.mts
// Exits non-zero on any failure.
// =============================================================

import { Document, Packer, Paragraph, TextRun } from "docx";
import PizZip from "pizzip";
import { readParagraphs, tagDocxZip } from "../src/lib/letterFormats/tagDocx";
import { detectPlaceholders, manualSuggestion } from "../src/lib/letterFormats/detect";
import { mergeTemplate } from "../src/lib/templateEngine";

let failures = 0;
const check = (label: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
};

const para = (...runs: TextRun[]) => new Paragraph({ children: runs });
const t = (text: string, bold = false) => new TextRun({ text, bold });

// ── sample document ───────────────────────────────────────────
const sample = new Document({
  sections: [
    {
      children: [
        para(t("مؤسسة الصقر للتجارة — ترخيص بلدي 4421")), // letterhead
        para(t("التاريخ: ٩ أغسطس ٢٠٢٦م")),
        para(t("الفاضل / مدير الاشتراكات المحترم")),
        // CR number SPLIT ACROSS RUNS, half bold — the classic docx pitfall
        para(
          t("نحن شركة النافورة العالمية ش.م.م، المسجلة بالسجل التجاري رقم ("),
          t("123", true),
          t("4567"),
          t(") نتقدم بطلبنا."),
        ),
        para(t("المبلغ المستحق هو 443.191 ريال عماني.")),
        para(t("مقدم الطلب: سيف محمد الراشدي")),
        para(t("رقم التواصل: 91234567")),
        para(t("التاريخ: ٩ أغسطس ٢٠٢٦م")), // repeat -> one field, two spans
        // ── CR label variants, as they appear in real ugly letters ──
        para(t("سجل تجاري رقم ١٢٣٤٥٦٧")),
        para(t("س.ت: 7654321")),
        para(t("C.R. No: 1122334")),
        para(t("CR: 9988776")),
        para(t("Commercial Registration Number 5566778")),
        // false-positive trap: "ست" inside a word, followed by a number
        para(t("ونعمل على استكمال إجراءات الترخيص رقم 3344556 حاليًا.")),
      ],
    },
  ],
});

const originalBuf = (await Packer.toBuffer(sample)).buffer as ArrayBuffer;
const originalXml = new PizZip(originalBuf).file("word/document.xml")!.asText();

const paragraphs = readParagraphs(originalBuf);
const found = detectPlaceholders(paragraphs);
const samples = found.map((f) => f.sample);
const by = (name: string) => found.find((f) => f.field === name);

console.log(`\nParagraphs: ${paragraphs.length}   fields detected: ${found.length}`);
for (const f of found) console.log(`   {${f.field}} = "${f.sample}" ×${f.spans.length}`);

console.log("\nDetection");
check("date detected", !!by("date"), by("date")?.sample);
check("repeated date deduped to one field, two spans", by("date")?.spans.length === 2);
check("cr_number read across split runs", samples.includes("1234567"));
check("amount is the number only", samples.includes("443.191"));
check("phone detected", samples.includes("91234567"));
check("applicant name detected", samples.includes("سيف محمد الراشدي"));
check("company name detected", samples.includes("شركة النافورة العالمية ش.م.م"));

console.log("\nDetection — CR label variants");
check('"سجل تجاري رقم" (no ال, arabic-indic digits)', samples.includes("١٢٣٤٥٦٧"));
check('"س.ت:"', samples.includes("7654321"));
check('"C.R. No:"', samples.includes("1122334"));
check('"CR:"', samples.includes("9988776"));
check('"Commercial Registration Number"', samples.includes("5566778"));
check(
  'no false positive from "ست" inside استكمال',
  !samples.includes("3344556"),
  samples.includes("3344556") ? "3344556 was wrongly claimed" : "",
);

const manual = manualSuggestion(paragraphs, "ترخيص بلدي 4421", "licence_no", "رقم الترخيص", "Licence No.");
check("manual selection resolves to a span", !!manual && manual.spans.length === 1);

// ── tagging ───────────────────────────────────────────────────
const spans = [...found, ...(manual ? [manual] : [])].flatMap((f) =>
  f.spans.map((s) => ({ ...s, field: f.field })),
);
const taggedZip = tagDocxZip(originalBuf, spans);
const taggedXml = taggedZip.file("word/document.xml")!.asText();
const taggedBuf = (taggedZip.generate({ type: "nodebuffer" }) as Buffer).buffer as ArrayBuffer;

console.log("\nTagging");
for (const f of found) check(`{${f.field}} written`, taggedXml.includes(`{${f.field}}`));
check("split CR digits gone", !taggedXml.includes(">4567<") && !taggedXml.includes("1234567"));
check("paragraph count unchanged", readParagraphs(taggedBuf).length === paragraphs.length);

const paraRe = /<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>/g;
const origParas = originalXml.match(paraRe) ?? [];
const tagParas = taggedXml.match(paraRe) ?? [];
const touched = new Set(spans.map((s) => s.paragraphIndex));
const untouchedSame = origParas.every((p, i) => touched.has(i) || p === tagParas[i]);
check("paragraphs without placeholders are byte-identical", untouchedSame);

const origZip = new PizZip(originalBuf);
const tagZip = new PizZip(taggedBuf);
const others = Object.keys(origZip.files).filter(
  (f) => f !== "word/document.xml" && !origZip.files[f].dir,
);
check(
  `all ${others.length} other zip parts unchanged (styles, rels, images)`,
  others.every((f) => tagZip.file(f)?.asText() === origZip.file(f)!.asText()),
);

// ── merge through the existing engine ─────────────────────────
const values: Record<string, string> = Object.fromEntries(
  found.map((f, i) => [f.field, `VALUE_${i}`]),
);
values.licence_no = "LICENCE_X";

const filled = await mergeTemplate(taggedBuf, values, { download: false });
const filledXml = new PizZip(await filled.arrayBuffer()).file("word/document.xml")!.asText();

console.log("\nMerge through templateEngine");
for (const [k, v] of Object.entries(values)) {
  check(`{${k}} filled`, filledXml.includes(v));
}
check("no unresolved tags remain", !/\{[a-z_0-9]+\}/.test(filledXml.replace(/<[^>]+>/g, "")));
check("letterhead survived the round trip", filledXml.includes("مؤسسة الصقر للتجارة"));

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
