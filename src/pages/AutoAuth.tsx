import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText } from "lucide-react";

export default function AutoAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const attempted = useRef(false);

  const token = params.get("token") ?? "";
  const redirect = params.get("redirect") ?? "/dashboard";

  useEffect(() => {
    if (attempted.current || !token) {
      if (!token) navigate(`/auth?redirect=${encodeURIComponent(redirect)}`, { replace: true });
      return;
    }
    attempted.current = true;

    async function run() {
      // If already signed in, go straight to destination
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { navigate(redirect, { replace: true }); return; }

      try {
        // Exchange SmartPro SSO token for a Supabase magic-link token
        const { data: body, error: fnErr } = await supabase.functions.invoke<{
          token_hash?: string; type?: string; error?: string;
        }>("smartpro-auth", { body: { auth_token: token } });

        if (fnErr || !body?.token_hash) {
          throw new Error(body?.error ?? fnErr?.message ?? "Auto-sign-in failed");
        }

        // Exchange the token_hash for a real Supabase session
        const { error: otpErr } = await supabase.auth.verifyOtp({
          token_hash: body.token_hash,
          type: (body.type ?? "magiclink") as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
        });

        if (otpErr) throw otpErr;

        navigate(redirect, { replace: true });
      } catch {
        // Fall back to manual sign-in, preserving the intended destination
        navigate(`/auth?redirect=${encodeURIComponent(redirect)}`, { replace: true });
      }
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="flex items-center gap-2 text-primary font-bold text-lg">
        <FileText className="h-5 w-5" />
        Contract Scribe Pro
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Signing you in from SmartPro…
      </div>
    </div>
  );
}
