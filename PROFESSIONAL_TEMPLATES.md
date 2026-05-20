# Professional Template System — what changed

This is the architectural shift from "skeleton templates with section
titles" to **real, fillable, bilingual contracts** with proper Oman legal
clauses.

## The new flow

```
/templates  →  click "Download Free"  →
   ↓
   if content is authored:
      /templates/fill/:id  →  multi-step form  →  generated bilingual .docx
   else:
      EmailGateModal (legacy quick-download)
```

## Files added

| File | Purpose |
| ---- | ------- |
| `src/lib/templateContent/types.ts` | `TemplateField`, `TemplateClause`, `TemplateContent` types — the contract between form generator and doc generator. |
| `src/lib/templateContent/employment.ts` | **The Employment Contract gold standard.** 14 clauses with full bilingual Oman Labour Law-compliant text and 19 fillable fields. Authority: Royal Decree 35/2003 and amendments. |
| `src/lib/templateContent/index.ts` | Registry of authored templates. Add new ones here. |
| `src/utils/docx/generateFilledContract.ts` | Content-aware doc generator. Reads `TemplateContent`, substitutes `{token}` placeholders, outputs bilingual .docx with proper Arabic text shaping. |
| `src/pages/FillTemplate.tsx` | Multi-step guided form at `/templates/fill/:id`. Groups fields by section (Employer → Employee → Role → Probation → Hours → Compensation → Termination → Signatures). Validates required fields. Generates + downloads on submit. |

## What the Employment Contract now produces

A 14-clause bilingual .docx with:

1. Parties to the Agreement (with CR number, addresses, IDs)
2. Position and Duties
3. Commencement Date and Contract Type (unlimited / limited)
4. Probationary Period (1–3 months, max per Article 23)
5. Working Hours and Weekly Rest (40 / 45 / 48 hours, includes Ramadan reduction)
6. Compensation and Allowances (basic + housing + transport + other, in OMR)
7. Annual Leave (30 calendar days after 6 months per Article 61)
8. Sick Leave (full scale per Article 63)
9. Overtime (1.25x ordinary, 1.5x weekly rest/holidays per Articles 69-70)
10. End-of-Service Gratuity (15 days × first 3 years + 1 month × subsequent per Article 39)
11. Termination and Notice Period (30/60/90 days)
12. Confidentiality (with 2-year post-employment period per Article 44)
13. Governing Law (Oman Labour Law, competent Omani courts)
14. Signatures (with the rule that Arabic prevails on conflict)

The user fills 19 fields once; the engine generates fully formed legal text in both languages.

## Adding the next template (NDA, Service Agreement, etc.)

1. Author `src/lib/templateContent/nda.ts` with the same `TemplateContent` shape.
2. Register it in `src/lib/templateContent/index.ts`.

That's it. The `/templates/fill/:id` form auto-adapts. The `.docx` generator handles the rendering. The flag on the catalog (`status: "ready"`) controls visibility.

## Install + ship

```bash
# The docx + file-saver deps installed for the bilingual fix already cover this.
# If you haven't installed them yet:
npm install docx file-saver
npm install --save-dev @types/file-saver

npm run build
git push   # Vercel auto-deploys
```

## Roadmap for full coverage

In priority order based on customer demand (visible once `template_requests` has data):

1. NDA / Confidentiality Agreement
2. Service Agreement
3. Tenancy Agreement (residential — high search volume)
4. Freelance Contract
5. Partnership Agreement
6. Sales & Purchase Agreement
7. NOC Letter (ROP) — government compliance, highest local demand
8. Salary Certificate, Experience Letter

Each is roughly the same effort as Employment took: define the field schema, author the bilingual clauses with proper Oman law references, register. Average 2 hours per template once the pattern is established.

## Why this is the right architecture

- **One engine, every template.** No custom code per contract type.
- **Real legal language, not placeholders.** Customers get a signable document, not a skeleton.
- **Bilingual side-by-side.** Arabic version is authoritative per Oman convention; conflict clause says so.
- **Schema-driven form.** Add a field to a template's `fields` array and it appears in the form automatically.
- **Audit-friendly.** Every clause cites the specific Oman law article it implements (Article 23, 39, 44, 61, 63, 68, 69, 70, 71).
