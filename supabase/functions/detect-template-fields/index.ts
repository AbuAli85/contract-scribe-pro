// =============================================================
// Edge Function: detect-template-fields
//
// AI-powered smart detection. Receives extracted text from an
// uploaded Word/Google document and asks Claude to identify
// fillable fields, clause structure, and missing standard clauses.
//
// Returns structured JSON ready to feed into the existing
// template engine + fill form.
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
}

interface DetectedField {
  key: string;
  labelEn: string;
  labelAr: string;
  type: "text" | "textarea" | "number" | "currency-omr" | "date" | "select" | "email" | "phone";
  required: boolean;
  group: string;
  groupAr: string;
  options?: { value: string; labelEn: string; labelAr: string }[];
  /** Where in the source text we detected this (helps the UI highlight) */
  sourceSnippet?: string;
}

interface DetectedClause {
  headingEn: string;
  headingAr: string;
  /** Plain text of the clause as it appears in source */
  body: string;
}

interface Suggestion {
  type: "missing_clause" | "ambiguous_language" | "compliance_issue";
  severity: "low" | "medium" | "high";
  messageEn: string;
  messageAr: string;
}

interface DetectionResult {
  fields: DetectedField[];
  clauses: DetectedClause[];
  suggestions: Suggestion[];
  detectedCategory: string;
  detectedLanguage: "en" | "ar" | "bilingual";
  confidence: number; // 0..1
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an expert legal document analyzer specialized in Oman/GCC contracts and the Oman Labour Law (Royal Decree 35/2003).

Your job: read the user's uploaded contract or legal document and produce a STRUCTURED ANALYSIS in JSON format.

For each document you receive:
1. Identify every piece of variable information that should be a FILLABLE FIELD (names, dates, amounts, durations, addresses, etc.) — these are the things that change per-contract.
2. Identify every CLAUSE — the structural sections of the contract with their headings and body text.
3. Identify any STANDARD CLAUSES that appear to be MISSING (e.g., a contract with no confidentiality clause, no governing law, no termination clause).
4. Detect whether the document is in English, Arabic, or already bilingual.
5. Detect the contract category.

Output rules:
- Use snake_case for field keys.
- For currency amounts in OMR, use field type "currency-omr".
- For dates, use field type "date".
- For things that should be picked from a fixed list (notice period, contract duration, etc.), use type "select" and provide options.
- Always produce BOTH English and Arabic versions of every label, heading, and message.
- Group fields by logical section (Employer, Employee, Compensation, etc.).
- Cite the relevant Oman law article in suggestions when applicable.

Return ONLY valid JSON matching this exact shape:
{
  "fields": [
    { "key": "...", "labelEn": "...", "labelAr": "...", "type": "...", "required": true|false, "group": "...", "groupAr": "...", "options": [...optional], "sourceSnippet": "...optional" }
  ],
  "clauses": [
    { "headingEn": "...", "headingAr": "...", "body": "..." }
  ],
  "suggestions": [
    { "type": "...", "severity": "...", "messageEn": "...", "messageAr": "..." }
  ],
  "detectedCategory": "...",
  "detectedLanguage": "en"|"ar"|"bilingual",
  "confidence": 0.0..1.0
}`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { text, category, lang } = (await req.json()) as RequestBody;

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

    // Cap input to ~50K chars to stay within sensible token budget
    const trimmed = text.slice(0, 50_000);

    const userMessage = [
      category ? `Category hint: ${category}` : null,
      lang ? `Language hint: ${lang}` : null,
      "",
      "Analyze the following document and produce the structured JSON described in the system prompt. Return ONLY the JSON, no commentary, no markdown code fences.",
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
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
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

    let parsed: DetectionResult;
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

    return new Response(
      JSON.stringify({
        ok: true,
        result: parsed,
        // Surface basic usage info for client-side cost tracking
        usage: {
          inputTokens: claudeData.usage?.input_tokens ?? null,
          outputTokens: claudeData.usage?.output_tokens ?? null,
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
