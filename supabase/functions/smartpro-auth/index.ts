import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.15.4/index.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { auth_token } = await req.json() as { auth_token?: string };
    if (!auth_token) {
      return json({ error: "auth_token required" }, 400);
    }

    const apiKey = Deno.env.get("CONTRACT_SCRIBE_API_KEY");
    if (!apiKey) return json({ error: "Not configured" }, 500);

    // Verify the SmartPro-signed JWT
    let payload: jose.JWTPayload;
    try {
      const { payload: p } = await jose.jwtVerify(
        auth_token,
        new TextEncoder().encode(apiKey),
        { audience: "contract-scribe-sso" },
      );
      payload = p;
    } catch {
      return json({ error: "Invalid or expired token" }, 401);
    }

    const email = payload.email as string | undefined;
    if (!email) return json({ error: "Token missing email" }, 401);

    // Create/find a Supabase user for this email and generate a magic-link token
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { shouldCreateUser: true },
    });

    if (linkErr || !linkData) {
      return json({ error: linkErr?.message ?? "Failed to generate link" }, 500);
    }

    // Return the hashed_token — client uses verifyOtp to exchange for a session
    return json({
      token_hash: linkData.properties.hashed_token,
      email,
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
