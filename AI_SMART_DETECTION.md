# AI Smart Detection — Setup Guide

The `/my-templates` upload page now offers two scan modes:

- **Smart AI scan** *(recommended, default)* — Claude reads any Word document, identifies fillable fields automatically. No `{placeholder}` syntax needed.
- **Manual {placeholder}** — Free, instant regex scan for docs you've pre-tokenized.

This is the moat. Nobody else in the Oman/GCC contract space does this.

## Files added/changed

| File | Purpose |
| ---- | ------- |
| `supabase/functions/detect-template-fields/index.ts` | Edge Function that calls the Claude API with a structured-output prompt. Returns fields + clauses + suggestions + language detection. |
| `src/lib/templateEngine.ts` | Added `extractTextFromDocx()`, `scanTemplateWithAi()`, `AiScanResult` types. |
| `src/pages/MyTemplates.tsx` | Scan-mode picker, AI loading state, AI-confidence display, "AI suggestions" panel for missing-clause warnings. |

## Deploy

```bash
# 1. Deploy the edge function
supabase functions deploy detect-template-fields --no-verify-jwt

# 2. Set the Claude API key as a Supabase secret (one-time)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-XXXXX
# Get the key from https://console.anthropic.com/settings/keys

# 3. Push the frontend
npm run build && git push
```

## How it works

1. User picks **Smart AI scan** mode and uploads a .docx.
2. Browser unzips the .docx, extracts plain text from `word/document.xml` + headers/footers (already had this code from the regex scanner).
3. Browser calls `supabase.functions.invoke('detect-template-fields', { body: { text } })`.
4. Edge Function forwards the text to Claude Sonnet with a structured prompt asking for: fields, clauses, missing clauses, language detection.
5. Claude returns strict JSON.
6. Edge Function validates + returns to the browser.
7. UI shows: detected fields table, AI badge with confidence %, suggestions panel for missing clauses (e.g., "Add a confidentiality clause per Article 44").
8. User confirms → goes into the same fill-and-merge flow as before.

## Cost

| Operation | Approx tokens | Approx cost (Sonnet) |
| --- | --- | --- |
| Average doc (5 pages) | 5K in + 2K out | ~$0.04 |
| Long doc (20 pages) | 20K in + 4K out | ~$0.12 |

At 100 free-tier scans/month, you'd spend ~$4. Easily recovered by even one Pro conversion.

## Freemium gate (next step)

When you wire freemium + auth, add a check in the Edge Function:

```ts
// In detect-template-fields/index.ts
// Read user.plan from auth context, count this month's scans
const { data: usage } = await supabase
  .from('ai_scans')
  .select('id', { count: 'exact' })
  .eq('user_id', userId)
  .gte('created_at', startOfMonth);

if (user.plan === 'free' && usage.length >= 3) {
  return new Response(JSON.stringify({
    error: 'free_quota_exhausted',
    upgradeUrl: '/pricing',
  }), { status: 402 });
}
```

Free: 3 AI scans / month. Pro: unlimited.

## Security

- Claude API key lives in Supabase Vault — never exposed to the browser.
- Documents are processed in-memory by the Edge Function and never persisted to Supabase Storage.
- Anthropic does not train on API inputs by default.
- CORS allows all origins on the function (the Supabase anon key + JWT still gates who can call it; tighten later).

## Phase 3 — AI clause editing inside fill forms

Same architecture, different prompt. On any authored template (Employment, NDA, etc.), the user can ask:

- "Add a 6-month non-compete for the GCC region"
- "Make the notice period stricter for executives"
- "Rewrite the probation clause in more formal Arabic"

A new Edge Function `modify-clause` takes the existing clause + a natural-language instruction, returns the new clause text in both EN and AR. UI shows a diff; user accepts or rejects.

That's the killer Pro feature — single biggest justification for paid tier.
