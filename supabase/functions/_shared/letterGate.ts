// =============================================================
// Ministry-letters free-tier gate — shared server logic
//
// Used by letter-otp-send, letter-otp-verify and
// letter-generate-check. Everything here is either PURE (and
// covered by letterGate.test.ts) or a thin wrapper over Web
// Crypto — no Supabase or network calls, so the rules stay
// testable without a database.
//
// Privacy invariants, do not break:
//   • raw OTP codes are never stored — only sha256(code + salt)
//   • raw IPs are never stored      — only sha256(ip + salt)
// The salt lives in the LETTER_GATE_SALT env var (server side
// only) so the hashes are useless if the table ever leaks.
// =============================================================

import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { isDisposableDomain } from "./disposableDomains.ts";

/** Free letters allowed per email / per device / per IP. */
export const FREE_LETTER_LIMIT = 2;

/** OTP lifetime, attempt ceiling, and send throttle. */
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS_PER_HOUR = 3;

/** Gate token lifetime — how long a verified email stays verified. */
export const GATE_TOKEN_DAYS = 30;

export const GATE_TOKEN_PURPOSE = "letter-gate";

// ---------------------------------------------------------------
// Email normalization + validation (pure)
// ---------------------------------------------------------------

/** Lowercase + trim. The stored form and the lookup form must agree. */
export function normalizeEmail(raw: string): string {
  return (raw ?? "").trim().toLowerCase();
}

/**
 * Deliberately stricter than the RFC: we want "could this plausibly
 * receive an MX-routed message", not "is this a legal address".
 * Rejects single-label domains (localhost), IP literals, and TLDs
 * that aren't alphabetic — none of which can hold a real inbox.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || email.length > 254) return false;
  if (/\s/.test(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;

  if (!domain || domain.length > 253) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;                          // no bare "localhost"
  if (labels.some((l) => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(l))) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;                   // no IP literals, no "example.1"

  return true;
}

export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1);
}

export type EmailRejection = "invalid_email" | "disposable_email";

/**
 * Single entry point the OTP sender uses: normalize, then decide.
 * Order matters — a malformed address is reported as malformed even
 * if it happens to sit on a burner domain.
 */
export function classifyEmail(
  raw: string,
): { ok: true; email: string } | { ok: false; reason: EmailRejection } {
  const email = normalizeEmail(raw);
  if (!isValidEmailFormat(email)) return { ok: false, reason: "invalid_email" };
  if (isDisposableDomain(emailDomain(email))) return { ok: false, reason: "disposable_email" };
  return { ok: true, email };
}

// ---------------------------------------------------------------
// Limit arithmetic (pure)
// ---------------------------------------------------------------

/** `count` = prior generations matching email OR device OR IP. */
export function hasReachedFreeLimit(count: number): boolean {
  return count >= FREE_LETTER_LIMIT;
}

/** Free letters left AFTER the one being generated right now. */
export function remainingAfterGeneration(count: number): number {
  return Math.max(0, FREE_LETTER_LIMIT - count - 1);
}

/** True once this wrong guess should burn the code entirely. */
export function shouldInvalidateCode(attemptsAfterThisTry: number): boolean {
  return attemptsAfterThisTry >= OTP_MAX_ATTEMPTS;
}

// ---------------------------------------------------------------
// Hashing + codes
// ---------------------------------------------------------------

/** sha256(value + ":" + salt) as lowercase hex. */
export async function hashWithSalt(value: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${value}:${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Guards the `.or()` filter below against anything but our own hashes. */
export function isHashLike(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value ?? "");
}

/** Cryptographically random 6-digit code, leading zeros preserved. */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

export function isOtpCodeShape(code: string): boolean {
  return /^[0-9]{6}$/.test((code ?? "").trim());
}

// ---------------------------------------------------------------
// Client IP (never stored raw — hashed by the caller)
// ---------------------------------------------------------------

/**
 * First hop of x-forwarded-for is the real client; the rest are proxies
 * and are attacker-controllable in the wrong order.
 */
export function extractClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? "unknown";
}

// ---------------------------------------------------------------
// Gate token (HS256 JWT keyed by the same salt)
// ---------------------------------------------------------------

export interface GatePayload {
  email: string;
  purpose: typeof GATE_TOKEN_PURPOSE;
  exp?: number;
}

async function gateKey(salt: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signGateToken(email: string, salt: string): Promise<string> {
  return await create(
    { alg: "HS256", typ: "JWT" },
    {
      email,
      purpose: GATE_TOKEN_PURPOSE,
      exp: getNumericDate(GATE_TOKEN_DAYS * 24 * 60 * 60),
    },
    await gateKey(salt),
  );
}

/** Returns the verified email, or null for any tampered/expired/foreign token. */
export async function verifyGateToken(token: string, salt: string): Promise<string | null> {
  if (!token) return null;
  try {
    const payload = (await verify(token, await gateKey(salt))) as unknown as GatePayload;
    if (payload?.purpose !== GATE_TOKEN_PURPOSE) return null;
    const email = normalizeEmail(payload?.email ?? "");
    return isValidEmailFormat(email) ? email : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// HTTP plumbing — matches the existing functions in this repo
// ---------------------------------------------------------------

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
