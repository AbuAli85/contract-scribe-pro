// smartpro-parties — server-side proxy for the SmartPro Hub parties API.
//
// The Hub's /api/contract-scribe/parties returns whole-company salary/IBAN/PII and
// accepts only a short-lived Hub-signed JWT (audience "contract-scribe-sso"). The
// signing secret (CONTRACT_SCRIBE_API_KEY) must never reach the browser, and the
// Hub JWT expires in minutes — so pages like RecordDetail (which run long after the
// SSO launch) can't authenticate directly. This function mints a fresh JWT
// server-side per call and relays the Hub's response.
//
// Authorization (tenant isolation — do not weaken):
//   - Caller must be an authenticated Supabase user (their access token in the
//     Authorization header).
//   - The company they may read is taken from the SERVER-controlled app_metadata
//     that smartpro-auth stamps at login (smartpro_company_id) — never from the
//     request body. The requested companyId must equal it, or 403.
//   - HUB_URL is a server env var, never client-supplied, so a caller cannot make
//     us send a valid Hub JWT to a host they control.
//
// Env (set via `supabase secrets set`): CONTRACT_SCRIBE_API_KEY, SMARTPRO_HUB_URL,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.15.4/index.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const apiKey = Deno.env.get("CONTRACT_SCRIBE_API_KEY");
    const hubUrl = Deno.env.get("SMARTPRO_HUB_URL");
    if (!apiKey || !hubUrl) return json({ error: "Not configured" }, 500);

    // 1. Authenticate the Supabase caller from their access token.
    const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!bearer) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user }, error: userErr } = await admin.auth.getUser(bearer);
    if (userErr || !user) return json({ error: "Invalid session" }, 401);

    // 2. The authorized company comes from server-controlled app_metadata only.
    const allowedCompanyId = Number((user.app_metadata ?? {}).smartpro_company_id);
    if (!Number.isInteger(allowedCompanyId) || allowedCompanyId <= 0) {
      return json({ error: "No SmartPro company link for this account" }, 403);
    }

    // 3. Enforce the requested company matches the caller's linked company.
    const { companyId } = (await req.json().catch(() => ({}))) as { companyId?: number | string };
    if (Number(companyId) !== allowedCompanyId) {
      return json({ error: "Not authorized for this company" }, 403);
    }

    // 4. Mint a fresh short-lived parties JWT (secret stays server-side).
    const token = await new jose.SignJWT({
      email: user.email,
      sub: String((user.app_metadata ?? {}).smartpro_user_id ?? user.id),
      companyId: allowedCompanyId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2m")
      .setAudience("contract-scribe-sso")
      .sign(new TextEncoder().encode(apiKey));

    // 5. Call the Hub and relay its response verbatim.
    const res = await fetch(
      `${hubUrl.replace(/\/$/, "")}/api/contract-scribe/parties?companyId=${allowedCompanyId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
