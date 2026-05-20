import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Sparkles, Users2, Globe, ShieldCheck, Edit3 } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import TemplateCard from "@/components/templates/TemplateCard";
import EmailGateModal from "@/components/templates/EmailGateModal";
import RequestTemplateModal from "@/components/templates/RequestTemplateModal";
import {
  TEMPLATES_BY_CATEGORY,
  CATALOG_STATS,
  type ContractTemplate,
  type TemplateCategory,
} from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

const COPY = {
  ar: {
    badge: "مكتبة النماذج الشاملة",
    heroTitle: "أكبر مكتبة عقود ثنائية اللغة للأعمال في عُمان",
    heroSub:
      "أكثر من {total} نموذج ومستند رسمي عبر {categories} فئة — جاهزة للتنزيل والتعبئة. متوافقة مع قانون العمل العماني والقانون التجاري. عربي + إنجليزي جنباً إلى جنب.",
    socialProof: "نضيف نماذج جديدة بناءً على طلب العملاء",
    ctaPrimary: "ابدأ مجاناً — لا حاجة لبطاقة ائتمان",
    featuresTitle: "كل النماذج تشمل",
    feat1Title: "ثنائي اللغة",
    feat1Body: "عمود عربي وعمود إنجليزي جنباً إلى جنب.",
    feat2Title: "متوافق قانونياً",
    feat2Body: "مبني على قوانين عُمان الحالية.",
    feat3Title: "Word قابل للتحرير",
    feat3Body: "ملف .docx — حرّر، اطبع، أو وقّع رقمياً.",
    finalTitle: "تحتاج إلى تخصيص هذه النماذج؟",
    finalBody: "أنشئ حساباً مجانياً وقم بتخصيص أي نموذج باسم شركتك.",
    finalCta: "إنشاء حساب مجاني",
    upgradeTitle: "هذا نموذج Pro",
    upgradeBody: "متاح للمشتركين في خطة Pro. ابدأ تجربتك الآن.",
    statsReady: "جاهز للتنزيل",
    statsSoon: "قريباً — اطلب الآن",
    statsCategories: "فئة",
  },
  en: {
    badge: "Complete Template Library",
    heroTitle: "Oman's largest bilingual contract & document library",
    heroSub:
      "{total}+ legal templates across {categories} categories — ready to download, fill, and sign. Aligned with Oman Labour Law and Commercial Law. Arabic + English side by side.",
    socialProof: "We add new templates based on customer requests",
    ctaPrimary: "Start free — no credit card required",
    featuresTitle: "Every template includes",
    feat1Title: "Bilingual",
    feat1Body: "Arabic and English side by side in every template.",
    feat2Title: "Legally aligned",
    feat2Body: "Built on current Oman law (Labour, Commercial, Tenancy).",
    feat3Title: "Editable Word",
    feat3Body: "Real .docx — edit, print, or sign digitally.",
    finalTitle: "Need to customize these templates?",
    finalBody: "Create a free account and customize any template with your company name and details.",
    finalCta: "Create a free account",
    upgradeTitle: "This is a Pro template",
    upgradeBody: "Available to Pro subscribers. Start your trial now.",
    statsReady: "ready to download",
    statsSoon: "coming soon — request",
    statsCategories: "categories",
  },
} as const;

const CATEGORY_LABELS: Record<TemplateCategory, { en: string; ar: string }> = {
  "Employment & HR":      { en: "Employment & HR",            ar: "العمل والموارد البشرية" },
  "Business Agreements":  { en: "Business Agreements",        ar: "اتفاقيات الأعمال" },
  "Sales & Vendors":      { en: "Sales & Vendors",            ar: "المبيعات والموردين" },
  "Real Estate":          { en: "Real Estate",                ar: "العقارات" },
  "Personal & Family":    { en: "Personal & Family",          ar: "شخصي وعائلي" },
  "Letters & Notices":    { en: "Letters & Notices",          ar: "الخطابات والإشعارات" },
  "Freelance & Creative": { en: "Freelance & Creative",       ar: "العمل الحر والإبداعي" },
  "Technology & SaaS":    { en: "Technology & SaaS",          ar: "التقنية و SaaS" },
  "Government & Compliance": { en: "Government & Compliance", ar: "الحكومة والامتثال" },
  "Healthcare":           { en: "Healthcare",                 ar: "الرعاية الصحية" },
  "Education":            { en: "Education",                  ar: "التعليم" },
  "HR Bundle":            { en: "HR Bundle (Pro)",            ar: "حزمة HR (Pro)" },
};

const Templates = () => {
  const [language, setLanguage] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("csp-lang");
    return stored === "ar" ? "ar" : "en";
  });
  const [selected, setSelected] = useState<ContractTemplate | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { toast } = useToast();
  const t = COPY[language];
  const isAr = language === "ar";

  // Persist + RTL + SEO meta
  useEffect(() => {
    window.localStorage.setItem("csp-lang", language);
    const prevDir = document.documentElement.dir;
    const prevLang = document.documentElement.lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";

    const titles = {
      en: `${CATALOG_STATS.total}+ Free Bilingual Contract Templates for Oman — Contract Scribe Pro`,
      ar: `أكثر من ${CATALOG_STATS.total} نموذج عقد ثنائي اللغة لعُمان — Contract Scribe Pro`,
    };
    const descs = {
      en: `Download free bilingual (Arabic + English) contract templates: Employment, NDA, Service, Freelance, Tenancy, Partnership, POA, NOC letters, and more. ${CATALOG_STATS.total}+ templates across ${CATALOG_STATS.categories} categories. Aligned with Oman Labour Law.`,
      ar: `حمّل نماذج عقود مجانية ثنائية اللغة (عربي + إنجليزي): عمل، سرية، خدمات، عمل حر، إيجار، شراكة، وكالات، خطابات عدم ممانعة وأكثر. أكثر من ${CATALOG_STATS.total} نموذج عبر ${CATALOG_STATS.categories} فئة. متوافقة مع قانون العمل العماني.`,
    };
    const prevTitle = document.title;
    document.title = titles[language];
    let meta = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
    const prevDesc = meta?.getAttribute("content") ?? "";
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", descs[language]);

    return () => {
      document.documentElement.dir = prevDir;
      document.documentElement.lang = prevLang;
      document.title = prevTitle;
      if (meta && prevDesc) meta.setAttribute("content", prevDesc);
    };
  }, [isAr, language]);

  const handleDownload = (template: ContractTemplate) => {
    setSelected(template);
    if (template.status === "pro") {
      toast({ title: t.upgradeTitle, description: t.upgradeBody });
      return;
    }
    setDownloadModalOpen(true);
  };

  const handlePreview = (template: ContractTemplate) => {
    if (template.status !== "ready") return;
    window.open(`/templates/download/${template.id}`, "_blank", "noopener");
  };

  const handleRequest = (template: ContractTemplate) => {
    setSelected(template);
    setRequestModalOpen(true);
  };

  const heroSub = t.heroSub
    .replace("{total}", String(CATALOG_STATS.total))
    .replace("{categories}", String(CATALOG_STATS.categories));

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="font-bold text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Contract Scribe Pro
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle language={language} onChange={setLanguage} />
            <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
              <Link to="/dashboard">{isAr ? "تسجيل الدخول" : "Sign in"}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/create-contract">{isAr ? "ابدأ مجاناً" : "Start Free"}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 py-14 sm:py-20 max-w-4xl">
          <Badge variant="outline" className="mb-5 gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            {t.badge}
          </Badge>
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-5 ${
              isAr ? "text-right" : ""
            }`}
          >
            {t.heroTitle}
          </h1>
          <p
            className={`text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-7 ${
              isAr ? "text-right" : ""
            }`}
          >
            {heroSub}
          </p>

          {/* Catalog stats strip */}
          <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mb-7 ${isAr ? "justify-end" : ""}`}>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-foreground">{CATALOG_STATS.ready}</span>
              <span className="text-muted-foreground">{t.statsReady}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-foreground">{CATALOG_STATS.comingSoon}</span>
              <span className="text-muted-foreground">{t.statsSoon}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-foreground">{CATALOG_STATS.categories}</span>
              <span className="text-muted-foreground">{t.statsCategories}</span>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-4 ${isAr ? "justify-end" : ""}`}>
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

      {/* FEATURE STRIP */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, t: t.feat1Title, b: t.feat1Body },
              { icon: ShieldCheck, t: t.feat2Title, b: t.feat2Body },
              { icon: Edit3, t: t.feat3Title, b: t.feat3Body },
            ].map((f, i) => (
              <div key={i} className={`flex gap-3 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                <div className="h-9 w-9 flex-shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.t}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {f.b}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        {TEMPLATES_BY_CATEGORY.map((group) => (
          <div key={group.category} className="mb-12 last:mb-0">
            <div className={`mb-5 flex items-end justify-between ${isAr ? "flex-row-reverse" : ""}`}>
              <div className={isAr ? "text-right" : ""}>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {CATEGORY_LABELS[group.category][language]}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {group.items.length} {isAr ? "نماذج" : "templates"} ·{" "}
                  {group.items.filter((it) => it.status === "ready").length}{" "}
                  {isAr ? "جاهز" : "ready"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.items.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  language={language}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-14 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.finalTitle}</h2>
          <p className="text-muted-foreground mb-7 leading-relaxed">{t.finalBody}</p>
          <Button size="lg" asChild>
            <Link to="/create-contract">
              {t.finalCta}
              <ArrowRight className={`h-4 w-4 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Contract Scribe Pro</div>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground">{isAr ? "الرئيسية" : "Home"}</Link>
            <Link to="/my-templates" className="hover:text-foreground">{isAr ? "نماذجي" : "My Templates"}</Link>
            <Link to="/dashboard" className="hover:text-foreground">{isAr ? "لوحة التحكم" : "Dashboard"}</Link>
          </div>
        </div>
      </footer>

      <EmailGateModal
        open={downloadModalOpen}
        onOpenChange={setDownloadModalOpen}
        template={selected}
        language={language}
      />
      <RequestTemplateModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        template={selected}
        language={language}
      />
    </div>
  );
};

export default Templates;
