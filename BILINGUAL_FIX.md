# Bilingual Document Fix — what changed and how to deploy

## The problem

The previous `generateTemplatePdf.ts` used jsPDF with the `helvetica` font
family. Helvetica doesn't support Arabic glyphs — so every "bilingual"
template download was English-only. The Arabic text either rendered as
empty squares or was silently dropped. The product's #1 promise was
broken at the moment of delivery.

## The fix

Replaced jsPDF with the [`docx`](https://docx.js.org) package, which
generates real Microsoft Word `.docx` files with proper RTL shaping and
Arabic glyph rendering. Output is now a real Word document the customer
can edit — better than PDF for the actual use case.

### Files changed

| File | Change |
| ---- | ------ |
| `src/utils/docx/generateTemplateDocx.ts` | NEW — full bilingual .docx generator with Arabic + English section titles for all 8 templates. |
| `src/components/templates/EmailGateModal.tsx` | Switched import + call to `generateTemplateDocx`. |
| `src/pages/TemplateDownload.tsx` | Same swap. |
| `src/pages/Templates.tsx` | Feature copy updated: "Editable Word document" / "ملف Word جاهز للتحرير والتوقيع". |
| `supabase/functions/send-template-email/index.ts` | Email button label changed from `(PDF)` → `(Word .docx)` in both EN and AR. |

`src/utils/pdf/generateTemplatePdf.ts` is left in place but no longer
called. Safe to delete in a follow-up commit.

## Install + deploy

```bash
# One new dependency
npm install docx@^8.5.0
# file-saver is already in your tree from the BYO-template work — no install needed.

# Build + redeploy
npm run build
# (Vercel autodeploys on push)

# Redeploy the edge function to pick up the new email copy
supabase functions deploy send-template-email --no-verify-jwt
```

## What the output looks like

Each downloaded `.docx` now contains:

1. **Cover page** — bilingual title (English heading + Arabic heading
   stacked), date.
2. **Section table** — for each section, English title on the left and
   Arabic title on the right, side by side. Beneath each title is a
   placeholder block in both languages: `[ Insert clause text here ... ]`.
3. **Footer disclaimer** — bilingual disclaimer that the template is
   informational, not legal advice.
4. **Sourced** — small Contract Scribe Pro line in both languages.

The Arabic text is set with `rightToLeft: true` and uses the Arial font
(which ships with every Windows / macOS / Office install and has solid
Arabic glyphs). RTL paragraph direction is applied via the
`bidirectional: true` property on each Arabic paragraph.

## Why .docx beats PDF for this product

- **Customers actually want to edit these.** HR managers need to fill in
  employee names, dates, salaries — they can't do that with a PDF.
- **Arabic shaping is correct out of the box.** Word handles ligatures
  natively. jsPDF + arabic-reshaper hacks always look slightly off.
- **Smaller file size** — no embedded font binary needed.
- **Works on every Word version** — including the Arabic-localized
  Microsoft Office most Oman businesses already run.
- **Easy to convert to PDF later** — every Word version has a one-click
  "Save as PDF" if the customer wants that final output.

## Phase 2 — bring back the PDF (later)

If you eventually want both formats, add a "Download as PDF" button that
takes the generated .docx and converts it server-side via LibreOffice
headless in a Supabase Edge Function. That's a 1-day project, not now.
