# Contract Scribe Pro — working rules

Bilingual (AR/EN) Oman contract and ministry-letter generator.
Vite · React 18 · TypeScript · shadcn/ui · Tailwind · Supabase.

This repo is governed by the **SmartPRO Hub Company OS Constitution**
(2026-08-17), which applies to all future PRs. What follows is the
constitution's §A/§B/§J as they apply here. Review notes on the constitution
itself, and where CSP diverges from it, are in
`docs/COMPANY_OS_CONSTITUTION_REVIEW.md`.

## Commands

```sh
npm run dev      # vite dev server
npm run build    # vite build — DOES NOT TYPECHECK
npm run lint     # eslint
npx tsc --noEmit -p tsconfig.app.json   # not wired into CI, see "Known debt"
```

## The PR gate (Constitution §B)

Every PR passes all six. A reviewer blocks on any failure.

1. **Single home per fact.** A data point is editable in exactly one place.
   Displayed anywhere, edited in one. Duplicate entry forms are rejected.
   Derivation rules count as facts — a status rule copied into a second file
   is a B1 failure, which is what `src/lib/contractLifecycle.ts` exists to fix.
2. **Every number is clickable.** Any count or metric on a dashboard deep-links
   to the filtered source list, and that list offers the resolving action.
3. **Source and sink required.** A new screen consumes data produced elsewhere
   *and* produces data consumed elsewhere. A screen doing neither is merged
   into an existing one.
4. **Sector changes content, not structure.** Sector may toggle fields,
   document types, and validations. It may never add a route.
5. **Page count is capped.** Consolidation PRs are welcome; expansion PRs are
   not. New capability goes inside an existing page.
6. **Complete or not shipped.** No screen or field merges without the §J
   specification below satisfied. A skeleton page missing its essential
   elements is rejected outright.

## Field standard (§J2)

Every new or touched field defines: bilingual labels (AR **and** EN — no
English-only fields, ever) · type and exact format · required / optional /
conditionally-required with the condition stated · where the default is
pre-filled from · client **and** server validation with the bilingual error
message · who may view/edit/approve · what recalculates when it changes ·
audit (who, when, old→new) · masking for lower roles.

Formats in use here: dates are `'YYYY-MM-DD'` strings, never `Date` objects ·
IBAN `OA` + 21 digits · phone `+968` + 8 digits · currency OMR.

## Screen standard (§J3)

Ships with all of: full action set (no "view-only for now") · search + filter +
sort on lists over ~10 rows · empty state with a guiding action, never a blank
table · loading and error states, bilingual · bulk actions where lists exist ·
export where an accountant or auditor would need it · deep links in and out ·
mobile + RTL verified (≥44px targets, WCAG AA) · each role's actual view
rendered · edge cases named.

**§J5 — retroactive application.** Existing screens are grandfathered, but any
PR touching them brings the touched fields and screens up to this standard.
Converge with every sprint; no big-bang rewrite.

## Architecture notes

- **Contract lifecycle** — `src/lib/contractLifecycle.ts` is the only place
  status is derived. `computeStatus`, `daysUntilExpiry`, `warningWindowDays`,
  `crossedThreshold` (the §C 90/60/30/7 alert ladder), labels and colours. Add
  lifecycle rules here, not in a page. Stored status stays authoritative for
  human decisions (`draft`, `terminated`, `renewed`); the calendar only moves an
  in-force contract to `expiring_soon` / `expired`.
- **Templates** — `src/lib/templateContent/` holds authored bilingual content
  (typed field schema + clause pairs with `{token}` placeholders);
  `src/lib/templates.ts` is the catalog listing. A template is "ready" only
  when both exist.
- **Ministry letters** — `src/lib/ministryLetters/`, one module per authority.
  Letter layout is locked; the addressing protocol embeds honorific and closing
  per addressee.
- **Migrations** — `supabase/migrations/`, `YYYYMMDD_description.sql`, additive.
  Every table gets RLS. Every new column that a page writes gets its check
  constraint mirrored as client-side validation with a stated message (§J2).

## Known debt (do not be surprised by these)

- **`src/integrations/supabase/types.ts` is stale.** It describes 8 tables from
  an older schema; none of the 11 tables in `supabase/migrations/` are in it.
  So `tsc --noEmit` reports ~127 errors, almost all of this one cause, and
  neither `build` nor `lint` typechecks. Regenerate with
  `supabase gen types typescript --linked` and wire `tsc --noEmit` into CI
  before relying on types for correctness.
- **No language context on the Contracts screens.** `LanguageToggle` is a prop
  inside the contract builder, not global state. Bilingual label maps therefore
  exist in the data layer while callers pass `"en"`. When the context lands,
  the call sites take one argument change — the Arabic is already written.
- **No scheduled jobs.** Expiry is derived at render time; a contract that
  expires overnight keeps a stored status of `active` until someone opens the
  page, and nothing notifies. `crossedThreshold()` is shaped for a sweep to
  call when one is built.

## Conventions

- Path alias `@/` → `src/`.
- Comments explain *why*, in the voice of the surrounding file. This codebase
  writes real explanations in headers; match that, don't narrate the obvious.
- RTL: use logical properties (`ms-`/`me-`, not `ml-`/`mr-`).
