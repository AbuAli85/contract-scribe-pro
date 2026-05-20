import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, FileText, Download, Loader2, CheckCircle2,
  AlertCircle, ShieldCheck, Lock,
} from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { getTemplateById } from "@/lib/templates";
import { getTemplateContent, type TemplateField } from "@/lib/templateContent";
import { downloadFilledContract } from "@/utils/docx/generateFilledContract";
import { useAuth } from "@/hooks/useAuth";

const COPY = {
  en: {
    back: "Back to templates",
    notReady: "This template isn't ready yet",
    notReadySub: "Request it from the catalog and we'll email you when it's authored.",
    notFound: "Template not found",
    proRequired: "Pro template",
    proSub: "Sign in and upgrade to Pro to generate this contract.",
    signIn: "Sign in",
    upgrade: "Upgrade to Pro",
    fillTitle: "Fill in your contract details",
    fillSub: "These values will be inserted into the final document. Arabic and English will both update.",
    required: "Required",
    optional: "Optional",
    generate: "Generate bilingual contract",
    generating: "Generating…",
    successTitle: "Your contract is ready",
    successSub: "The bilingual .docx has been downloaded. Open it in Word, Pages, or Google Docs to review and sign.",
    downloadAgain: "Download again",
    fillAnother: "Fill another contract",
    progress: "Step",
    of: "of",
    next: "Next",
    prev: "Previous",
    error: "Could not generate the document. Please try again.",
    validation: "Please fill all required fields before continuing.",
  },
  ar: {
    back: "العودة إلى النماذج",
    notReady: "هذا النموذج غير جاهز بعد",
    notReadySub: "اطلبه من القائمة وسنرسل لك إيميل عند جاهزيته.",
    notFound: "النموذج غير موجود",
    proRequired: "نموذج Pro",
    proSub: "سجّل دخولك وارقَ إلى Pro لإنشاء هذا العقد.",
    signIn: "تسجيل الدخول",
    upgrade: "الترقية إلى Pro",
    fillTitle: "أدخل تفاصيل العقد",
    fillSub: "ستُدرج هذه القيم في المستند النهائي. كلتا النسختين العربية والإنجليزية ستُحدّثان.",
    required: "إلزامي",
    optional: "اختياري",
    generate: "إنشاء العقد ثنائي اللغة",
    generating: "جارٍ الإنشاء…",
    successTitle: "عقدك جاهز",
    successSub: "تم تنزيل ملف .docx ثنائي اللغة. افتحه في Word أو Pages أو Google Docs للمراجعة والتوقيع.",
    downloadAgain: "تنزيل مرة أخرى",
    fillAnother: "تعبئة عقد آخر",
    progress: "الخطوة",
    of: "من",
    next: "التالي",
    prev: "السابق",
    error: "تعذر إنشاء المستند. يرجى المحاولة مرة أخرى.",
    validation: "يرجى تعبئة جميع الحقول الإلزامية قبل المتابعة.",
  },
} as const;

const FillTemplate = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("csp-lang");
    return stored === "ar" ? "ar" : "en";
  });
  const t = COPY[language];
  const isAr = language === "ar";

  const { user, profile, loading: authLoading } = useAuth();
  const template = templateId ? getTemplateById(templateId) : undefined;
  const content = templateId ? getTemplateContent(templateId) : undefined;

  // Build initial values map from defaults
  const initialValues = useMemo(() => {
    const v: Record<string, string> = {};
    content?.fields.forEach((f) => {
      v[f.key] = f.defaultValue ?? "";
    });
    return v;
  }, [content]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // Group fields by their `group` property — each group = one step
  const steps = useMemo(() => {
    if (!content) return [];
    const order: string[] = [];
    const map = new Map<string, { groupEn: string; groupAr: string; fields: TemplateField[] }>();
    for (const f of content.fields) {
      if (!map.has(f.group)) {
        map.set(f.group, { groupEn: f.group, groupAr: f.groupAr, fields: [] });
        order.push(f.group);
      }
      map.get(f.group)!.fields.push(f);
    }
    return order.map((g) => map.get(g)!);
  }, [content]);

  // RTL toggle + persistence
  useEffect(() => {
    window.localStorage.setItem("csp-lang", language);
    const prevDir = document.documentElement.dir;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";
    return () => {
      document.documentElement.dir = prevDir;
    };
  }, [isAr, language]);

  // ── Guards ─────────────────────────────────────────────────
  // Order matters: Pro check must fire BEFORE the content-missing check.
  // Otherwise a Pro template with no content yet shows "not ready" instead
  // of "upgrade to Pro" — sending the wrong upgrade signal to free users.
  if (!template) {
    return (
      <Empty icon={AlertCircle} title={t.notFound} ctaTo="/templates" ctaText={t.back} isAr={isAr} />
    );
  }
  // Pro gate: template is Pro and user is not subscribed
  const isPro = template.status === "pro";
  if (!authLoading && isPro && (!user || !profile?.is_pro)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1">{t.proRequired}</h1>
          <p className="text-sm text-muted-foreground max-w-sm">{t.proSub}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!user && (
            <Button asChild variant="outline">
              <a href={`/auth?mode=login&redirect=/templates/fill/${templateId}`}>{t.signIn}</a>
            </Button>
          )}
          <Button asChild>
            <a href="/upgrade">{t.upgrade}</a>
          </Button>
        </div>
      </div>
    );
  }
  // Content not yet authored — show the "not ready, request it" empty state.
  // Runs AFTER the Pro check so a Pro user without content still sees the
  // right message rather than "not ready".
  if (!content) {
    return (
      <Empty
        icon={FileText}
        title={t.notReady}
        sub={t.notReadySub}
        ctaTo="/templates"
        ctaText={t.back}
        isAr={isAr}
      />
    );
  }

  // ── Handlers ───────────────────────────────────────────────
  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const isStepValid = () => {
    const fields = steps[stepIndex]?.fields ?? [];
    return fields.every((f) => !f.required || (values[f.key] ?? "").trim() !== "");
  };

  const handleNext = () => {
    if (!isStepValid()) {
      toast({ title: t.validation, variant: "destructive" });
      return;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!template || !content) return;
    setStatus("generating");
    try {
      await downloadFilledContract(template, content, values);
      setStatus("done");
    } catch (err) {
      console.error("downloadFilledContract failed:", err);
      toast({ title: t.error, variant: "destructive" });
      setStatus("idle");
    }
  };

  const currentStep = steps[stepIndex];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto h-14 flex items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/templates">
              <ArrowLeft className={`h-4 w-4 ${isAr ? "ms-2 rotate-180" : "me-2"}`} />
              {t.back}
            </Link>
          </Button>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Title */}
        <div className={`mb-6 ${isAr ? "text-right" : ""}`}>
          <Badge variant="outline" className="mb-3 gap-1.5">
            <ShieldCheck className="h-3 w-3 text-primary" />
            {isAr ? template.titleAr : template.titleEn}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t.fillTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.fillSub}</p>
        </div>

        {status === "done" ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
              <div>
                <h2 className="text-xl font-bold">{t.successTitle}</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  {t.successSub}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto pt-2">
                <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                  <Download className="me-2 h-4 w-4" />
                  {t.downloadAgain}
                </Button>
                <Button className="flex-1" onClick={() => navigate("/templates")}>
                  {t.fillAnother}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress strip */}
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t.progress} {stepIndex + 1} {t.of} {steps.length}
                {" — "}
                <span className="font-medium text-foreground">
                  {isAr ? currentStep?.groupAr : currentStep?.groupEn}
                </span>
              </span>
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-colors ${
                      i < stepIndex ? "bg-primary" : i === stepIndex ? "bg-primary/60" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className={isAr ? "text-right" : ""}>
                  {isAr ? currentStep?.groupAr : currentStep?.groupEn}
                </CardTitle>
                <CardDescription className={isAr ? "text-right" : ""}>
                  {currentStep?.fields.length} {isAr ? "حقول" : "fields"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {currentStep?.fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={values[f.key] ?? ""}
                    onChange={(v) => setValue(f.key, v)}
                    language={language}
                  />
                ))}

                <Separator />

                <div className="flex gap-2">
                  {stepIndex > 0 && (
                    <Button variant="outline" onClick={() => setStepIndex(stepIndex - 1)}>
                      {t.prev}
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    onClick={handleNext}
                    disabled={status === "generating"}
                  >
                    {status === "generating" ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t.generating}
                      </>
                    ) : stepIndex === steps.length - 1 ? (
                      <>
                        <Download className="me-2 h-4 w-4" />
                        {t.generate}
                      </>
                    ) : (
                      <>
                        {t.next}
                        <ArrowRight className={`h-4 w-4 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────
interface FieldInputProps {
  field: TemplateField;
  value: string;
  onChange: (v: string) => void;
  language: "ar" | "en";
}

const FieldInput = ({ field, value, onChange, language }: FieldInputProps) => {
  const isAr = language === "ar";
  const label = isAr ? field.labelAr : field.labelEn;
  const helper = isAr ? field.helperAr : field.helperEn;
  const placeholder = isAr ? field.placeholderAr : field.placeholderEn;
  const id = `field-${field.key}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={`block ${isAr ? "text-right" : ""}`}>
        {label}
        {field.required && <span className="text-destructive ms-1">*</span>}
      </Label>

      {field.type === "select" && field.options ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className={isAr ? "text-right" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {isAr ? opt.labelAr : opt.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          required={field.required}
        />
      ) : (
        <Input
          id={id}
          type={
            field.type === "date"
              ? "date"
              : field.type === "number" || field.type === "currency-omr"
              ? "number"
              : field.type === "email"
              ? "email"
              : field.type === "phone"
              ? "tel"
              : "text"
          }
          step={field.type === "currency-omr" ? "0.001" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={field.required}
        />
      )}

      {helper && (
        <p className={`text-xs text-muted-foreground ${isAr ? "text-right" : ""}`}>
          {helper}
        </p>
      )}
    </div>
  );
};

interface EmptyProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  ctaTo: string;
  ctaText: string;
  isAr: boolean;
}

const Empty = ({ icon: Icon, title, sub, ctaTo, ctaText, isAr }: EmptyProps) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
    dir={isAr ? "rtl" : "ltr"}
  >
    <Icon className="h-12 w-12 text-muted-foreground" />
    <h1 className="text-xl font-semibold">{title}</h1>
    {sub && <p className="text-sm text-muted-foreground max-w-sm">{sub}</p>}
    <Button asChild>
      <Link to={ctaTo}>{ctaText}</Link>
    </Button>
  </div>
);

export default FillTemplate;
