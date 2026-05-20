import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Sparkles, Users2 } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import TemplateCard from "@/components/templates/TemplateCard";
import EmailGateModal from "@/components/templates/EmailGateModal";
import { TEMPLATES, type ContractTemplate } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const COPY = {
  ar: {
    badge: "مكتبة النماذج المجانية",
    heroTitle: "نماذج عقود مجانية للأعمال في عُمان",
    heroSub:
      "ثمانية نماذج عقود ثنائية اللغة، جاهزة للتنزيل. متوافقة مع قانون العمل العماني وقانون التجارة. عربي + إنجليزي.",
    socialProof: "ينضم إليها أكثر من 1,200 شركة",
    ctaPrimary: "ابدأ مجاناً — لا حاجة لبطاقة ائتمان",
    ctaSecondary: "كيف تعمل المنصة",
    featuresTitle: "كل النماذج تشمل",
    feat1Title: "ثنائي اللغة",
    feat1Body: "عمود عربي وعمود إنجليزي جنباً إلى جنب في كل نموذج.",
    feat2Title: "متوافق قانونياً",
    feat2Body: "مبني على قانون العمل العماني والقانون التجاري الحالي.",
    feat3Title: "ملف Word جاهز للتحرير والتوقيع",
    feat3Body: "تنزيل فوري بصيغة .docx — حرّر التفاصيل أو اطبع أو وقّع رقمياً.",
    sectionTitle: "اختر النموذج الذي تحتاجه",
    sectionSub: "انقر على أي نموذج للحصول عليه مجاناً.",
    finalTitle: "تحتاج إلى تخصيص هذه النماذج؟",
    finalBody:
      "أنشئ حساباً مجانياً وقم بتخصيص أي نموذج باسم شركتك وتفاصيلها — اثنان أو ثلاثة عقود مجاناً.",
    finalCta: "إنشاء حساب مجاني",
    upgradeTitle: "هذا نموذج Pro",
    upgradeBody:
      "حزمة سياسات الموارد البشرية متاحة للمشتركين في خطة Pro. ابدأ تجربتك الآن.",
  },
  en: {
    badge: "Free Template Library",
    heroTitle: "Free contract templates for Oman businesses",
    heroSub:
      "Eight bilingual contract templates, ready to download. Aligned with Oman Labour Law and Commercial Law. Arabic + English, side by side.",
    socialProof: "Trusted by 1,200+ businesses",
    ctaPrimary: "Start free — no credit card required",
    ctaSecondary: "How it works",
    featuresTitle: "Every template includes",
    feat1Title: "Bilingual",
    feat1Body: "Arabic column + English column side by side in every template.",
    feat2Title: "Legally aligned",
    feat2Body: "Built on current Oman Labour Law and Commercial Law.",
    feat3Title: "Editable Word document",
    feat3Body: "Instant download as .docx — edit details, print, or sign digitally.",
    sectionTitle: "Pick the template you need",
    sectionSub: "Click any template to grab it free.",
    finalTitle: "Need to customize these templates?",
    finalBody:
      "Create a free account and customize any template with your company name and details — two or three contracts free.",
    finalCta: "Create a free account",
    upgradeTitle: "This is a Pro template",
    upgradeBody:
      "The HR Policy Bundle is available to Pro subscribers. Start your trial now.",
  },
} as const;

const Templates = () => {
  const [language, setLanguage] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("csp-lang");
    return stored === "ar" ? "ar" : "en";
  });
  const [selected, setSelected] = useState<ContractTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const t = COPY[language];
  const isAr = language === "ar";

  // Persist language + apply RTL on root document for this page
  useEffect(() => {
    window.localStorage.setItem("csp-lang", language);
    const prev = document.documentElement.dir;
    const prevLang = document.documentElement.lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";
    return () => {
      document.documentElement.dir = prev;
      document.documentElement.lang = prevLang;
    };
  }, [isAr, language]);

  // SEO meta — set inline since react-helmet isn't installed
  useEffect(() => {
    const titles = {
      en: "Free Contract Templates for Oman — Contract Scribe Pro",
      ar: "نماذج عقود مجانية في عُمان — Contract Scribe Pro",
    };
    const descs = {
      en: "Download 8 free bilingual (Arabic + English) contract templates: Employment, NDA, Service, Freelance, Tenancy, Partnership, and more. Aligned with Oman Labour Law.",
      ar: "حمّل 8 نماذج عقود مجانية ثنائية اللغة (عربي + إنجليزي): عمل، سرية، خدمات، عمل حر، إيجار، شراكة وأكثر. متوافقة مع قانون العمل العماني.",
    };
    const prevTitle = document.title;
    document.title = titles[language];
    let meta = document.querySelector(
      "meta[name='description']"
    ) as HTMLMetaElement | null;
    const prevDesc = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", descs[language]);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc) meta.setAttribute("content", prevDesc);
    };
  }, [language]);

  const handleDownload = (template: ContractTemplate) => {
    setSelected(template);
    if (template.isPro) {
      // For Pro templates, redirect users to pricing instead of email gate.
      toast({
        title: t.upgradeTitle,
        description: t.upgradeBody,
      });
      return;
    }
    setModalOpen(true);
  };

  const handlePreview = (template: ContractTemplate) => {
    if (template.isPro) return;
    window.open(template.previewUrl ?? `/templates/download/${template.id}`, "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="font-bold text-base flex items-center gap-2"
          >
            <FileText className="h-5 w-5 text-primary" />
            Contract Scribe Pro
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
              <Link to="/dashboard">{isAr ? "تسجيل الدخول" : "Sign in"}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/create-contract">
                {isAr ? "ابدأ مجاناً" : "Start Free"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 py-16 sm:py-24 max-w-4xl">
          <Badge variant="outline" className="mb-6 gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            {t.badge}
          </Badge>
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 ${
              isAr ? "text-right" : ""
            }`}
          >
            {t.heroTitle}
          </h1>
          <p
            className={`text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8 ${
              isAr ? "text-right" : ""
            }`}
          >
            {t.heroSub}
          </p>
          <div
            className={`flex flex-wrap items-center gap-4 mb-2 ${
              isAr ? "justify-end" : ""
            }`}
          >
            <Button size="lg" asChild>
              <Link to="/create-contract">
                {t.ctaPrimary}
                <ArrowRight className={`h-4 w-4 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users2 className="h-4 w-4" />
              {t.socialProof}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE STRIP ─── */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h2
            className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 ${
              isAr ? "text-right" : ""
            }`}
          >
            {t.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: t.feat1Title, b: t.feat1Body },
              { t: t.feat2Title, b: t.feat2Body },
              { t: t.feat3Title, b: t.feat3Body },
            ].map((f, i) => (
              <div key={i} className={isAr ? "text-right" : ""}>
                <div className="font-semibold mb-1">{f.t}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {f.b}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEMPLATE GRID ─── */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className={`mb-10 ${isAr ? "text-right" : ""}`}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {t.sectionTitle}
          </h2>
          <p className="text-muted-foreground">{t.sectionSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              language={language}
              onDownload={handleDownload}
              onPreview={handlePreview}
            />
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t.finalTitle}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t.finalBody}
          </p>
          <Button size="lg" asChild>
            <Link to="/create-contract">
              {t.finalCta}
              <ArrowRight className={`h-4 w-4 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Contract Scribe Pro</div>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground">
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              {isAr ? "لوحة التحكم" : "Dashboard"}
            </Link>
          </div>
        </div>
      </footer>

      <EmailGateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        template={selected}
        language={language}
      />
    </div>
  );
};

export default Templates;
