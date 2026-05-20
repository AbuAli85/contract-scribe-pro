import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Zap, FileText, CheckCircle2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PRO_FEATURES = [
  "Master Services Agreement (MSA)",
  "Commercial Lease Agreement",
  "Property Sale Agreement",
  "All future Pro templates included",
  "Priority email support",
];

const FREE_FEATURES = [
  "7 bilingual templates (Employment, NDA, Service Agreement, Tenancy, Partnership, Freelance, NOC)",
  "Guided fill form — no Word editing needed",
  "Download as bilingual Word .docx",
  "Oman Labour Law & Civil Transactions Law compliant",
];

export default function Upgrade() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const status = params.get("status");

  // Show success toast when Stripe redirects back with ?status=success
  useEffect(() => {
    if (status === "success") {
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is active. All Pro templates are now unlocked.",
      });
    }
  }, [status, toast]);

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/auth?mode=login&redirect=/upgrade";
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-checkout-session", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      const { url } = res.data as { url: string };
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Could not start checkout",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const alreadyPro = !loading && profile?.is_pro;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto h-14 flex items-center justify-between px-4">
          <Link to="/templates" className="flex items-center gap-2 text-primary font-bold">
            <FileText className="h-4 w-4" />
            Contract Scribe Pro
          </Link>
          {!user && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth?mode=login">Sign in</Link>
            </Button>
          )}
          {user && !alreadyPro && (
            <Badge variant="outline" className="text-xs">Free plan</Badge>
          )}
          {alreadyPro && (
            <Badge className="gap-1 text-xs">
              <Star className="h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Already Pro — confirmation state */}
        {alreadyPro ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
            <h1 className="text-2xl font-bold">You're on Pro</h1>
            <p className="text-muted-foreground">All templates are unlocked. Start generating contracts.</p>
            <Button asChild>
              <Link to="/templates">Browse all templates</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 gap-1.5">
                <Zap className="h-3 w-3 text-yellow-500" />
                Pro Plan
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Unlock the full contract library
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Every template — bilingual, Oman-law compliant, ready to sign in minutes.
                One flat subscription, no per-document fees.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Free tier */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <div className="text-3xl font-bold">OMR 0</div>
                  <p className="text-sm text-muted-foreground">Forever free, no card needed</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <div key={f} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/templates">Browse free templates</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro tier */}
              <Card className="border-primary/60 shadow-md relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-lg" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Pro</CardTitle>
                    <Badge>Best value</Badge>
                  </div>
                  <div className="text-3xl font-bold">
                    OMR 9.900
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">or OMR 99/year — save 2 months</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium">Everything in Free, plus:</p>
                  {PRO_FEATURES.map((f) => (
                    <div key={f} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}

                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {user ? "Upgrade to Pro" : "Sign in to upgrade"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Secure payment via Stripe. Cancel anytime.
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
              Questions?{" "}
              <a href="mailto:hello@thesmartpro.io" className="underline">
                hello@thesmartpro.io
              </a>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
