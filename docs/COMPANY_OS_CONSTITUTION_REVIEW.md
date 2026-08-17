# Review — SmartPRO Hub Company OS Constitution & Sprint 1

**Reviewed document:** `SMARTPRO_COMPANY_OS_CONSTITUTION_AND_SPRINT1.md` (Fahad Alamri, 2026-08-17, "Approved for build")
**Reviewed from:** Contract Scribe Pro (`AbuAli85/contract-scribe-pro`) — the repo named in §I2 as the embedded contract layer
**Review date:** 2026-08-17

The constitution is sound. The 6-section cap, "single home per fact", and the
completeness standard are the right constraints, and Sprint 1 is correctly
scoped as additive. This review records defects in the document itself, then
the gap between what §I assumes about Contract Scribe Pro and what CSP is.

Severity: **BLOCKER** = decide before the dependent sprint starts ·
**DEFECT** = wrong as written, cheap to fix · **NOTE** = worth knowing.

---

## Part 1 — Defects in the constitution

### C1 · DEFECT · §B says "five rules", lists six

> "Every PR must pass ALL five rules."

Six rules follow. B6 ("Complete or not shipped") is the one a tired reviewer
drops, and it is the rule §J exists to enforce. In a document whose stated
purpose is that "every reviewer enforces Section B before approving any PR",
a miscount is not cosmetic — it is an escape hatch. Change to "all six rules".

### C2 · DEFECT · §C references a section that was renamed

The first row of the event-flow table routes renewal tasks to
"Operations + Home". §A's amendment note elevated Operations to **Business**.
Stale as written; a reader implementing §C looks for a section that no longer
exists.

### C3 · DEFECT · `documentAlerts` has no uniqueness constraint

§D6 requires notification "exactly once per threshold (dedup verified)", and
§D1 calls `documentAlerts` "the dedup ledger so we never double-notify". But
the schema declares no unique key. Dedup by `SELECT`-then-`INSERT` (§D3 step 1)
is a race: two sweep workers, or one retried job, both read "no row" and both
insert. The distributed lock in §D3 narrows the window but does not close it —
locks expire, and a retry after a partial failure re-enters with the lock free.

Add `UNIQUE (companyDocumentId, thresholdDays)` and let the insert conflict be
the dedup mechanism. This is the difference between "we tested dedup" and
"dedup cannot fail".

### C4 · DEFECT · `renewal_in_progress` is a status nothing sets

`companyDocuments.status` has four values. §D3 step 4 describes transitions for
three (`active → expiring → expired`). Nothing in Sprint 1 sets
`renewal_in_progress` — the only flow implying it is §F5's marketplace
assignment, which is Sprint 6. Either define the Sprint-1 writer (a renewal
task moving to in-progress is the obvious one) or drop the value until Sprint 6
adds it. A status no code writes is a status every reader has to defend against
for no reason.

### C5 · NOTE · §G4 amends Sprint 2's scope without amending §E

§G4 pulls `jobTitleCatalog` universal seeds "forward into Sprint 2". §E, titled
**(Locked)**, still shows Sprint 2 as `plan_entitlements` + role editor only.
A locked sequence that other sections quietly widen is not locked. Update the
§E row so the sprint's scope is readable in one place — which is Rule B1
applied to the plan itself.

### C6 · BLOCKER · §H4's locks have no path for the 3 live tenants

§H4 is the strongest idea in the document and the most dangerous to deploy:

> an invoice cannot issue without `taxNumber` on file; WPS cannot run without a
> validated WPS bank account; a quotation cannot be sent without an authorized
> signatory

For a new tenant these are correct by construction — onboarding collects the
data before there is anything to invoice. For the three tenants already live,
switching them on converts an incomplete profile into a **hard stop on
invoicing and payroll**, discovered by the customer at the moment they try to
get paid. §D's feature flag protects Sprint 1; §H4 has no equivalent, and
`plan_entitlements` (Sprint 2) gates modules, not data completeness.

Before Sprint 7, decide and write down: a per-tenant enforcement flag, a
backfill window during which the lock warns instead of blocks, and which of the
three live tenants already satisfies each precondition. The rule stays; the
rollout needs a ramp.

### C7 · NOTE · The 90/60/30/7 ladder and the 30-day task are underspecified together

§C fires a notification at each of 90/60/30/7 days and creates the renewal task
at 30 (§D3 step 3). §J4 then closes an open renewal task "if new date >
today+90". So a document renewed to 60 days out keeps its task open — probably
right, but it means the 90 and 60 rungs notify with no task attached while the
30 and 7 rungs notify against an existing one. Worth stating explicitly in the
sweep spec, because it determines whether the notification copy can reference a
task.

### C8 · NOTE · Test-count figure

§D6 requires "full suite (5,427+) green". Other project material cites 3,967.
Whichever is current, an acceptance criterion pinned to a stale absolute number
fails for the wrong reason. "No net decrease in passing tests, ≥60 new" is the
testable form.

---

## Part 2 — Contract Scribe Pro vs. §I

§I2 states CSP "becomes the embedded contract layer" in Sprint 8. Measured
against what CSP is today:

### What §I assumes and CSP already has

| §I expectation | CSP today |
| :---- | :---- |
| Bilingual AR/EN template library, Oman-grounded | `src/lib/templateContent/` — 8 authored templates (employment, NDA, service agreement, tenancy, NOC-ROP, partnership, freelance, MSA), each a typed field schema + clause pairs |
| Contract lifecycle with status + dates | `contract_records` — status enum, start/end dates, `parent_id` renewal chain |
| Version history immutable, full audit trail | `contract_events` — append-only, 9 event types |
| Digital signature flow → signed copy filed | `create-signature-request` (Dropbox Sign) + `sendForSignature`/`sendViaWhatsApp` |
| Ministry letters, 7 authorities, honorifics | `src/lib/ministryLetters/` — MOL, MOCIPI, municipality, ROP, SPF, tax, other |
| Generate from platform data, zero re-entry | `smartpro-auth` SSO + party autofill into template tokens |

The reuse premise holds. §I2 is not optimistic.

### I1 · BLOCKER · Tenancy models do not meet

This is the one decision that must be made before Sprint 8 is planned, and
nothing in the document addresses it.

SmartPRO Hub is multi-tenant by `companyId` — every schema in the document
carries it, annotated "MANDATORY tenant scope on every query". CSP is
**single-user**: `contract_records`, `parties`, `contract_events` and
`profiles` are all scoped by `user_id`, and every RLS policy is
`auth.uid() = user_id`. There is no company, org, or tenant concept anywhere in
CSP's schema.

`smartpro-auth` bridges the two by email: a SmartPRO-signed JWT yields a magic
link for `payload.email`, creating one CSP user per email address, with no
company attached. The consequence:

> Two employees of the same tenant who both open Contract Scribe Pro get two
> disjoint CSP accounts and cannot see each other's contracts.

§I3's `contracts` table is `companyId`-scoped and §I4 files signed employment
contracts "in the employee record" — both assume a company-wide contract set.
CSP cannot serve that today, and the fix is not small in either direction:

- **Contracts live in SmartPRO Hub** (MySQL/Drizzle, `companyId`), CSP is a
  stateless generation + signature service. Cleanest for the constitution;
  makes CSP's own `contract_records`/`contract_events` a second home for the
  same fact, violating Rule B1 unless CSP stops persisting for embedded use.
- **Contracts stay in CSP** (Supabase), SmartPRO reads them. Requires adding
  company scope + RLS rewrite across every CSP table, and puts tenant data in
  a second database with its own backup and residency story.
- **Both, split by origin** — the worst option, and the one arrived at by not
  deciding.

Recommend deciding this before Sprint 7 finalises the entity model, since §H4's
"authorized signatory" lock (`signatoryUserId` in §I3) crosses the same border.

### I2 · DEFECT · §I3's `contracts` and CSP's `contract_records` have diverged

Same concept, two shapes. Mapping:

| §I3 field | CSP `contract_records` |
| :---- | :---- |
| `contractType` | — (implied by `template_id`) |
| `counterpartyType` / `counterpartyId` | `first_party_id` / `second_party_id` → `parties.role` |
| `status` (8 values, incl. `sent`, `signed`) | 6 values; `sent`/`signed` are `contract_events` rows, not statuses |
| `startDate` / `endDate` | `start_date` / `end_date` |
| `value` | — |
| `autoRenew` | — |
| `noticePeriodDays` | **added by this PR** |
| `version` (amendments) | `parent_id` chain (renewal) |
| `signatoryUserId` | — |

Two mismatches matter beyond naming:

1. **`sent` and `signed` as statuses vs. events.** CSP treats signature
   progress as timeline events, so a contract can be `active` *and* awaiting
   signature. §I3's enum forces those into one column, which cannot express
   "active but unsigned" — a real state for a contract in force pending a
   counter-signature.
2. **`version` vs. `parent_id`.** §I3 says "amendments create new version,
   history kept"; CSP models the chain as parent/child rows. The chain carries
   strictly more information (which specific prior contract) and survives
   deletion better. Recommend §I3 adopts CSP's shape rather than the reverse.

### I3 · DEFECT · No sweep exists on the CSP side

§I3 says the contract lifecycle uses "the same daily sweep
(`complianceVaultExpirySweep` extended)". CSP has **no scheduled job at all** —
expiry is derived in the browser at render time, so a contract that expires
overnight has a stored status of `active` until someone opens the page. Nothing
notifies anyone.

That is acceptable while CSP is a document tool. It is not acceptable once
§I4's automation chain depends on it ("contract `noticePeriodDays` reached →
alert + renew/terminate decision task"). Whoever owns the sweep, the stored
status has to become authoritative. This PR makes the derivation a single
testable function so a sweep can call the same code the UI calls, rather than a
fourth copy of the rule.

### I4 · NOTE · CSP's generated Supabase types describe a schema that no longer exists

`src/integrations/supabase/types.ts` knows 8 tables (`contracts`,
`signatories`, `documents`, `approval_tokens`, `image_chunks`, `ai_requests`,
`ai_responses`, `notifications`). **None** of the 11 tables created by
`supabase/migrations/` are in it — not `contract_records`, `parties`,
`contract_events`, `profiles`, `fill_seeds`, `user_templates`,
`template_leads`, `template_requests`, `letter_gate`, or `letter_formats`.

Every query against the real schema is therefore untyped, and `tsc --noEmit`
reports **127 errors** across 14 files, nearly all of them this. Nobody sees
them because `npm run build` is `vite build`, which does not typecheck, and
`npm run lint` does not either — so there is no gate between a wrong column
name and production.

This is the concrete form of §J's completeness standard being unenforceable in
this repo: the type system that would catch a missing field has been
disconnected from the schema for months. Regenerating
(`supabase gen types typescript --linked`) and adding `tsc --noEmit` to CI is
the prerequisite for §J meaning anything here — it is a prerequisite for
Sprint 8, not part of it.

---

## Part 3 — What this PR changes

Scoped to what is correct regardless of how I1 is decided.

1. **`src/lib/contractLifecycle.ts`** — one home for contract status. It was
   derived in four places with three implementations: `Records.tsx` (exported
   from a page), `RecordDetail.tsx` (importing helpers from that page),
   `Dashboard.tsx` (its own inline 30-day rule), `PartyDetail.tsx` (a copied
   colour map, rendering the raw enum `expiring_soon` to the user under a
   comment reading "same as Records.tsx will use"). Rule B1.
2. **Notice period drives the warning window** (§I3). `notice_period_days` on
   `contract_records`, editable on the record with validation matching the DB
   constraint, shown on the record, feeding `computeStatus`. Null keeps the
   previous 30-day behaviour, so no existing row changes meaning.
3. **`crossedThreshold()`** implements the §C 90/60/30/7 ladder so the sweep,
   when it is built, calls the same function the UI does.
4. **Bilingual status labels** (§J2 — "no English-only fields ever"). The AR
   strings are in the module; callers pass `"en"` because the Contracts screens
   have no language context yet. That gap is named in `CLAUDE.md`, not hidden.
5. **The Home cards' deep link now works** (Rule B2). Dashboard has always
   linked to `/records?status=expiring_soon` and `?status=expired`; Records
   never read the param, so both cards landed on an unfiltered list. The filter
   now lives in the URL, which also makes a filtered view shareable.
6. **Home's expiry counts now agree with the list they link to** (Rule B2
   again). Dashboard counted any record with a past `end_date` as expired,
   including drafts, while Records has always treated a draft as never
   expiring. So the card promised a number the destination list could not show.
   Both now call `computeStatus`.
7. **`CLAUDE.md`** — §A/§B/§J as this repo's PR gate, per the document's
   "Applies to: All future PRs".

Not built, deliberately: `contractType`, `value`, `autoRenew`, `version`,
`signatoryUserId`. Each is either already modelled differently in CSP (I2) or
depends on the tenancy decision (I1). Adding columns nothing writes would break
Rule B6 in the name of following §I3.

**Verification:** `npm run build` green · lint 144 → 141 problems (the three
removed warnings were ESLint flagging the exported-helpers-from-a-page smell;
the 120 pre-existing errors are untouched) · `tsc --noEmit` 127 → 128, the one
addition being another instance of the I4 `never`-typed-table error on the new
`notice_period_days` write, identical in kind to the five sibling lines around
it and resolved by regenerating types.

## Recommended next actions

| # | Action | Owner | Before |
| :---- | :---- | :---- | :---- |
| 1 | Decide where contracts live (I1) | Fahad | Sprint 7 planning |
| 2 | Fix C1–C4 in the constitution (one editing pass) | Fahad | next PR reviewed under it |
| 3 | Write the §H4 rollout ramp for the 3 live tenants (C6) | Fahad | Sprint 7 |
| 4 | Regenerate CSP Supabase types, add `tsc --noEmit` to CI (I4) | CSP | Sprint 8 |
| 5 | Reconcile §I3's schema with `contract_records` (I2) | Both | Sprint 8 planning |
| 6 | Add `UNIQUE (companyDocumentId, thresholdDays)` (C3) | SmartPRO | Sprint 1 merge |
