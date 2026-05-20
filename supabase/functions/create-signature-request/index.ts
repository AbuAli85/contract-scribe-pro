// =============================================================
// Edge Function: create-signature-request
//
// Creates a Dropbox Sign (formerly HelloSign) signature request
// from a generated bilingual .docx blob. Returns a sign URL that
// can be embedded or shared via WhatsApp / email.
//
// Why Dropbox Sign over DocuSign:
//   - Free tier: 3 requests / month per account, enough to test
//   - Cleaner REST API, less SOAP-era weirdness
//   - Embeddable signing UI with brand customization
//
// Deploy:
//   supabase functions deploy create-signature-request --no-verify-jwt
//
// Secret:
//   DROPBOX_SIGN_API_KEY   from https://app.hellosign.com/home/myAccount#api
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface SignerInput {
  email: string;
  name: string;
  /** 1 = signs first, 2 = signs second, etc. */
  order?: number;
}

interface RequestBody {
  /** Base64-encoded .docx content */
  fileBase64: string;
  /** Filename to attach */
  filename: string;
  /** Document subject / title */
  title: string;
  /** Free-text message shown to signers */
  message?: string;
  signers: SignerInput[];
  /** Use Dropbox Sign test mode (no real signature, free) */
  testMode?: boolean;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Decode base64 to a Uint8Array (Deno-compatible)
function b64ToBytes(b64: string): Uint8Array {
  const binStr = atob(b64);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const {
      fileBase64,
      filename,
      title,
      message,
      signers,
      testMode = true,
    } = body;

    if (!fileBase64 || !filename || !title || !signers?.length) {
      return new Response(
        JSON.stringify({ error: "fileBase64, filename, title, signers required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const API_KEY = Deno.env.get("DROPBOX_SIGN_API_KEY");
    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          error: "DROPBOX_SIGN_API_KEY not configured",
          hint: "supabase secrets set DROPBOX_SIGN_API_KEY=...",
        }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Build multipart/form-data for the signature_request/send endpoint
    const form = new FormData();
    form.append("title", title);
    form.append("subject", title);
    if (message) form.append("message", message);
    form.append("test_mode", testMode ? "1" : "0");

    // Attach the .docx file
    const fileBytes = b64ToBytes(fileBase64);
    const blob = new Blob([fileBytes], {
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    form.append("file[0]", blob, filename);

    // Signers (Dropbox Sign uses indexed signers[i][email|name|order])
    signers.forEach((s, i) => {
      form.append(`signers[${i}][email_address]`, s.email);
      form.append(`signers[${i}][name]`, s.name);
      if (s.order !== undefined) {
        form.append(`signers[${i}][order]`, String(s.order));
        // Indicates the order matters (sequential signing)
        form.append("signing_options[default_type]", "draw");
      }
    });

    // Dropbox Sign API uses Basic auth with the API key as username, empty pass
    const auth = "Basic " + btoa(`${API_KEY}:`);
    const res = await fetch("https://api.hellosign.com/v3/signature_request/send", {
      method: "POST",
      headers: { Authorization: auth },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Dropbox Sign error:", errText);
      return new Response(
        JSON.stringify({ ok: false, error: errText }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const sigReq = data.signature_request;

    return new Response(
      JSON.stringify({
        ok: true,
        signatureRequestId: sigReq?.signature_request_id,
        // Per-signer URLs for in-browser signing (embedded) and email tracking
        signers: (sigReq?.signatures ?? []).map((s: any) => ({
          email: s.signer_email_address,
          name: s.signer_name,
          // signUrl is null unless you used /signature_request/create_embedded.
          // For send (the simpler flow), Dropbox emails the signer directly
          // and returns a status URL for tracking.
          statusCode: s.status_code,
        })),
        // Files URL — fetch the signed PDF once all signers complete
        filesUrl: sigReq?.files_url,
        // Convenient browser-facing URL where the requester can manage the request
        detailsUrl: sigReq?.details_url,
        testMode,
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-signature-request error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
