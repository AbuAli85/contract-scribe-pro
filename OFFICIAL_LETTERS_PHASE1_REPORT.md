# Phase 1 Report — Existing Document Automation System

**Repo analyzed:** `contract-scribe-pro` (the folder connected to this session)
**Date:** 2026-07-09 · Branch: `main` (HEAD `a376b63`)

---

## ⚠️ Critical scoping note — read first

The Phase 2 spec assumes the module lives inside the **SmartPRO Hub** codebase (Express + tRPC + MySQL + Drizzle, `companyId` scoping, `../_core/trpc`, `getDb()`, hand-authored migrations). **That repo is not in this workspace.** The only repo available is **Contract Scribe Pro**, which is a *different stack entirely*:

| | Contract Scribe Pro (this repo) | SmartPRO Hub (spec target) |
|---|---|---|
| Frontend | Vite + React 18 + shadcn/Tailwind (Lovable-generated) | Vite + React |
| Backend | **None** — Supabase (Postgres + RLS + Edge Functions/Deno) | Express + tRPC |
| DB | Supabase Postgres, `supabase/migrations/*.sql` | MySQL + Drizzle, hand-authored migrations |
| Tenancy | `auth.uid()` per-user RLS — **no `companyId` concept** | `companyId` FK scoping |
| Storage | Supabase Storage buckets | S3 |

So the answers below describe the real, existing engine in this repo. Items the spec asks about that only exist in SmartPRO Hub (tRPC procedures, Drizzle schema, `getDb()`, S3 key patterns, the 3,967-test suite) **cannot be verified from here** — I flag each one. Before Phase 2 starts you must decide (or connect the Hub repo): build the module in SmartPRO Hub reusing CSP's logic as reference, or extend CSP itself.

---

## 1. Location & scope

- Repo: `AbuAli85/contract-scribe-pro`, branch `main`. Single-package Vite app; no server directory.
- Two document engines coexist:
  - **Catalog engine** — 15 catalog entries in `src/lib/templates.ts`, 8 hand-authored bilingual templates as *TypeScript data* in `src/lib/templateContent/` (employment, freelance, MSA, NDA, NOC-ROP, partnership, service-agreement, tenancy). Fields + clauses with `{token}` refs → rendered to a two-column EN/AR docx by the `docx` library.
  - **BYO engine** — user uploads a `.docx` with `{placeholder}` tokens; `templateEngine.ts` (pizzip + docxtemplater) scans and merges. Optional AI ingestion via the `detect-template-fields` Edge Function (Claude Sonnet) that converts any document text into a full bilingual `TemplateContent` schema.
- **SmartPRO Hub integration points (already live):**
  - `supabase/functions/smartpro-auth` — SSO: verifies a Hub-signed JWT (`CONTRACT_SCRIBE_API_KEY`, audience `contract-scribe-sso`), creates/confirms the Supabase user, returns a magic-link token. Consumed by `/auto-auth` (`src/pages/AutoAuth.tsx`).
  - `src/pages/NewContract.tsx` — when launched in SmartPro mode (hubUrl + companyId params), fetches `${hubUrl}/api/contract-scribe/parties?companyId=...` with `Bearer VITE_SMARTPRO_API_KEY` and gets employer, CRM clients, platform clients, suppliers, employees + their documents for party auto-fill. **Note: the API key is exposed client-side via `VITE_` env — see Gaps.**

## 2. Database schema (Supabase Postgres, 9 migrations)

All tables are scoped to `auth.uid()` via RLS — **there is no `companies` table and no `companyId` anywhere.** No relation to Hub users beyond email-based SSO.

| Table | Purpose | Key columns |
|---|---|---|
| `template_leads` | Lead-magnet email capture on free downloads | email, template_id, lang, unique(email, template_id) |
| `user_templates` | BYO uploaded templates | owner_id→auth.users, storage_path, `schema_json` jsonb (detected placeholders), lang (en/ar/bilingual), is_published, category |
| `template_fills` | One row per generated fill | template_id FK, filled_by, `values_json`, output_docx_path, output_pdf_path, status (draft/generated/signed/archived) |
| `template_requests` (+ `template_demand` view) | Demand capture for coming-soon templates | request_count drives roadmap |
| `profiles` | is_pro, pro_until (Thawani/Stripe webhook sets it) | 1:1 auth.users, auto-created by trigger |
| `fill_seeds` | Saved key→value profiles for re-use | user_id, label, fields jsonb |
| `parties` | Party registry (company/person, EN+AR names, cr_number, tax_id, id_number, nationality, job titles, `extra_fields` jsonb token store) | per-user RLS |
| `contract_records` | Every generated contract: template_id/type (catalog/byo/custom), first/second_party_id, status lifecycle (draft→active→expiring_soon→expired→terminated→renewed), start/end_date, `field_values` jsonb snapshot, document_path, parent_id renewal chain | per-user RLS |
| `contract_events` | Immutable audit trail: created, activated, document_generated, expiring_soon, expired, terminated, renewed, extended, note_added + jsonb data | FK contract_records |

Storage buckets: `user-templates`, `template-outputs` (both private, folder-per-user RLS).

**Important:** `user_templates` and `template_fills` exist in the DB but the current UI **does not write to them** — `MyTemplates.tsx` keeps everything in memory and only persists `fill_seeds`. The tables that are actually used are `parties`, `contract_records`, `contract_events`, `fill_seeds`, `profiles`, and the two lead tables.

## 3. Placeholder engine (`src/lib/templateEngine.ts`, 465 lines)

- **Detection (`scanTemplate`)**: unzips the docx (pizzip), strips XML from `word/document.xml` + headers/footers 1–3, regex `\{+([a-zA-Z][a-zA-Z0-9_\- ]{0,60})\}+` → normalizes keys to `snake_case`. Type inference by key-name heuristics (date/number/email/textarea hints). Labels auto-humanized.
  - **Limitation: token names must start with a Latin letter — Arabic-named placeholders like `{اسم_الموظف}` are NOT detected.** Arabic templates must use Latin token keys.
- **Merge (`mergeTemplate`)**: docxtemplater with `{ }` delimiters, `paragraphLoop: true`, `linebreaks: true`, `nullGetter: ""`. Auto-retries with `{{ }}` on duplicate-tag errors. Includes a custom **XML run-merger** (`fixDocxXmlRuns`) that repairs tags Word split across `<w:t>` runs — this is valuable, battle-tested code worth reusing.
- **Repeating table rows: NOT supported.** `paragraphLoop` is enabled but no template or UI uses docxtemplater loop syntax (`{#rows}...{/rows}`); there is no array field type anywhere. The spec's `person_table` is net-new work.
- **Gender-driven Arabic grammar: not supported.** No concept of gender, no tafqeet (amount-in-words) utility anywhere in the repo.
- **Arabic/RTL**: bilingual fields are handled as paired keys `{key_en}` / `{key_ar}`; `normalizeValuesForMerge` produces locale-formatted dates for both (en-GB / ar-OM). DeepL auto-translate fills the opposite half (Edge Function `translate-text`).
- **AI ingestion**: `scanTemplateWithAi` → `detect-template-fields` Edge Function (Claude), returns full bilingual `TemplateContent` (typed fields incl. `currency-omr`, select options, groups, clauses with paired EN/AR paragraph arrays), compliance suggestions, orphan-token diagnostics, confidence. Also drives the CLI `scripts/ingest-template.mjs` for catalog expansion.

## 4. Backend routes & services

**There are no tRPC routes** — the "backend" is 8 Supabase Edge Functions (Deno):

| Function | Purpose |
|---|---|
| `detect-template-fields` | AI template ingestion (Claude) |
| `translate-text` | DeepL EN↔AR proxy |
| `smartpro-auth` | Hub SSO JWT → Supabase magic link |
| `create-signature-request` | Dropbox Sign e-signature |
| `send-whatsapp` | Twilio WhatsApp share of signing link |
| `send-template-email` | Lead-magnet template delivery |
| `create-checkout-session` / `stripe-webhook` | Payments (Stripe; profiles mention Thawani) |

Everything else is direct client → Supabase (RLS-guarded) calls. The SmartPRO Hub side exposes `/api/contract-scribe/parties` (that code lives in the Hub repo, not here).

## 5. Frontend flow

- **Catalog fill** (`/templates` → `/templates/fill/:templateId`, `FillTemplate.tsx` 817 lines): grouped multi-step wizard, RTL-aware, bilingual paired inputs with DeepL auto-fill button, Pro gating via `profiles.is_pro`, generate → client-side docx download → optional Dropbox Sign + WhatsApp. **No record is saved from this flow — downloads are untracked** (only lead capture on the free-download path).
- **BYO** (`/my-templates`, `MyTemplates.tsx` 891 lines): upload → scan (regex or AI) → review detected fields → fill (with fill_seeds save/load) → merge → download. In-memory only; template not persisted.
- **Formal records flow** (`/records/new`, `NewContract.tsx` ~1,400 lines — the newest, closest to your clerk flow): 4-step wizard — pick template (catalog or upload) → pick parties (from Supabase `parties` or live SmartPro Hub data with case-insensitive alias auto-fill of CR numbers, civil numbers, job titles etc.) → fill fields with localStorage draft autosave → generate. Saves `contract_records` row, uploads docx to `user-templates/{uid}/records/{id}.docx`, updates `document_path`, writes `contract_events` (created + document_generated). Register at `/records`, detail with re-download at `/records/:id`, party CRUD at `/parties`.
- Legacy promoter-contract creator (`/create-contract` + the large `components/contract/*`, print system) — an earlier hard-coded bilingual contract with letterhead/photo support, driven by **mock data** in `contract.service.ts`.

## 6. File storage

Supabase Storage, not S3:

- `user-templates/{user_id}/{template_id}.docx` — raw BYO uploads (convention; UI currently doesn't write it)
- `user-templates/{user_id}/records/{record_id}.docx` — generated contracts from the records flow (actually used)
- `template-outputs/{user_id}/{fill_id}.docx` — intended for fills; **currently unused**

Metadata: only `document_path` on `contract_records` / paths on `template_fills`. No content-type/size/checksum records, no per-company folders, no year partitioning, no reference number in the key.

## 7. Audit / tracking

- `contract_events` is a real immutable audit trail (actor user_id, typed event, note, jsonb data, timestamp) — but only the `/records/new` flow writes it.
- `FillTemplate` and `MyTemplates` generate documents with **no audit row at all** — a silent generation path the spec explicitly forbids.
- No client name field, no company scoping, no reference-number registry. `referenceGenerator.ts` makes `PRO-YYYYMMDD-<4 random digits>` — random, not sequential, not persisted, not collision-safe; used only by the legacy creator.

## 8. Output rendering

- **Docx**: two libraries. (a) `docx` v8 builder in `generateFilledContract.ts` — cover page + borderless two-column table (EN cell | spacer | AR cell) per clause, `rightToLeft: true` runs + `bidirectional` paragraphs, Arial for Arabic, Calibri for English, OMR amounts formatted to 3 decimals, dates localized en-GB/ar-OM. (b) docxtemplater merge for BYO — preserves the uploaded file's own formatting.
- **PDF**: client-side only — `jspdf` + `html2canvas` screenshotting the HTML print preview (legacy creator), plus a very elaborate CSS `@media print` system (`src/styles/print/*`, ~16 files) and print-debug tooling. **There is no docx→PDF conversion**; generated docx files are never turned into PDF. This is a major gap for the letters module (headless LibreOffice or a conversion service will be needed server-side).
- **Letterhead**: per-company letterhead exists only in the legacy mock (`letterhead: picsum URL`). No letterhead designer, no logo upload, no stamp zone.

## 9. Test coverage

**Zero.** No test files, no test runner, no `test` script in `package.json`, no CI config. The docx XML run-merger, alias matching, and date formatting — the most fragile logic — are untested. (The "3,967 tests" figure belongs to the SmartPRO Hub repo, not this one.)

## 10. Known gaps / fragile areas

1. **`user_templates` / `template_fills` tables + `template-outputs` bucket are built but unused** — the BYO UI never persists.
2. **Silent generation paths**: catalog fill and BYO fill produce documents with no DB record.
3. **`VITE_SMARTPRO_API_KEY` is bundled into client JS** — anyone can read the Hub API key from the built app and query `/api/contract-scribe/parties`. Should move to an Edge Function proxy or short-lived tokens.
4. **No Arabic placeholder tokens** (regex requires Latin start char).
5. **No repeating rows / arrays / tables** in the fill engine.
6. **No tafqeet, no gender grammar, no Arabic day-name derivation, no Hijri support.**
7. **No docx→PDF conversion** anywhere.
8. **Reference numbers are random and unpersisted** — no sequential per-year registry.
9. **Legacy creator runs on mock data** (`contract.service.ts` hard-codes Falcon Eye parties, picsum letterhead); large `components/contract/*` + print/pdf subsystem (~60 files) is effectively dead weight for this module.
10. **No template versioning** — catalog templates are TS code; editing changes history for all past fills (though `field_values` snapshots partially mitigate).
11. **Single-user tenancy** — everything keys on `auth.uid()`; multi-company/operator-role concepts don't exist here.
12. Dates handled inconsistently: `date` columns + `YYYY-MM-DD` inputs in records flow, but localized display strings baked into merged docs.
13. Duplicate util trees (`src/utils/pdfPageCreator.ts` vs `src/utils/pdf/…`, two `Print.tsx`, two `DocumentUploader.tsx`) — Lovable-era drift.

---

## What this means for Phase 2 (assessment, not build)

**Reusable as-is:** docxtemplater merge + XML run-fixer, AI ingestion function, bilingual paired-input pattern, DeepL translate function, `contract_events` audit pattern, records register UX, SmartPro SSO + parties API contract, clause data model (`templateContent/types.ts`) — a strong precedent for `letter_clauses` and Tier 2 assembly.

**Net-new regardless of stack:** tafqeet utility, `person`/gender grammar engine, `person_table` repeating rows, authority registry, letterheads + stamp zones, sequential reference numbers, template versioning, server-side PDF, role-based admin.

**Open question you must answer before Phase 2** (the spec's conventions — Drizzle, tRPC, `companyId`, S3, hand-authored MySQL migrations — all point to SmartPRO Hub):

- **Option A:** build the module inside SmartPRO Hub (needs that repo connected to this session), treating CSP as reference code.
- **Option B:** build it here on Supabase, adding company scoping to this schema.

I'd wait for your confirmation and, if Option A, for access to the SmartPRO Hub repo — sections 2, 4, 6, and 9 need to be re-verified against it before any migration is written.
