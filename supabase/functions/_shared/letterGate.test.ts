// =============================================================
// Tests for the ministry-letters gate logic.
//
// The frontend has no test runner configured, and the rules that
// matter here (limit arithmetic, burner detection, normalization)
// are server-side anyway — so they live as Deno tests next to the
// code they cover.
//
// Run:  deno test supabase/functions/_shared/letterGate.test.ts
// =============================================================

import { assert, assertEquals, assertFalse } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isDisposableDomain } from "./disposableDomains.ts";
import {
  classifyEmail,
  extractClientIp,
  FREE_LETTER_LIMIT,
  generateOtpCode,
  hashWithSalt,
  hasReachedFreeLimit,
  isHashLike,
  isOtpCodeShape,
  isValidEmailFormat,
  normalizeEmail,
  remainingAfterGeneration,
  shouldInvalidateCode,
  signGateToken,
  verifyGateToken,
} from "./letterGate.ts";

// ---------------------------------------------------------------
// Email normalization
// ---------------------------------------------------------------

Deno.test("normalizeEmail lowercases and trims", () => {
  assertEquals(normalizeEmail("  Ali@Example.COM \n"), "ali@example.com");
  assertEquals(normalizeEmail(""), "");
});

Deno.test("normalizeEmail is idempotent — stored and looked-up forms agree", () => {
  const once = normalizeEmail(" User@Domain.OM ");
  assertEquals(normalizeEmail(once), once);
});

// ---------------------------------------------------------------
// Email format
// ---------------------------------------------------------------

Deno.test("isValidEmailFormat accepts ordinary addresses", () => {
  for (const e of [
    "ali@example.com",
    "a.b+tag@sub.domain.co.uk",
    "user_name@company.om",
    "x@a.io",
  ]) {
    assert(isValidEmailFormat(e), `expected valid: ${e}`);
  }
});

Deno.test("isValidEmailFormat rejects addresses that cannot hold an inbox", () => {
  for (const e of [
    "",
    "no-at-sign.com",
    "two@@example.com",
    "user@localhost",          // single-label domain
    "user@192.168.1.1",        // IP literal — TLD is not alphabetic
    "user@example.1",
    "user@-example.com",
    "user@example-.com",
    "user@.example.com",
    ".user@example.com",
    "user.@example.com",
    "us..er@example.com",
    "user name@example.com",
    "user@exa mple.com",
    `${"a".repeat(65)}@example.com`,
  ]) {
    assertFalse(isValidEmailFormat(e), `expected invalid: ${e}`);
  }
});

// ---------------------------------------------------------------
// Disposable domains
// ---------------------------------------------------------------

Deno.test("isDisposableDomain catches known burners", () => {
  for (const d of ["mailinator.com", "yopmail.com", "10minutemail.com", "sharklasers.com"]) {
    assert(isDisposableDomain(d), `expected disposable: ${d}`);
  }
});

Deno.test("isDisposableDomain matches subdomains but not lookalikes", () => {
  assert(isDisposableDomain("inbox.yopmail.com"));
  assert(isDisposableDomain("mail.relay.mailinator.com"));
  assertFalse(isDisposableDomain("notyopmail.com"));
  assertFalse(isDisposableDomain("mailinator.com.example.org"));
  assertFalse(isDisposableDomain("gmail.com"));
});

Deno.test("isDisposableDomain is case- and dot-insensitive", () => {
  assert(isDisposableDomain("YOPMAIL.COM"));
  assert(isDisposableDomain("yopmail.com."));
});

// ---------------------------------------------------------------
// classifyEmail — the OTP sender's gate
// ---------------------------------------------------------------

Deno.test("classifyEmail normalizes before deciding", () => {
  const r = classifyEmail("  Ali@Example.COM ");
  assert(r.ok);
  assertEquals(r.email, "ali@example.com");
});

Deno.test("classifyEmail reports malformed before disposable", () => {
  const r = classifyEmail("bad address@mailinator.com");
  assertFalse(r.ok);
  if (!r.ok) assertEquals(r.reason, "invalid_email");
});

Deno.test("classifyEmail rejects burners, including via subdomain", () => {
  for (const e of ["throwaway@mailinator.com", "x@INBOX.yopmail.com"]) {
    const r = classifyEmail(e);
    assertFalse(r.ok, `expected rejection: ${e}`);
    if (!r.ok) assertEquals(r.reason, "disposable_email");
  }
});

// ---------------------------------------------------------------
// Limit arithmetic — 2 free letters
// ---------------------------------------------------------------

Deno.test("free limit is 2 and blocks only at the third attempt", () => {
  assertEquals(FREE_LETTER_LIMIT, 2);
  assertFalse(hasReachedFreeLimit(0));
  assertFalse(hasReachedFreeLimit(1));
  assert(hasReachedFreeLimit(2));
  assert(hasReachedFreeLimit(7)); // backfilled/legacy rows must still block
});

Deno.test("remaining count walks 1 -> 0 and never goes negative", () => {
  assertEquals(remainingAfterGeneration(0), 1);
  assertEquals(remainingAfterGeneration(1), 0);
  assertEquals(remainingAfterGeneration(2), 0);
  assertEquals(remainingAfterGeneration(99), 0);
});

Deno.test("code burns after the 5th wrong guess, not before", () => {
  assertFalse(shouldInvalidateCode(1));
  assertFalse(shouldInvalidateCode(4));
  assert(shouldInvalidateCode(5));
  assert(shouldInvalidateCode(6));
});

// ---------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------

Deno.test("hashWithSalt is deterministic, salt-dependent, and hex-shaped", async () => {
  const a = await hashWithSalt("1.2.3.4", "salt-a");
  const b = await hashWithSalt("1.2.3.4", "salt-a");
  const c = await hashWithSalt("1.2.3.4", "salt-b");
  const d = await hashWithSalt("1.2.3.5", "salt-a");

  assertEquals(a, b);
  assert(a !== c, "different salts must not collide");
  assert(a !== d, "different inputs must not collide");
  assert(isHashLike(a));
  assertEquals(a.length, 64);
});

Deno.test("hashWithSalt output never contains the raw value", async () => {
  const ip = "84.235.12.9";
  const h = await hashWithSalt(ip, "pepper");
  assertFalse(h.includes(ip));
});

Deno.test("isHashLike rejects anything that could poison an .or() filter", () => {
  assertFalse(isHashLike(""));
  assertFalse(isHashLike("abc"));
  assertFalse(isHashLike("A".repeat(64)));            // uppercase
  assertFalse(isHashLike("a".repeat(63)));
  assertFalse(isHashLike(`${"a".repeat(63)},email.eq.x@y.com`));
});

// ---------------------------------------------------------------
// OTP codes
// ---------------------------------------------------------------

Deno.test("generateOtpCode always yields 6 digits, leading zeros kept", () => {
  for (let i = 0; i < 500; i++) {
    const code = generateOtpCode();
    assertEquals(code.length, 6);
    assert(isOtpCodeShape(code), `bad code: ${code}`);
  }
});

Deno.test("isOtpCodeShape rejects non-6-digit input", () => {
  assert(isOtpCodeShape("000000"));
  assert(isOtpCodeShape(" 123456 "));
  assertFalse(isOtpCodeShape("12345"));
  assertFalse(isOtpCodeShape("1234567"));
  assertFalse(isOtpCodeShape("12345a"));
  assertFalse(isOtpCodeShape(""));
});

// ---------------------------------------------------------------
// Client IP
// ---------------------------------------------------------------

Deno.test("extractClientIp takes the first x-forwarded-for hop", () => {
  const h = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });
  assertEquals(extractClientIp(h), "203.0.113.7");
});

Deno.test("extractClientIp falls back through proxy headers", () => {
  assertEquals(extractClientIp(new Headers({ "cf-connecting-ip": "198.51.100.4" })), "198.51.100.4");
  assertEquals(extractClientIp(new Headers({ "x-real-ip": "198.51.100.5" })), "198.51.100.5");
  assertEquals(extractClientIp(new Headers()), "unknown");
});

// ---------------------------------------------------------------
// Gate token
// ---------------------------------------------------------------

Deno.test("gate token round-trips the verified email", async () => {
  const token = await signGateToken("ali@example.com", "test-salt");
  assertEquals(await verifyGateToken(token, "test-salt"), "ali@example.com");
});

Deno.test("gate token signed with another salt is rejected", async () => {
  const token = await signGateToken("ali@example.com", "test-salt");
  assertEquals(await verifyGateToken(token, "other-salt"), null);
});

Deno.test("tampered or missing gate tokens are rejected, never thrown", async () => {
  const token = await signGateToken("ali@example.com", "test-salt");
  assertEquals(await verifyGateToken(`${token}x`, "test-salt"), null);
  assertEquals(await verifyGateToken("", "test-salt"), null);
  assertEquals(await verifyGateToken("not.a.jwt", "test-salt"), null);
});
