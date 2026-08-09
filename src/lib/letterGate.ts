// =============================================================
// Client half of the /letters free-tier gate
//
// Thin wrappers over the three Edge Functions plus the localStorage
// handling for the gate token. All of the actual rules — burner
// domains, the 2-letter limit, code validity — are enforced server
// side; nothing here is a security boundary, it only shapes the UI.
// =============================================================

import { supabase } from "@/integrations/supabase/client";
import { getDeviceHash } from "@/lib/deviceFingerprint";

const TOKEN_KEY = "letter_gate_token";

export interface StoredGate {
  token: string;
  email: string;
}

export function readStoredGate(): StoredGate | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredGate>;
    if (!parsed?.token || !parsed?.email) return null;
    return { token: parsed.token, email: parsed.email };
  } catch {
    return null;
  }
}

export function storeGate(gate: StoredGate): void {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(gate));
  } catch {
    // Storage blocked — the visitor just re-verifies next time.
  }
}

export function clearStoredGate(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* no-op */
  }
}

/**
 * supabase-js turns any non-2xx into an error and hides the body, but the
 * body is exactly what carries our error code — so dig it back out.
 */
async function invokeGate<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data?: T; error?: string }> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const parsed = await ctx.json();
        if (parsed?.error) return { error: String(parsed.error) };
      } catch {
        /* fall through to the generic code */
      }
    }
    return { error: "network_error" };
  }

  return { data: data as T };
}

export async function sendLetterOtp(email: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await invokeGate<{ ok?: boolean }>("letter-otp-send", { email });
  if (error) return { ok: false, error };
  return { ok: data?.ok === true };
}

export async function verifyLetterOtp(
  email: string,
  code: string,
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const { data, error } = await invokeGate<{ ok?: boolean; token?: string }>(
    "letter-otp-verify",
    { email, code },
  );
  if (error) return { ok: false, error };
  if (!data?.token) return { ok: false, error: "invalid_code" };
  return { ok: true, token: data.token };
}

export interface GenerationCheckInput {
  token: string;
  authority: string;
  letterType: string;
  language?: string;
}

export interface GenerationCheckResult {
  ok: boolean;
  /** null = unlimited (pro). Otherwise free letters left after this one. */
  remaining?: number | null;
  error?: string;
}

export async function checkLetterGeneration(
  input: GenerationCheckInput,
): Promise<GenerationCheckResult> {
  const deviceHash = await getDeviceHash();
  const { data, error } = await invokeGate<{ ok?: boolean; remaining?: number | null }>(
    "letter-generate-check",
    {
      token: input.token,
      device_hash: deviceHash,
      authority: input.authority,
      letter_type: input.letterType,
      language: input.language ?? "ar",
    },
  );

  if (error) return { ok: false, error };
  return { ok: data?.ok === true, remaining: data?.remaining ?? null };
}
