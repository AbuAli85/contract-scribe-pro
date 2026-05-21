// =============================================================
// /blog/:slug — single blog post
//
// Currently hand-written; only the buyer's-guide post is wired.
// Future: migrate to MDX or pull from Sanity / a headless CMS.
// =============================================================

import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Calendar, Clock, Check, X, Star } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { applySeo } from "@/lib/seo";
import { BLOG_POSTS } from "./Blog";

const POST_COPY = {
  en: {
    back: "Back to blog",
    relatedTitle: "Ready to draft your contract?",
    relatedBody: "Skip the buyer's guide. We have 8 free bilingual templates ready right now.",
    relatedCta: "Browse templates",
  },
  ar: {
    back: "العودة للمدونة",
    relatedTitle: "جاهز لصياغة عقدك؟",
    relatedBody: "تخطّ دليل المشترين. لدينا ٨ نماذج مجانية ثنائية اللغة جاهزة الآن.",
    relatedCta: "تصفح النماذج",
  },
};

// ── Tools comparison data ────────────────────────────────────
const TOOLS = [
  {
    name: "Contract Scribe Pro",
    priceEn: "Free",
    priceAr: "مجاني",
    bilingual: true,
    omanLaw: true,
    esign: true,
    whatsapp: true,
    rating: 5,
  },
  {
    name: "DocuSign",
    priceEn: "$10–40 / user / month",
    priceAr: "١٠–٤٠$ / مستخدم / شهر",
    bilingual: false,
    omanLaw: false,
    esign: true,
    whatsapp: false,
    rating: 4,
  },
  {
    name: "PandaDoc",
    priceEn: "$19–49 / user / month",
    priceAr: "١٩–٤٩$ / مستخدم / شهر",
    bilingual: false,
    omanLaw: false,
    esign: true,
    whatsapp: false,
    rating: 4,
  },
  {
    name: "ContractSafe",
    priceEn: "$329 / month flat",
    priceAr: "٣٢٩$ / شهر",
    bilingual: false,
    omanLaw: false,
    esign: false,
    whatsapp: false,
    rating: 3,
  },
  {
    name: "Juro",
    priceEn: "Quote-based",
    priceAr: "بناءً على عرض",
    bilingual: false,
    omanLaw: false,
    esign: true,
    whatsapp: false,
    rating: 4,
  },
];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [language, setLanguage] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("csp-lang") === "ar" ? "ar" : "en";
  });
  const isAr = language === "ar";
  const t = POST_COPY[language];

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  useEffect(() => {
    window.localStorage.setItem("csp-lang", language);
    const prevDir = document.documentElement.dir;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = isAr ? "ar" : "en";
    return () => {
      document.documentElement.dir = prevDir;
    };
  }, [isAr, language]);

  useEffect(() => {
    if (!post) return;
    const url = `https://contract-scribe-pro.vercel.app/blog/${post.slug}`;
    const cleanup = applySeo({
      title: isAr
        ? `${post.titleAr} | Contract Scribe Pro`
        : `${post.titleEn} | Contract Scribe Pro`,
      description: isAr ? post.excerptAr : post.excerptEn,
      canonical: url,
      ogType: "article",
      lang: language,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: isAr ? post.titleAr : post.titleEn,
        description: isAr ? post.excerptAr : post.excerptEn,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: isAr ? "ar-OM" : "en-OM",
        author: { "@type": "Organization", name: "Contract Scribe Pro" },
        publisher: { "@type": "Organization", name: "Contract Scribe Pro" },
        mainEntityOfPage: url,
      },
    });
    return cleanup;
  }, [post, isAr, language]);

  if (!post) return <Navigate to="/blog" replace />;

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
            <Button asChild size="sm" variant="ghost">
              <Link to="/blog">{t.back}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ARTICLE */}
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <div className={`mb-6 flex items-center gap-3 text-xs text-muted-foreground ${isAr ? "flex-row-reverse" : ""}`}>
          <Badge variant="secondary">{isAr ? post.categoryAr : post.categoryEn}</Badge>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.date).toLocaleDateString(isAr ? "ar-OM" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readMinutes} {isAr ? "دقائق" : "min"}
          </span>
        </div>

        <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6 ${isAr ? "text-right" : ""}`}>
          {isAr ? post.titleAr : post.titleEn}
        </h1>

        <p className={`text-lg text-muted-foreground leading-relaxed mb-10 ${isAr ? "text-right" : ""}`}>
          {isAr ? post.excerptAr : post.excerptEn}
        </p>

        {/* ── ENGLISH POST BODY ──────────────────────────────── */}
        {!isAr && (
          <div className="prose prose-slate max-w-none text-foreground">
            <h2 className="text-2xl font-bold mt-10 mb-4">Why Oman SMEs need a different shortlist</h2>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              Most "best contract management software" lists are written for US legal departments managing 500+ active contracts per year. That isn't the Oman SME reality. Here, a 30-person trading company needs a tool that produces a clean Arabic-and-English employment contract in five minutes, accepts WhatsApp as a primary signing channel, and aligns with Royal Decree 35/2003 on Labour — not a $329/month MSA repository.
            </p>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              We evaluated 12 platforms against the criteria SMEs in Muscat, Salalah, and Sohar actually told us mattered. Five passed the smell test; the rest either ignore the Arabic column entirely or price out of reach for a sub-50-headcount business.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">Evaluation criteria</h2>
            <p className="leading-relaxed mb-3 text-muted-foreground">
              Every tool was scored against these five dimensions:
            </p>
            <ul className="list-disc ms-6 mb-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Bilingual quality.</strong> Does the tool render Arabic and English side-by-side with proper RTL, or does it fall back to Latin script in the Arabic column?</li>
              <li><strong className="text-foreground">Oman law alignment.</strong> Are the templates built on RD 35/2003 (Labour), RD 18/2019 (Commercial), RD 29/2013 (Civil Transactions), or are they US/UK templates dressed up?</li>
              <li><strong className="text-foreground">E-signature.</strong> Does it support a tracked send-for-signature flow without a $40/seat add-on?</li>
              <li><strong className="text-foreground">WhatsApp distribution.</strong> Critical in MENA — 30%+ of recipients miss email delivery.</li>
              <li><strong className="text-foreground">Price.</strong> Does an SME with 5–50 employees actually afford this on day one?</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">The shortlist (ranked)</h2>

            <div className="my-8 overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-3 font-semibold">Tool</th>
                    <th className="text-start p-3 font-semibold">Price</th>
                    <th className="text-center p-3 font-semibold">Bilingual</th>
                    <th className="text-center p-3 font-semibold">Oman law</th>
                    <th className="text-center p-3 font-semibold">e-Sign</th>
                    <th className="text-center p-3 font-semibold">WhatsApp</th>
                    <th className="text-center p-3 font-semibold">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((tool) => (
                    <tr key={tool.name} className="border-b">
                      <td className="p-3 font-medium">{tool.name}</td>
                      <td className="p-3 text-muted-foreground">{tool.priceEn}</td>
                      <td className="p-3 text-center">{tool.bilingual ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.omanLaw ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.esign ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.whatsapp ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex">
                          {Array.from({ length: tool.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-3">1. Contract Scribe Pro — the Oman-native pick</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              We're listing ourselves first not because we built this guide, but because the criteria above are exactly what we optimized for. Every template renders bilingually with a proper Arabic column (not Latin transliteration). Every clause references the relevant Royal Decree. E-signature ships through Dropbox Sign in the standard flow, and the signing link can be one-clicked into WhatsApp. Free during the attraction phase; we'll layer paid features later for advanced workflows.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">2. DocuSign — the safe enterprise choice</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              DocuSign is the industry default for a reason — its e-signature workflow is rock-solid, its audit trail is court-admissible in most jurisdictions, and it integrates with virtually every CRM and ERP. The drawback for Oman SMEs: zero Arabic-language templates, no Oman law alignment, and a per-seat price that becomes painful past ten users. Use DocuSign if you already have English-language templates ready and just need execution infrastructure.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">3. PandaDoc — the polished mid-market option</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              PandaDoc has the best document editor on this list and a deep template library — but the library is overwhelmingly US-centric. If you're a Muscat services firm sending bilingual proposals, you'll spend more time fighting the Arabic column than benefiting from PandaDoc's polish. Strong choice if your customer base is primarily English-speaking expats or international firms.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">4. ContractSafe — the repository, not the generator</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              ContractSafe is a contract repository — built for legal teams managing many already-signed contracts. It's excellent at searching, deadlines, and obligation tracking. It's not a generator, doesn't ship templates, and won't help you produce a bilingual employment letter. Consider once you have 100+ active contracts to manage.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">5. Juro — the all-in-one for tech startups</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              Juro is the modern all-in-one CLM with native editor, e-signature, and post-signature tracking. The product is impressive. The catch: it's quote-based, so smaller teams typically land at $700/month minimum, and again — no Arabic-first templates. Worth it if you're a Series A+ tech company doing pan-MENA deals in English.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">How to pick in 30 seconds</h2>
            <ul className="list-disc ms-6 mb-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">SME, bilingual, budget-sensitive:</strong> Contract Scribe Pro.</li>
              <li><strong className="text-foreground">English-only, established workflows, need DocuSign-grade audit:</strong> DocuSign.</li>
              <li><strong className="text-foreground">Polished proposals to international clients:</strong> PandaDoc.</li>
              <li><strong className="text-foreground">Big repository of already-signed contracts to manage:</strong> ContractSafe.</li>
              <li><strong className="text-foreground">Tech startup running pan-MENA in English:</strong> Juro.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">The questions we get asked most</h2>
            <p className="leading-relaxed mb-3 text-muted-foreground">
              <strong className="text-foreground">"Can I use a US template and just translate the Arabic?"</strong> Technically yes; legally risky. US employment templates assume at-will employment, which doesn't exist under Oman Labour Law. The wage protection, notice period, and gratuity clauses are structured differently. A direct translation will leave gaps that show up the first time you need to terminate someone or defend an MOMP complaint.
            </p>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              <strong className="text-foreground">"Is a free template legally enforceable?"</strong> Yes, if it includes the required elements under the governing law. Our templates include the standard required clauses for each contract type, but for high-value or complex deals you should still have an Oman-licensed lawyer review the final document.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">Bottom line</h2>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              If you're an SME owner in Oman and you need a bilingual contract this afternoon, the buyer's-guide answer is simple: download one of our free ready templates. If you grow into needing repository, audit, or workflow features that exceed what we offer, the right next step is DocuSign (enterprise e-signature) or PandaDoc (proposals). The other names on this list are excellent products built for a market that isn't yours.
            </p>
          </div>
        )}

        {/* ── ARABIC POST BODY ───────────────────────────────── */}
        {isAr && (
          <div className="prose prose-slate max-w-none text-foreground text-right" dir="rtl">
            <h2 className="text-2xl font-bold mt-10 mb-4">لماذا تحتاج شركات عُمان لقائمة مختلفة</h2>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              معظم قوائم «أفضل أدوات إدارة العقود» مكتوبة لأقسام قانونية أمريكية تدير ٥٠٠ عقد فعّال سنوياً. هذا ليس واقع الشركة العمانية. الشركة العمانية التي يعمل بها ٣٠ موظفاً تحتاج إلى أداة تنتج عقد عمل عربي–إنجليزي نظيف في خمس دقائق، تتعامل مع واتساب كقناة توقيع رئيسية، ومتوافقة مع المرسوم السلطاني ٣٥/٢٠٠٣ بشأن قانون العمل — لا مستودع عقود بسعر ٣٢٩$ شهرياً.
            </p>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              قمنا بتقييم ١٢ منصة وفقاً لمعايير قالها لنا أصحاب الأعمال في مسقط وصلالة وصحار. خمس منصات اجتازت الاختبار؛ البقية إما تجاهلت العمود العربي تماماً أو تجاوزت ميزانية الشركة التي يعمل بها أقل من ٥٠ موظفاً.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">معايير التقييم</h2>
            <p className="leading-relaxed mb-3 text-muted-foreground">قُيِّمت كل أداة وفق هذه المحاور الخمسة:</p>
            <ul className="list-disc me-6 mb-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">جودة اللغتين.</strong> هل تُعرض العربية والإنجليزية جنباً إلى جنب باتجاه RTL سليم، أم تتراجع الأداة لأحرف لاتينية في العمود العربي؟</li>
              <li><strong className="text-foreground">التوافق مع القانون العماني.</strong> هل النماذج مبنية على ٣٥/٢٠٠٣ (العمل)، ١٨/٢٠١٩ (التجاري)، ٢٩/٢٠١٣ (المعاملات المدنية)، أم هي قوالب أمريكية/بريطانية متنكّرة؟</li>
              <li><strong className="text-foreground">التوقيع الإلكتروني.</strong> هل تدعم تدفق إرسال للتوقيع بدون إضافة بسعر ٤٠$ لكل مستخدم؟</li>
              <li><strong className="text-foreground">توزيع عبر واتساب.</strong> ضروري في الخليج — ٣٠٪+ من المستلمين يفوّتهم البريد الإلكتروني.</li>
              <li><strong className="text-foreground">السعر.</strong> هل تستطيع شركة من ٥–٥٠ موظفاً تحمّل التكلفة من اليوم الأول؟</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">القائمة المختصرة (مرتّبة)</h2>

            <div className="my-8 overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-3 font-semibold">الأداة</th>
                    <th className="text-start p-3 font-semibold">السعر</th>
                    <th className="text-center p-3 font-semibold">ثنائي</th>
                    <th className="text-center p-3 font-semibold">قانون عُمان</th>
                    <th className="text-center p-3 font-semibold">توقيع</th>
                    <th className="text-center p-3 font-semibold">واتساب</th>
                    <th className="text-center p-3 font-semibold">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((tool) => (
                    <tr key={tool.name} className="border-b">
                      <td className="p-3 font-medium">{tool.name}</td>
                      <td className="p-3 text-muted-foreground">{tool.priceAr}</td>
                      <td className="p-3 text-center">{tool.bilingual ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.omanLaw ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.esign ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">{tool.whatsapp ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex">
                          {Array.from({ length: tool.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-3">١. Contract Scribe Pro — الاختيار المحلي العماني</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              نُدرج أنفسنا أولاً ليس لأننا كاتبو هذا الدليل، بل لأن المعايير أعلاه هي بالضبط ما حسّنّاه. كل نموذج يُعرض ثنائياً بعمود عربي صحيح (لا أحرف لاتينية). كل بند يستشهد بالمرسوم السلطاني ذي الصلة. التوقيع الإلكتروني عبر دروب بوكس ساين في التدفق القياسي، ورابط التوقيع يُشارَك بضغطة واحدة على واتساب. مجاني خلال مرحلة الجذب الحالية؛ سنُضيف ميزات مدفوعة لاحقاً للتدفقات المتقدمة.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">٢. DocuSign — الاختيار الآمن للشركات الكبرى</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              DocuSign هو الخيار الافتراضي في المجال لسبب وجيه — تدفق التوقيع الإلكتروني صلب، السجل قابل للتقديم في المحاكم في معظم الولايات القضائية، ويتكامل مع كل CRM وERP. العيب للشركات العمانية: صفر نماذج عربية، لا توافق مع القانون العماني، وسعر لكل مقعد مؤلم بعد عشرة مستخدمين. استخدمه إذا كانت لديك نماذج إنجليزية جاهزة وتحتاج فقط بنية تحتية للتنفيذ.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">٣. PandaDoc — الخيار الأنيق للسوق المتوسط</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              PandaDoc لديه أفضل محرر مستندات في هذه القائمة ومكتبة قوالب ضخمة — لكنها أمريكية بشكل ساحق. إذا كنت شركة خدمات في مسقط ترسل عروضاً ثنائية اللغة، ستقضي وقتاً في صراع مع العمود العربي أكثر مما تستفيد. خيار قوي إذا كانت قاعدة عملائك ناطقة بالإنجليزية أو شركات دولية.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">٤. ContractSafe — المستودع وليس المُولِّد</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              ContractSafe مستودع عقود — مبني للفِرق القانونية التي تدير الكثير من العقود الموقعة. ممتاز في البحث، المواعيد، وتتبع الالتزامات. ليس مولِّداً، لا يوفّر قوالب، ولن يساعدك في إنتاج خطاب توظيف ثنائي. اعتبره عندما تكون لديك ١٠٠ عقد فعّال أو أكثر.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-3">٥. Juro — الحل الشامل للشركات التقنية الناشئة</h3>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              Juro هو CLM الحديث الشامل مع محرر مدمج، توقيع إلكتروني، وتتبّع ما بعد التوقيع. المنتج مبهر. الخدعة: السعر بناءً على عرض، لذا الفِرق الصغيرة عادةً تبدأ من ٧٠٠$ شهرياً، ومرة أخرى — لا نماذج عربية أولاً. يستحق إذا كنت شركة تقنية في مرحلة A+ تُبرم صفقات إقليمية بالإنجليزية.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">كيف تختار في ٣٠ ثانية</h2>
            <ul className="list-disc me-6 mb-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">شركة صغيرة، ثنائية اللغة، حساسة للسعر:</strong> Contract Scribe Pro.</li>
              <li><strong className="text-foreground">بالإنجليزية فقط، تدفقات راسخة، تحتاج تدقيقاً بمستوى DocuSign:</strong> DocuSign.</li>
              <li><strong className="text-foreground">عروض أنيقة للعملاء الدوليين:</strong> PandaDoc.</li>
              <li><strong className="text-foreground">مستودع كبير من العقود الموقعة لإدارته:</strong> ContractSafe.</li>
              <li><strong className="text-foreground">شركة تقنية ناشئة تعمل إقليمياً بالإنجليزية:</strong> Juro.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10 mb-4">الأسئلة الأكثر شيوعاً</h2>
            <p className="leading-relaxed mb-3 text-muted-foreground">
              <strong className="text-foreground">«هل أستطيع استخدام نموذج أمريكي وأترجمه للعربية؟»</strong> تقنياً نعم؛ قانونياً مخاطرة. نماذج التوظيف الأمريكية تفترض «العمل بإرادة الطرفين» الذي لا وجود له في قانون العمل العماني. بنود حماية الأجور، فترة الإشعار، والمكافأة مبنية بشكل مختلف. الترجمة المباشرة ستترك فجوات تظهر أول مرة تحتاج فيها لإنهاء خدمة موظف أو الدفاع أمام شكوى وزارة العمل.
            </p>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              <strong className="text-foreground">«هل النموذج المجاني نافذ قانونياً؟»</strong> نعم، إذا تضمّن العناصر المطلوبة وفق القانون الحاكم. نماذجنا تتضمن البنود القياسية المطلوبة لكل نوع عقد، لكن للصفقات عالية القيمة أو المعقّدة عليك دائماً بمراجعة محامٍ عماني مرخص للوثيقة النهائية.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4">الخلاصة</h2>
            <p className="leading-relaxed mb-5 text-muted-foreground">
              إذا كنت صاحب عمل عماني وتحتاج عقداً ثنائي اللغة بعد ظهر اليوم، إجابة دليل المشترين بسيطة: نزّل أحد نماذجنا المجانية الجاهزة. إذا نَمَوْت لتحتاج ميزات مستودع أو تدقيق أو تدفقات تتجاوز ما نقدّمه، الخطوة التالية الصحيحة هي DocuSign (توقيع مؤسسي) أو PandaDoc (عروض). الأسماء الأخرى في هذه القائمة منتجات ممتازة بُنيت لسوق ليس سوقك.
            </p>
          </div>
        )}

        {/* CTA — drives traffic from blog → templates */}
        <div className="mt-14 rounded-xl border bg-muted/30 p-6 text-center">
          <h3 className="text-xl font-bold mb-2">{t.relatedTitle}</h3>
          <p className="text-sm text-muted-foreground mb-5">{t.relatedBody}</p>
          <Button asChild size="lg">
            <Link to="/templates">
              {t.relatedCta}
              <ArrowRight className={`h-4 w-4 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
