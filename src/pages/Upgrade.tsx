import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, Zap, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PRO_FEATURES = [
  "Unlimited access to all Pro templates",
  "Master Services Agreement (MSA)",
  "Property Sale Agreement",
  "Commercial Lease Agreement",
  "All future Pro templates included",
  "Priority email support",
];

const FREE_FEATURES = [
  "7 free bilingual templates",
  "Employment, NDA, Service Agreement",
  "Tenancy, Partnership, Freelance, NOC",
  "Download as Word .docx",
];

export default function Upgrade() {
  const { user } = useAuth();

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
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Zap className="h-3 w-3 text-yellow-500" />
            Pro Plan
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Unlock the full contract library
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pro gives you every template we publish — now and in the future — bilingual, Oman-law compliant, ready to sign in minutes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Free</CardTitle>
              <div className="text-3xl font-bold">OMR 0</div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  {f}
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
                <Badge>Most popular</Badge>
              </div>
              <div className="text-3xl font-bold">OMR 9.900<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground">or OMR 99/year (save 17%)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">Everything in Free, plus:</p>
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </div>
              ))}
              <Button className="w-full mt-4 gap-2" disabled>
                <Lock className="h-4 w-4" />
                Coming soon — join waitlist
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Stripe integration launching shortly.{" "}
                <a href="mailto:hello@thesmartpro.io" className="underline">Get notified</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
