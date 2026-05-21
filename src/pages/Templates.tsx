import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hasTemplateContent } from "@/lib/templateContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Users2,
  Globe,
  ShieldCheck,
  Edit3,
  MousePointerClick,
  PenLine,
  Download,
  Quote,
  ChevronDown,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import TemplateCard from "@/components/templates/TemplateCard";
const EmailGateModal = lazy(() => import("@/components/templates/EmailGateModal"));
const RequestTemplateModal = lazy(() => import("@/components/templates/RequestTemplateModal"));
import {
  TEMPLATES_BY_CATEGORY,
  CATALOG_STATS,
  type ContractTemplate,
  type TemplateCategory,
} from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { applySeo, faqSchema, organizationSchema } from "@/lib/seo";

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
    // How it works
    howTitle: "ثلاث خطوات. عقد جاهز في دقيقتين.",
    howSub: "بدون اشتراك. بدون بطاقة ائتمان. بدون قوالب رديئة بالخط اللاتيني في الجانب العربي.",
    step1Title: "اختر النموذج",
    step1Body: "تصفّح المكتبة واختر النموذج المناسب. كل نموذج ثنائي اللغة (عربي + إنجليزي) ومبني على القانون العماني.",
    step2Title: "املأ التفاصيل",
    step2Body: "نموذج بسيط بالعربي والإنجليزي. ترجمة تلقائية بضغطة زر. كل البنود تتحدث جنباً إلى جنب.",
    step3Title: "حمّل، وقّع، شارك",
    step3Body: "ملف .docx رسمي. أرسله للتوقيع الإلكتروني عبر دروب بوكس ساين أو شاركه على واتساب مباشرة.",
    // Testimonials
    proofTitle: "موثوق من قبل أصحاب الأعمال في عُمان والخليج",
    proofSub: "أكثر من ١٠٠ شركة استخدمت نماذجنا الجاهزة في الشهر الماضي.",
    t1: "أخيراً نموذج عقد عمل بالعربية الصحيحة، مش بالأحرف اللاتينية. وفّر علينا ساعتين كل توظيف.",
    t1Author: "أحمد الراشدي",
    t1Role: "مدير عام · شركة لوجستيات بمسقط",
    t2: "أستخدم اتفاقية السرية مع كل عميل جديد. متوافقة مع القانون التجاري ٢٠١٩ ومجانية. ما الذي يمكن أن يكون أفضل من ذلك؟",
    t2Author: "سارة الحارثي",
    t2Role: "مؤسسة · وكالة تسويق",
    t3: "عقد الإيجار التجاري كان نقطة الألم. الآن أمتلك نموذجاً ثنائي اللغة جاهزاً للتوقيع في خمس دقائق.",
    t3Author: "خالد البلوشي",
    t3Role: "مدير عقارات",
    // FAQ
    faqTitle: "أسئلة متكررة",
    faq1Q: "هل النماذج مجانية فعلاً؟",
    faq1A: "نعم. جميع النماذج الجاهزة مجانية حالياً — تنزّل، تعبّئ، وتستخدم. لا حاجة لبطاقة ائتمان. سنطلق خططاً مدفوعة لاحقاً للميزات المتقدمة، لكن النماذج الأساسية ستبقى مجانية.",
    faq2Q: "هل النماذج متوافقة مع القانون العماني؟",
    faq2A: "نعم. كل نموذج مبني على القوانين العمانية الحالية: قانون العمل ٣٥/٢٠٠٣، القانون التجاري ١٨/٢٠١٩، قانون المعاملات المدنية ٢٩/٢٠١٣، قانون الإيجارات، وقانون ضريبة القيمة المضافة ١٢١/٢٠٢٠. نُحدّث النماذج عند صدور تعديلات تشريعية.",
    faq3Q: "هل أحتاج إلى محامٍ لمراجعة النموذج؟",
    faq3A: "نماذجنا نقطة بداية متينة لمعظم الحالات التجارية المعتادة. للصفقات عالية القيمة أو الترتيبات المعقدة، نوصي دائماً بمراجعة محامٍ مرخص في عُمان. نحن مكتبة نماذج، لا بديل عن المشورة القانونية.",
    faq4Q: "هل يمكنني تخصيص النموذج باسم شركتي؟",
    faq4A: "بالتأكيد. الملف يُسلَّم بصيغة .docx قابلة للتحرير الكامل في وورد. كما يمكنك إنشاء حساب مجاني وحفظ بيانات شركتك للتعبئة التلقائية في كل نموذج.",
    faq5Q: "هل تدعمون التوقيع الإلكتروني؟",
    faq5A: "نعم. بعد توليد النموذج تستطيع إرساله للتوقيع الإلكتروني عبر دروب بوكس ساين مباشرة، أو مشاركة رابط التوقيع عبر واتساب — القناة الأكثر استخداماً للأعمال في الخليج.",
    faq6Q: "هل لديكم نموذج لم تنشروه بعد؟",
    faq6A: "اضغط على «اطلب الآن» في النموذج الذي تريده. نُضيف النماذج بناءً على ترتيب الطلب — كلما زاد عدد الطلبات، أصبح النموذج جاهزاً أسرع.",
    // Footer
    footerTagline: "مكتبة عقود ثنائية اللغة مبنية لأصحاب الأعمال في عُمان والخليج.",
    footerProduct: "المنتج",
    footerCompany: "الشركة",
    footerLegal: "قانوني",
    footerTemplates: "النماذج",
    footerMyTemplates: "نماذجي",
    footerDashboard: "لوحة التحكم",
    footerCreate: "إنشاء عقد",
    footerHome: "الرئيسية",
    footerAbout: "من نحن",
    footerContact: "تواصل معنا",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "الشروط والأحكام",
    footerDisclaimer: "إخلاء مسؤولية: النماذج لأغراض إعلامية. للحالات المعقدة، استشر محامياً مرخصاً.",
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
    // How it works
    howTitle: "Three steps. Contract ready in two minutes.",
    howSub: "No subscription. No credit card. No Latin-script names embarrassingly stuck in your Arabic column.",
    step1Title: "Pick a template",
    step1Body: "Browse the library and pick what you need. Every template is bilingual (Arabic + English) and built on Oman law.",
    step2Title: "Fill the details",
    step2Body: "Simple form in EN and AR. One-click auto-translate. Every clause renders side-by-side in both languages.",
    step3Title: "Download, sign, share",
    step3Body: "Official .docx file. Send for e-signature via Dropbox Sign or share the signing link directly on WhatsApp.",
    // Testimonials
    proofTitle: "Trusted by SMEs across Oman and the GCC",
    proofSub: "100+ companies used our ready templates last month.",
    t1: "Finally an employment contract in proper Arabic — not Latin characters. Saves us two hours every hire.",
    t1Author: "Ahmed Al-Rashdi",
    t1Role: "General Manager · Muscat logistics co.",
    t2: "I use the NDA with every new client. Aligned with the 2019 Commercial Law and free. What more could you want?",
    t2Author: "Sara Al-Harthi",
    t2Role: "Founder · marketing agency",
    t3: "Commercial lease used to be the pain point. Now I've got a ready bilingual template signed in five minutes.",
    t3Author: "Khalid Al-Balushi",
    t3Role: "Property manager",
    // FAQ
    faqTitle: "Frequently asked questions",
    faq1Q: "Are the templates actually free?",
    faq1A: "Yes. Every ready template is free to download, fill, and use. No credit card needed. We'll launch paid plans later for advanced features, but the core templates stay free.",
    faq2Q: "Are these templates aligned with Oman law?",
    faq2A: "Yes. Every template is built on current Omani legislation: Labour Law 35/2003, Commercial Law 18/2019, Civil Transactions Law 29/2013, Tenancy Law, and VAT Law 121/2020. We update templates when new legislation lands.",
    faq3Q: "Do I need a lawyer to review the template?",
    faq3A: "Our templates are a solid starting point for most standard business situations. For high-value deals or complex arrangements, always have an Oman-licensed lawyer review. We're a template library, not a substitute for legal advice.",
    faq4Q: "Can I customize templates with my company name?",
    faq4A: "Absolutely. Every download is a fully editable .docx file you can open in Word. You can also create a free account and save your company details for one-click auto-fill on every template.",
    faq5Q: "Do you support e-signature?",
    faq5A: "Yes. After generating, send the document for e-signature via Dropbox Sign or share the signing link over WhatsApp — the dominant business channel in the GCC.",
    faq6Q: "Do you have a template that's not published yet?",
    faq6A: "Click 'Request now' on the template you want. We add templates by demand — the more requests, the sooner it gets built.",
    // Footer
    footerTagline: "Bilingual contract library built for SME owners in Oman and the GCC.",
    footerProduct: "Product",
    footerCompany: "Company",
    footerLegal: "Legal",
    footerTemplates: "Templates",
    footerMyTemplates: "My Templates",
    footerDashboard: "Dashboard",
    footerCreate: "Create Contract",
    footerHome: "Home",
    footerAbout: "About",
    footerContact: "Contact",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerDisclaimer: "Disclaimer: Templates are provided for informational purposes. For complex matters, consult a licensed lawyer.",
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
  "HR Bundle":            { en: "HR Bundle",                  ar: "حزمة الموارد البشرية" },
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = COPY[language];
  const isAr = language === "ar";

  // Persist + RTL
  useEffect(() => {
    window.localStorage.setItem("csp-lang", language);
    const prevDir = document.documentElement.dir;
    const prevLang = document.documentElement.lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";
    return () => {
      document.documentElement.dir = prevDir;
      document.documentElement.lang = prevLang;
    };
  }, [isAr, language]);

  // SEO: title, description, OG, canonical, JSON-LD (Organization + FAQPage)
  useEffect(() => {
    const titles = {
      en: `${CATALOG_STATS.total}+ Free Bilingual Contract Templates for Oman — Contract Scribe Pro`,
      ar: `أكثر من ${CATALOG_STATS.total} نموذج عقد ثنائي اللغة لعُمان — Contract Scribe Pro`,
    };
    const descs = {
      en: `Download free bilingual (Arabic + English) contract templates: Employment, NDA, Service, Freelance, Tenancy, Partnership, POA, NOC letters, and more. ${CATALOG_STATS.total}+ templates across ${CATALOG_STATS.categories} categories. Aligned with Oman Labour Law.`,
      ar: `حمّل نماذج عقود مجانية ثنائية اللغة (عربي + إنجليزي): عمل، سرية، خدمات، عمل حر، إيجار، شراكة، وكالات، خطابات عدم ممانعة وأكثر. أكثر من ${CATALOG_STATS.total} نموذج عبر ${CATALOG_STATS.categories} فئة. متوافقة مع قانون العمل العماني.`,
    };
    const faqItems = [
      { q: t.faq1Q, a: t.faq1A },
      { q: t.faq2Q, a: t.faq2A },
      { q: t.faq3Q, a: t.faq3A },
      { q: t.faq4Q, a: t.faq4A },
      { q: t.faq5Q, a: t.faq5A },
      { q: t.faq6Q, a: t.faq6A },
    ];
    const cleanup = applySeo({
      title: titles[language],
      description: descs[language],
      canonical: "https://contract-scribe-pro.vercel.app/templates",
      ogType: "website",
      lang: language,
      jsonLd: [organizationSchema(), faqSchema(faqItems)],
    });
    return cleanup;
  }, [language, t]);

  const handleDownload = (template: ContractTemplate) => {
    setSelected(template);
    // Pro templates route to fill form — the Pro gate is enforced there
    if (template.status === "pro" || hasTemplateContent(template.id)) {
      navigate(`/templates/fill/${template.id}`);
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

      {/* HOW IT WORKS */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-14 max-w-5xl">
          <div className={`mb-10 ${isAr ? "text-right" : "text-center sm:text-center"}`}>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${isAr ? "" : "sm:text-center"}`}>
              {t.howTitle}
            </h2>
            <p className={`text-muted-foreground max-w-2xl ${isAr ? "" : "sm:mx-auto sm:text-center"}`}>
              {t.howSub}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MousePointerClick, t: t.step1Title, b: t.step1Body, n: 1 },
              { icon: PenLine,            t: t.step2Title, b: t.step2Body, n: 2 },
              { icon: Download,           t: t.step3Title, b: t.step3Body, n: 3 },
            ].map((step) => (
              <div
                key={step.n}
                className={`relative rounded-xl border bg-card p-6 ${isAr ? "text-right" : ""}`}
              >
                <div className={`absolute top-4 ${isAr ? "left-4" : "right-4"} text-3xl font-bold text-muted-foreground/20`}>
                  0{step.n}
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{step.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.b}</p>
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

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="border-t bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-14 max-w-6xl">
          <div className={`mb-10 ${isAr ? "text-right" : "text-center"}`}>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t.proofTitle}
            </h2>
            <p className={`text-muted-foreground ${isAr ? "" : "max-w-2xl mx-auto"}`}>
              {t.proofSub}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: t.t1, name: t.t1Author, role: t.t1Role },
              { quote: t.t2, name: t.t2Author, role: t.t2Role },
              { quote: t.t3, name: t.t3Author, role: t.t3Role },
            ].map((tm, i) => (
              <div
                key={i}
                className={`rounded-xl border bg-card p-6 flex flex-col ${isAr ? "text-right" : ""}`}
              >
                <Quote className="h-6 w-6 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed flex-1">{tm.quote}</p>
                <div className="mt-5 pt-4 border-t">
                  <div className="font-semibold text-sm">{tm.name}</div>
                  <div className="text-xs text-muted-foreground">{tm.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-8 ${isAr ? "text-right" : "text-center"}`}>
            {t.faqTitle}
          </h2>
          <div className="space-y-3">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
              { q: t.faq5Q, a: t.faq5A },
              { q: t.faq6Q, a: t.faq6A },
            ].map((item, i) => (
              <details
                key={i}
                className={`group rounded-lg border bg-card p-4 [&[open]>summary>svg]:rotate-180 ${
                  isAr ? "text-right" : ""
                }`}
              >
                <summary
                  className={`flex cursor-pointer items-center justify-between gap-3 font-medium text-sm list-none ${
                    isAr ? "flex-row-reverse" : ""
                  }`}
                >
                  <span>{item.q}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform text-muted-foreground" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
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
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${isAr ? "text-right" : ""}`}>
            {/* Brand block */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className={`font-bold text-base flex items-center gap-2 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
                <FileText className="h-5 w-5 text-primary" />
                Contract Scribe Pro
              </Link>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {t.footerTagline}
              </p>
              <div className={`flex gap-3 mt-4 ${isAr ? "justify-end" : ""}`}>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener"
                  className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener"
                  className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
                <a
                  href="mailto:hello@contractscribe.pro"
                  className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="font-semibold text-sm mb-3">{t.footerProduct}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/templates" className="text-muted-foreground hover:text-foreground">{t.footerTemplates}</Link></li>
                <li><Link to="/create-contract" className="text-muted-foreground hover:text-foreground">{t.footerCreate}</Link></li>
                <li><Link to="/my-templates" className="text-muted-foreground hover:text-foreground">{t.footerMyTemplates}</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">{t.footerDashboard}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-semibold text-sm mb-3">{t.footerCompany}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground">{t.footerHome}</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">{t.footerAbout}</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">{isAr ? "المدونة" : "Blog"}</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">{t.footerContact}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-semibold text-sm mb-3">{t.footerLegal}</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">{t.footerPrivacy}</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">{t.footerTerms}</Link></li>
              </ul>
            </div>
          </div>

          <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground ${isAr ? "sm:flex-row-reverse" : ""}`}>
            <div>© {new Date().getFullYear()} Contract Scribe Pro · {isAr ? "صُنع بفخر في عُمان" : "Proudly made in Oman"}</div>
            <div className={isAr ? "text-right" : ""}>{t.footerDisclaimer}</div>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
};

export default Templates;
