# Template Ingestion Engine

The catalog-expansion lever — turn any Word, Google Doc, or plain-text sample into a Contract Scribe Pro template without hand-authoring.

## The pitch

You have 8 ready templates. Authoring the next 40 by hand would take weeks. Instead, point this engine at a folder of real-world contract samples and it produces draft `TemplateContent` files you can review, polish, and merge into the catalog.

The same engine powers two surfaces:

| Surface | Who uses it | What it does |
| --- | --- | --- |
| **CLI** — `scripts/ingest-template.mjs` | You, expanding the catalog | Drops a draft `src/lib/templateContent/<id>.ts` ready for your review and merge |
| **BYO upload** — `/my-templates` | End users | Turns a customer's own Word doc into a fillable bilingual template inside Contract Scribe Pro |

## What the engine produces

For every input document, the engine returns a complete `TemplateContent` schema plus catalog metadata:

| Output | Description |
| --- | --- |
| `templateContent.fields` | Every fillable variable, typed (text, currency-omr, date, select…), grouped, with EN+AR labels. Script-sensitive fields (party names, addresses, signatories) flagged `bilingual: true` so the form renders paired EN+AR inputs. |
| `templateContent.clauses` | Bilingual clause text with `{field_key}` token substitutions. Each clause has `paragraphsEn` and `paragraphsAr` arrays — index N in English matches index N in Arabic (same legal content, two languages). |
| `suggestions` | Compliance gaps the AI noticed — missing clauses, ambiguous language, possible Oman law non-compliance, with severity (low/medium/high). |
| `catalogMeta` | Suggested title, description, category, and lucide icon for the catalog card. |
| `diagnostics.orphanTokens` | Any `{token}` references in clauses that don't match a real field key. Catches the most common AI failure mode before it ships. |

If the source document is English-only, the AI translates the clause text into formal legal Arabic. If Arabic-only, the reverse. The output is always bilingual.

## CLI usage

### Prerequisites

1. The `detect-template-fields` Edge Function must be deployed:
   ```bash
   supabase functions deploy detect-template-fields --no-verify-jwt
   ```
2. The Claude API key must be set in Supabase Vault:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
3. `SUPABASE_URL` and `SUPABASE_ANON_KEY` must be available in your shell environment (or in a `.env` / `.env.local` at the repo root — both Vite-prefixed and bare names are accepted).

### Preview mode (default)

```bash
node scripts/ingest-template.mjs ~/samples/commercial-lease.docx
```

Prints the generated TS to stdout so you can eyeball it before committing. Also surfaces compliance suggestions and warns about orphan tokens.

### Write mode

```bash
node scripts/ingest-template.mjs ~/samples/sow.docx --id sow --write
```

Writes the file to `src/lib/templateContent/sow.ts` and prints next-steps for the catalog row.

### Flags

| Flag | Effect |
| --- | --- |
| `--id <kebab-id>` | Override the template ID (default: derived from filename) |
| `--category <name>` | Hint the category — one of `"Employment & HR"`, `"Business Agreements"`, `"Sales & Vendors"`, `"Real Estate"`, etc. |
| `--lang en\|ar\|bilingual` | Hint the source language |
| `--write` | Persist to disk (default: print to stdout for preview) |

### Supported file types

- `.docx` — preferred (preserves clause structure)
- `.txt`, `.md` — plain text fallback

For `.pdf` or `.doc`, convert to `.docx` first:
```bash
# macOS / Linux
libreoffice --convert-to docx mycontract.pdf
# or use Word: File → Save As → .docx
```

## Workflow for expanding the catalog

1. **Collect samples.** Drop 5–10 Word/Google Doc contracts of the type you want to add (e.g. five different SOW templates) into a folder. The AI averages over them implicitly — more diverse samples = better generated template.
2. **Pick the best representative.** Usually the one that's most comprehensive and closest to Omani law.
3. **Run preview mode.** Eyeball the TS output. Check that the suggested fields make sense, that clauses are well-structured, and that the `diagnostics.orphanTokens` array is empty.
4. **Run write mode.** Commits the draft TS to `src/lib/templateContent/<id>.ts`.
5. **Review the TS file.** Add helper text, refine field types, tighten clause language, cross-reference Oman law articles. The AI gives you 80% — you provide the final 20%.
6. **Register in `src/lib/templateContent/index.ts`:**
   ```ts
   import { SOW_CONTENT } from "./sow";
   export const TEMPLATE_CONTENT_REGISTRY = {
     // existing
     sow: SOW_CONTENT,
   };
   ```
7. **Add the catalog row to `src/lib/templates.ts`.** The CLI prints a ready-made TypeScript snippet you can paste in.
8. **Test end-to-end** — fill the form, generate the .docx, confirm both columns look right.

## User-facing BYO upload

When an end user uploads a Word doc at `/my-templates`, the same engine runs. The full `TemplateContent` is available on the `aiResult` state object so future features can use the richer structure (bilingual paired inputs, clause-by-clause review, compliance suggestions panel). The current UI surfaces:

- A field-review table with detected labels and types
- An AI suggestions panel when compliance gaps were found
- Confidence percentage and detected language

Future iterations can layer on:

- Save uploaded source `.docx` to Supabase Storage (per-user template library)
- Render the bilingual clauses preview side-by-side
- "Smart-merge with library" — diff against our authored templates and offer to swap weak clauses for Oman-Law-compliant versions

## Cost model

Per ingestion call (typical mid-size contract):

- Input: ~4,000 tokens (12K char document)
- Output: ~6,000 tokens (bilingual TemplateContent with 8–15 fields, 8–12 clauses)
- Model: `claude-sonnet-4-5`
- Approximate cost: $0.04–0.08 per template ingested

For catalog expansion you'll spend roughly **$2–5 to ingest 50 templates** before review. The cost is dominated by the AI translating monolingual sources into formal legal Arabic.

## Known limitations

| Limit | Workaround |
| --- | --- |
| `.pdf` and `.doc` not supported directly | Convert to `.docx` first |
| Image-only documents (scanned PDFs) | Run OCR first, then ingest as `.txt` |
| Documents > 50,000 chars are truncated | Split into sections, ingest separately, merge by hand |
| AI may invent field keys not referenced in clauses | `diagnostics.orphanTokens` flags these — review before publishing |
| Generated Arabic clauses use Modern Standard Arabic | If you need Omani dialect, hand-edit the `paragraphsAr` arrays |

## Files in this engine

```
supabase/functions/detect-template-fields/index.ts   ← AI ingestion Edge Function
src/lib/templateEngine.ts                            ← Client wrappers + types
src/lib/templateContent/types.ts                     ← Output schema definition
scripts/ingest-template.mjs                          ← CLI for catalog expansion
src/pages/MyTemplates.tsx                            ← User-facing BYO upload UI
```
