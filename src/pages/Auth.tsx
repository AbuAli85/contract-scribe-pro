import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText } from "lucide-react";

type Mode = "login" | "signup" | "reset";

const COPY = {
  login:  { title: "Sign in",        sub: "Welcome back",                        cta: "Sign in",           alt: "Don't have an account?", altLink: "signup", altLabel: "Create one" },
  signup: { title: "Create account", sub: "Start generating contracts for free", cta: "Create account",    alt: "Already have an account?", altLink: "login", altLabel: "Sign in" },
  reset:  { title: "Reset password", sub: "We'll email you a reset link",        cta: "Send reset email",  alt: "Remembered it?", altLink: "login", altLabel: "Sign in" },
};

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const initialMode = (params.get("mode") as Mode) ?? "login";
  const redirect = params.get("redirect") ?? "/templates";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already signed in, skip to redirect
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) navigate(redirect, { replace: true });
      })
      .catch(() => {});
  }, [navigate, redirect]);

  const c = COPY[mode];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(redirect, { replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth?mode=login` },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link. Click it to activate your account.",
        });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=login`,
        });
        if (error) throw error;
        toast({ title: "Reset email sent", description: "Check your inbox for the reset link." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    const p = new URLSearchParams(params);
    p.set("mode", m);
    navigate(`/auth?${p.toString()}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 mb-8 text-primary font-bold text-lg">
        <FileText className="h-5 w-5" />
        Contract Scribe Pro
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle>{c.title}</CardTitle>
          <CardDescription>{c.sub}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Minimum 6 characters" : ""}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {c.cta}
            </Button>
          </form>

          <Separator className="my-4" />

          <p className="text-center text-sm text-muted-foreground">
            {c.alt}{" "}
            <button
              type="button"
              onClick={() => switchMode(c.altLink as Mode)}
              className="font-medium text-primary hover:underline"
            >
              {c.altLabel}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
