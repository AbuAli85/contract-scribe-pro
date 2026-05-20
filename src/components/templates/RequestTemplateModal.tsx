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
import { Loader2, CheckCircle2, Sparkles, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ContractTemplate } from "@/lib/templates";

interface RequestTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContractTemplate | null;
  language: "ar" | "en";
}

const T = {
  ar: {
    title: "اطلب هذا النموذج",
    desc:
      "نحن نبني هذا النموذج بناءً على طلب العملاء. أدخل بريدك الإلكتروني وسنرسله لك فور جاهزيته.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@company.com",
    submit: "أبلغني عند الجاهزية",
    submitting: "جارٍ الحفظ...",
    successTitle: "تم تسجيل طلبك!",
    successDesc: "سنرسل لك النموذج فور جاهزيته. شكراً لمساعدتنا في تحديد أولوياتنا.",
    poweredBy: "كلما زاد عدد الطلبات، أسرعنا في بناء هذا النموذج.",
    invalid: "يرجى إدخال بريد إلكتروني صالح.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    close: "إغلاق",
  },
  en: {
    title: "Request this template",
    desc:
      "We build templates based on customer demand. Enter your email and we'll send it to you the moment it's ready.",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    submit: "Notify me when ready",
    submitting: "Saving…",
    successTitle: "Request recorded!",
    successDesc:
      "We'll send you this template as soon as it's ready. Thanks for helping us prioritize.",
    poweredBy: "The more requests we receive, the faster we build it.",
    invalid: "Please enter a valid email address.",
    error: "Something went wrong. Please try again.",
    close: "Close",
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RequestTemplateModal = ({
  open,
  onOpenChange,
  template,
  language,
}: RequestTemplateModalProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const { toast } = useToast();
  const t = T[language];
  const isAr = language === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    if (!EMAIL_RE.test(email)) {
      toast({ title: t.invalid, variant: "destructive" });
      return;
    }

    setStatus("submitting");

    try {
      const { error } = await supabase
        // @ts-expect-error -- table created via migration; types regen will resolve this
        .from("template_requests")
        .insert({
          email: email.toLowerCase().trim(),
          template_id: template.id,
          template_title_en: template.titleEn,
          template_title_ar: template.titleAr,
          category: template.category,
          lang: language,
        });

      // 23505 = unique violation — silently treat as success
      if (error && error.code !== "23505") throw error;

      setStatus("success");
    } catch (err) {
      console.error("RequestTemplateModal submit error:", err);
      toast({ title: t.error, variant: "destructive" });
      setStatus("idle");
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setTimeout(() => {
        setEmail("");
        setStatus("idle");
      }, 200);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir={isAr ? "rtl" : "ltr"} className="sm:max-w-md">
        {status !== "success" ? (
          <>
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                <Sparkles className="h-5 w-5 text-primary" />
                {t.title}
              </DialogTitle>
              <DialogDescription className={isAr ? "text-right" : ""}>
                {t.desc}{" "}
                {template && (
                  <span className="font-medium text-foreground block mt-2">
                    {isAr ? template.titleAr : template.titleEn}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="request-email"
                  className={`text-sm font-medium block ${isAr ? "text-right" : ""}`}
                >
                  {t.emailLabel}
                </label>
                <Input
                  id="request-email"
                  type="email"
                  required
                  autoFocus
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  disabled={status === "submitting"}
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Bell className="me-2 h-4 w-4" />
                    {t.submit}
                  </>
                )}
              </Button>

              <p className={`text-xs text-muted-foreground ${isAr ? "text-right" : ""}`}>
                {t.poweredBy}
              </p>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">{t.successTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t.successDesc}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
              {t.close}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestTemplateModal;
