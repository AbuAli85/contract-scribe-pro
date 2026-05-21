// =============================================================
// Edge Function: detect-template-fields
//
// AI-powered template ingestion engine. Receives extracted text
// from an uploaded Word/Google document and asks Claude to
// produce a complete TemplateContent schema (fields + bilingual
// clauses with {token} substitutions), plus quality suggestions.
//
// Used by TWO surfaces:
//   1. The user-facing BYO upload — turns a customer's own .docx
//      into a fillable bilingual template inside Contract Scribe Pro.
//   2. The CLI ingestion script (scripts/ingest-template.mjs) —
//      drops a draft TemplateContent TS file ready for human review
//      and merge into the catalog.
//
// Deploy:
//   supabase functions deploy detect-template-fields --no-verify-jwt
//
// Required secret (Supabase Vault):
//   ANTHROPIC_API_KEY   Your Claude API key from console.anthropic.com
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface RequestBody {
  /** Plain text extracted from the .docx by the client */
  text: string;
  /** Detected or declared template category, optional hint */
  category?: string;
  /** Detected or declared primary language */
  lang?: "en" | "ar" | "bilingual";
  /**
   * Output mode:
   *   - "full" (default) returns the complete TemplateContent schema
   *     ready to use by the form generator and doc renderer.
   *   - "fields-only" returns just the field list (faster, smaller,
   *     for legacy callers that only need the placeholder scan).
   */
  mode?: "full" | "fields-only";
  /**
   * Hint for the generated template's machine ID — e.g. "service-agreement".
   * Used inside the returned TemplateContent.id. If not provided, the AI
   * will infer one from the detected category.
   */
  idHint?: string;
}

// ── TemplateContent-shaped output ────────────────────────────
type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency-omr"
  | "date"
  | "select"
  | "email"
  | "phone";

interface TemplateField {
  key: string;
  group: string;
  groupAr: string;
  labelEn: string;
  labelAr: string;
  type: FieldType;
  required: boolean;
  helperEn?: string;
  helperAr?: string;
  options?: { value: string; labelEn: string; labelAr: string }[];
  defaultValue?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  /**
   * Script-sensitive fields (party names, addresses, signatories) — the
   * form renders paired EN+AR inputs so the Arabic side never falls back
   * to Latin script. The AI should set this true for any field that would
   * be rendered as a proper noun (name, company, address).
   */
  bilingual?: boolean;
}

interface TemplateClause {
  headingEn: string;
  headingAr: string;
  /** Each entry = one paragraph. Use {field_key} to reference fields. */
  paragraphsEn: string[];
  paragraphsAr: string[];
}

interface Suggestion {
  type: "missing_clause" | "ambiguous_language" | "compliance_issue";
  severity: "low" | "medium" | "high";
  messageEn: string;
  messageAr: string;
}

interface IngestionResult {
  templateContent: {
    id: string;
    subtitleEn?: string;
    subtitleAr?: string;
    fields: TemplateField[];
    clauses: TemplateClause[];
  };
  suggestions: Suggestion[];
  detectedCategory: string;
  detectedLanguage: "en" | "ar" | "bilingual";
  /** Suggested catalog metadata so the CLI / upload UI can preview the card */
  catalogMeta: {
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    /** Suggested category name from our TemplateCategory enum */
    category: string;
    /** Suggested lucide-react icon name */
    icon: string;
  };
  confidence: number;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an expert legal document analyzer specialized in Oman/GCC contracts. You know Oman Labour Law (Royal Decree 35/2003), Commercial Companies Law (Royal Decree 18/2019), Civil Transactions Law (29/2013), Tenancy Law, and VAT Law (121/2020).

Your job: read the user's uploaded contract or legal document and produce a COMPLETE BILINGUAL TEMPLATE READY FOR USE — not just an analysis.

For each document you receive:

1. EXTRACT FIELDS — Identify every piece of variable information that should be a fillable field. For each:
   - snake_case "key" (e.g. employee_name, monthly_salary_omr, contract_start_date)
   - English + Arabic labels
   - Field type from: text, textarea, number, currency-omr, date, select, email, phone
   - Required flag (true unless the field is genuinely optional)
   - Logical group + Arabic group label
   - For "select" type, provide the options list with EN+AR labels
   - For script-sensitive fields (party names, company names, addresses, signatory names, job titles), set bilingual: true so the form will render paired EN+AR inputs.

2. AUTHOR BILINGUAL CLAUSES — For each clause in the document, produce both an English paragraph list AND an Arabic paragraph list. Inside the paragraphs, use {field_key} references that match the field keys you extracted. Critical rules:
   - Every {field_key} reference must match an actual field.key you produced.
   - paragraphsEn and paragraphsAr must have the SAME paragraph order (paragraph N in English corresponds to paragraph N in Arabic — they're the same legal content in two languages).
   - If the source document is English-only, TRANSLATE the clause text into proper formal legal Arabic. If Arabic-only, translate to formal legal English.
   - Cite the relevant Royal Decree / Oman law article inline when applicable.
   - Use professional Arabic legal register (formal, not colloquial).

3. SURFACE COMPLIANCE GAPS — In suggestions[], flag:
   - Missing standard clauses (e.g. no confidentiality, no governing law, no termination notice)
   - Ambiguous language that should be tightened
   - Possible non-compliance with Oman law (notice periods too short, wage clauses missing, etc.)
   For each suggestion include severity (low/medium/high) and Arabic translation of the message.

4. CATALOG METADATA — Suggest a clean catalog card: titleEn, titleAr, descEn (1 sentence, ~12 words), descAr (1 sentence), category (one of: "Employment & HR", "Business Agreements", "Sales & Vendors", "Real Estate", "Personal & Family", "Letters & Notices", "Freelance & Creative", "Technology & SaaS", "Government & Compliance", "Healthcare", "Education", "HR Bundle"), and icon (a lucide-react icon name like "FileText", "Briefcase", "Home", "Handshake").

5. ID — Use a kebab-case ID for the template. Examples: "employment", "service-agreement", "commercial-lease". If the user gave an idHint, use that.

Output rules:
- Return ONLY valid JSON. No markdown code fences. No commentary.
- Match the exact shape below.

{
  "templateContent": {
    "id": "kebab-case-id",
    "subtitleEn": "optional one-line subtitle",
    "subtitleAr": "...",
    "fields": [
      { "key": "...", "group": "...", "groupAr": "...", "labelEn": "...", "labelAr": "...", "type": "...", "required": true|false, "bilingual": true|false, "placeholderEn": "...", "placeholderAr": "...", "options": [{ "value": "...", "labelEn": "...", "labelAr": "..." }] }
    ],
    "clauses": [
      { "headingEn": "...", "headingAr": "...", "paragraphsEn": ["..."], "paragraphsAr": ["..."] }
    ]
  },
  "suggestions": [
    { "type": "...", "severity": "...", "messageEn": "...", "messageAr": "..." }
  ],
  "detectedCategory": "...",
  "detectedLanguage": "en"|"ar"|"bilingual",
  "catalogMeta": {
    "titleEn": "...", "titleAr": "...",
    "descEn": "...", "descAr": "...",
    "category": "...", "icon": "..."
  },
  "confidence": 0.0..1.0
}`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { text, category, lang, mode = "full", idHint } = body;

    if (!text || text.length < 50) {
      return new Response(
        JSON.stringify({ error: "Document text required (min 50 chars)" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY not configured",
          hint:
            "Set the secret via: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...",
        }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Cap input to ~50K chars to stay within sensible token budget.
    // Average contract is 5-20K chars so this comfortably accommodates
    // anything reasonable. Beyond 50K we'd lose later clauses anyway
    // since legal docs are usually written in order of importance.
    const trimmed = text.slice(0, 50_000);

    const userMessage = [
      category ? `Category hint: ${category}` : null,
      lang ? `Language hint: ${lang}` : null,
      idHint ? `ID hint (use this kebab-case ID): ${idHint}` : null,
      mode === "fields-only"
        ? "MODE: Fields-only — produce only the templateContent.fields array, leave clauses empty."
        : null,
      "",
      "Analyze the following document and produce the structured JSON described in the system prompt. Output ONLY the JSON, no commentary, no markdown code fences. Make sure every {field_key} inside a clause paragraph matches an actual field.key you produce.",
      "",
      "--- BEGIN DOCUMENT ---",
      trimmed,
      "--- END DOCUMENT ---",
    ]
      .filter(Boolean)
      .join("\n");

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31,output-128k-2025-02-19",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        // Cache the system prompt — it's ~3KB and identical for every ingestion.
        // On a cache hit this saves ~85% of input token cost (~$0.04 → ~$0.006).
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      return new Response(
        JSON.stringify({ ok: false, error: errText }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const claudeData = await claudeRes.json();
    const rawText =
      claudeData?.content?.[0]?.type === "text"
        ? claudeData.content[0].text
        : "";

    // Strip potential markdown code fences just in case
    const cleanJson = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: IngestionResult;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("Failed to parse Claude output:", cleanJson.slice(0, 500));
      return new Response(
        JSON.stringify({
          ok: false,
          error: "AI returned malformed JSON. Try again or fall back to manual scan.",
          rawSample: cleanJson.slice(0, 500),
        }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Post-processing: enforce schema invariants ───────────
    // Catch the common failure mode where the AI references a {token}
    // inside a clause that doesn't match any field.key — that would
    // render as a literal "{employee_name}" in the final document.
    const validKeys = new Set(
      parsed.templateContent?.fields?.map((f) => f.key) ?? []
    );
    const orphanTokens = new Set<string>();
    const tokenRe = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;
    for (const clause of parsed.templateContent?.clauses ?? []) {
      for (const para of [...clause.paragraphsEn, ...clause.paragraphsAr]) {
        let m: RegExpExecArray | null;
        while ((m = tokenRe.exec(para)) !== null) {
          if (!validKeys.has(m[1])) orphanTokens.add(m[1]);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        result: parsed,
        // Diagnostics so the CLI / upload UI can surface warnings before
        // the user commits the template to the catalog.
        diagnostics: {
          orphanTokens: [...orphanTokens],
          fieldCount: parsed.templateContent?.fields?.length ?? 0,
          clauseCount: parsed.templateContent?.clauses?.length ?? 0,
          bilingualFieldCount:
            parsed.templateContent?.fields?.filter((f) => f.bilingual).length ?? 0,
        },
        usage: {
          inputTokens: claudeData.usage?.input_tokens ?? null,
          outputTokens: claudeData.usage?.output_tokens ?? null,
          cacheReadTokens: claudeData.usage?.cache_read_input_tokens ?? null,
          cacheCreationTokens: claudeData.usage?.cache_creation_input_tokens ?? null,
        },
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("detect-template-fields error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
