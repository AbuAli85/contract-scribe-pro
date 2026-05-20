// =============================================================
// Client-side helpers for the e-signature + WhatsApp share flow.
//
// Together with translate.ts these wire Contract Scribe Pro into
// the three external services that turn it from "doc generator"
// into "end-to-end contract platform":
//   - DeepL Pro          — bilingual auto-translate (translate.ts)
//   - Dropbox Sign       — e-signature (this file)
//   - Twilio WhatsApp    — share signing link in MENA's #1 channel (this file)
// =============================================================

import { supabase } from "@/integrations/supabase/client";

// ── Helpers ──────────────────────────────────────────────────────
async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  // Convert ArrayBuffer → base64 without exhausting the call stack
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return btoa(binary);
}

// ── E-signature ──────────────────────────────────────────────────
export interface Signer {
  email: string;
  name: string;
  /** 1-based sequential order. Omit for parallel signing. */
  order?: number;
}

export interface SignatureRequestResult {
  signatureRequestId: string;
  detailsUrl: string;
  filesUrl: string;
  testMode: boolean;
}

/**
 * Upload the generated .docx blob to Dropbox Sign and create a
 * signature request. Signers receive an email from Dropbox Sign
 * with a tracked "Click to sign" button. Returns the request ID
 * and a status URL we can show the user.
 */
export async function sendForSignature(opts: {
  blob: Blob;
  filename: string;
  title: string;
  message?: string;
  signers: Signer[];
  testMode?: boolean;
}): Promise<SignatureRequestResult> {
  const fileBase64 = await blobToBase64(opts.blob);
  const { data, error } = await supabase.functions.invoke(
    "create-signature-request",
    {
      body: {
        fileBase64,
        filename: opts.filename,
        title: opts.title,
        message: opts.message,
        signers: opts.signers,
        testMode: opts.testMode ?? true,
      },
    }
  );

  if (error) throw new Error(error.message ?? "Signature request failed");
  if (!data?.ok) throw new Error(data?.error ?? "Signature service unavailable");

  return {
    signatureRequestId: data.signatureRequestId,
    detailsUrl: data.detailsUrl,
    filesUrl: data.filesUrl,
    testMode: data.testMode,
  };
}

// ── WhatsApp share ───────────────────────────────────────────────
export async function sendViaWhatsApp(opts: {
  to: string;
  message: string;
  link?: string;
}): Promise<{ messageSid: string; status: string }> {
  const { data, error } = await supabase.functions.invoke("send-whatsapp", {
    body: opts,
  });
  if (error) throw new Error(error.message ?? "WhatsApp send failed");
  if (!data?.ok) throw new Error(data?.error ?? "WhatsApp service unavailable");
  return { messageSid: data.messageSid, status: data.status };
}
