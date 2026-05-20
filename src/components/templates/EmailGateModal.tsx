import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ContractTemplate } from "@/lib/templates";
import { Link } from "react-router-dom";

interface EmailGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContractTemplate | null;
  language: "ar" | "en";
}

const T = {
  ar: {
    title: "احصل على النموذج المجاني",
    desc: "أدخل بريدك الإلكتروني وسنرسل لك النموذج فوراً.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@company.com",
    submit: "تنزيل مجاني",
    submitting: "جارٍ الإرسال...",
    successTitle: "تم! تحقق من بريدك",
    successDesc: "بدأ التنزيل تلقائياً. سيصلك أيضاً رابط للنموذج عبر البريد الإلكتروني.",
    upgradeCta: "أنشئ حساباً مجانياً لتخصيص هذا النموذج عبر الإنترنت",
    duplicate: "لديك بالفعل حق الوصول. جارٍ التنزيل الآن.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    invalid: "يرجى إدخال بريد إلكتروني صالح.",
  },
  en: {
    title: "Get the free template",
    desc: "Enter your email and we'll send the template instantly.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    submit: "Download Free",
    submitting: "Sending...",
    successTitle: "Done! Check your inbox",
    successDesc:
      "Download started automatically. You'll also receive an email with the template link.",
    upgradeCta: "Create a free account to customize this template online",
    duplicate: "You already have access. Downloading now.",
    error: "Something went wrong. Please try again.",
    invalid: "Please enter a valid email address.",
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailGateModal = ({
  open,
  onOpenChange,
  template,
  language,
}: EmailGateModalProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const { toast } = useToast();
  const t = T[language];

  const isAr = language === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const triggerDownload = (pdfUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `contract-scribe-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    if (!EMAIL_RE.test(email)) {
      toast({
        title: t.invalid,
        variant: "destructive",
      });
      return;
    }

    setStatus("submitting");

    try {
      // Insert into Supabase template_leads table.
      // If the row already exists for this (email, template_id) we silently treat it as a re-download.
      const { error } = await supabase
        // @ts-expect-error -- table created via migration; types regen will resolve this
        .from("template_leads")
        .insert({
          email: email.toLowerCase().trim(),
          template_id: template.id,
          lang: language,
        });

      // 23505 = unique violation (lead already exists). Allow re-download.
      if (error && error.code !== "23505") {
        throw error;
      }

      // Fire-and-forget edge function to send the email with the template link
      void supabase.functions
        .invoke("send-template-email", {
          body: {
            email: email.toLowerCase().trim(),
            templateId: template.id,
            lang: language,
          },
        })
        .catch((err) => console.warn("send-template-email failed:", err));

      triggerDownload(template.pdfUrl, template.id);
      setStatus("success");

      if (error?.code === "23505") {
        toast({ title: t.duplicate });
      }
    } catch (err) {
      console.error("EmailGateModal submit error:", err);
      toast({ title: t.error, variant: "destructive" });
      setStatus("idle");
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      // Reset state on close so a fresh open starts clean
      setTimeout(() => {
        setEmail("");
        setStatus("idle");
      }, 200);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir={dir} className="sm:max-w-md">
        {status !== "success" ? (
          <>
            <DialogHeader>
              <DialogTitle className={isAr ? "text-right" : ""}>
                {t.title}
              </DialogTitle>
              <DialogDescription className={isAr ? "text-right" : ""}>
                {t.desc}{" "}
                {template && (
                  <span className="font-medium text-foreground">
                    {language === "ar" ? template.titleAr : template.titleEn}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="lead-email"
                  className={`text-sm font-medium block ${
                    isAr ? "text-right" : ""
                  }`}
                >
                  {t.emailLabel}
                </label>
                <Input
                  id="lead-email"
                  type="email"
                  required
                  autoFocus
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className={isAr ? "text-right" : ""}
                  disabled={status === "submitting"}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Download className="me-2 h-4 w-4" />
                    {t.submit}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">{t.successTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.successDesc}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">{t.upgradeCta} →</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailGateModal;
