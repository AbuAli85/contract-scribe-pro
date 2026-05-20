# Bilingual Input Fields — quality fix

## The problem we just solved

Before: a single input field per piece of data. When a user filled `employee_name = "Mohammed Ahmed Al-Balushi"`, both the English clause AND the Arabic clause in the generated .docx showed Latin script. Arabic readers expect Arabic script in the Arabic column ("محمد أحمد البلوشي"). The output looked unprofessional and made the platform unusable for any serious Omani business.

After: any field can now be marked `bilingual: true`. The form renders two side-by-side inputs — one for the English value, one for the Arabic value. The generator picks the right one for each language column.

## How it works

### Schema

`TemplateField` has a new optional flag:

```ts
{
  key: "employee_name",
  bilingual: true,
  labelEn: "Employee Full Name",
  labelAr: "الاسم الكامل للموظف",
  placeholderEn: "Mohammed Ahmed Al-Balushi",
  placeholderAr: "محمد أحمد البلوشي",
}
```

### Form UI

When `bilingual: true`, the user sees a paired input. The English half is LTR, the Arabic half is auto-RTL with right-aligned text. Both halves are required when the field is required.

### Document generator

`generateFilledContract.ts` resolves tokens intelligently:

- A clause paragraph in English with `{employee_name}` → looks up `values.employee_name_en`
- A clause paragraph in Arabic with `{employee_name}` → looks up `values.employee_name_ar`
- Falls back to the other language if one is empty
- Non-bilingual fields work exactly as before

You can also use explicit `{employee_name_en}` or `{employee_name_ar}` if you need both languages in the same paragraph (rare).

## What's marked bilingual on the Employment Contract

Script-sensitive fields:

- `company_name`, `company_address`
- `employee_name`, `employee_nationality`, `employee_address`
- `job_title`, `department`
- `company_signatory`, `company_signatory_title`

Stays single-input:

- `company_cr`, `employee_id` — numeric/Latin in both languages
- `start_date`, all numbers — formatted per locale automatically
- All `select` dropdowns — already bilingual via labelEn + labelAr

## Migrating other templates

For NDA, Service Agreement, Tenancy, NOC ROP, Partnership, Freelance, MSA — open the file in `src/lib/templateContent/` and add `bilingual: true` to any field that captures a name, company, address, job title, or signatory. ~5 minutes per template. Fully additive — existing fields without the flag work as before.

## Strategic context

MSA was just moved from `status: "pro"` → `status: "ready"`. The entire 8-template library + AI Smart Detection is now free during the audience-building phase. Once we have meaningful traffic, the Pro tier comes back via Smart Yaro's existing subscription infrastructure — and at that point users will already have invested time in the platform, so the upgrade becomes natural rather than a day-one paywall.
