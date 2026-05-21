// =============================================================
// /blog — index page
//
// Compounds long-tail SEO traffic for buyer's guides, comparison
// pages, and Oman law explainers. Every post is bilingual.
// =============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Calendar, Clock } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { applySeo } from "@/lib/seo";

interface BlogPost {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  date: string;          // ISO date
  readMinutes: number;
  categoryEn: string;
  categoryAr: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-contract-tools-oman-2026",
    titleEn: "The Best Contract Management Tools for Oman SMEs in 2026",
    titleAr: "أفضل أدوات إدارة العقود لشركات عُمان في ٢٠٢٦",
    excerptEn:
      "We tested 12 contract platforms against Omani SME requirements — bilingual support, Oman law alignment, e-signature workflows, and price. Here's how they actually compare.",
    excerptAr:
      "اختبرنا ١٢ منصة عقود وفقاً لمتطلبات شركات عُمان الصغيرة والمتوسطة — دعم اللغتين، التوافق مع القانون العماني، التوقيع الإلكتروني، والسعر. إليكم المقارنة الفعلية.",
    date: "2026-05-21",
    readMinutes: 12,
    categoryEn: "Buyer's Guide",
    categoryAr: "دليل المشترين",
  },
];

const COPY = {
  en: {
    title: "Blog",
    sub: "Buyer's guides, Oman law explainers, and contract templates research — built for SME owners across the GCC.",
    badge: "Insights",
    read: "min read",
    back: "Back to templates",
  },
  ar: {
    title: "المدونة",
    sub: "أدلة المشترين، شروح القانون العماني، وأبحاث نماذج العقود — لأصحاب الأعمال في الخليج.",
    badge: "رؤى ومقالات",
    read: "دقائق قراءة",
    back: "العودة إلى النماذج",
  },
};

const Blog = () => {
  const [language, setLanguage] = useState<"ar" | "en">(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("csp-lang") === "ar" ? "ar" : "en";
  });
  const t = COPY[language];
  const isAr = language === "ar";

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
    return applySeo({
      title: isAr
        ? "مدونة Contract Scribe Pro — أدلة العقود وشروح القانون العماني"
        : "Contract Scribe Pro Blog — Contract Guides & Oman Law Explainers",
      description: isAr
        ? "أدلة المشترين، مقارنات أدوات إدارة العقود، شروح قانون العمل والتجاري العماني، ومقالات قانونية لأصحاب الأعمال في عُمان والخليج."
        : "Buyer's guides, contract management tool comparisons, Oman Labour & Commercial law explainers, and legal insight for SME owners across the GCC.",
      canonical: "https://contract-scribe-pro.vercel.app/blog",
      lang: language,
    });
  }, [isAr, language]);

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
              <Link to="/templates">{t.back}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <Badge variant="outline" className="mb-4">{t.badge}</Badge>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isAr ? "text-right" : ""}`}>
            {t.title}
          </h1>
          <p className={`text-base text-muted-foreground leading-relaxed ${isAr ? "text-right" : ""}`}>
            {t.sub}
          </p>
        </div>
      </section>

      {/* POSTS */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={`block rounded-xl border bg-card p-6 hover:border-primary/40 transition-colors ${
                isAr ? "text-right" : ""
              }`}
            >
              <div className={`flex items-center gap-3 text-xs text-muted-foreground mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <Badge variant="secondary" className="text-xs">
                  {isAr ? post.categoryAr : post.categoryEn}
                </Badge>
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
                  {post.readMinutes} {t.read}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
                {isAr ? post.titleAr : post.titleEn}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {isAr ? post.excerptAr : post.excerptEn}
              </p>
              <div className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary ${isAr ? "flex-row-reverse" : ""}`}>
                {isAr ? "اقرأ المقال" : "Read the post"}
                <ArrowRight className={`h-3.5 w-3.5 ${isAr ? "rotate-180" : ""}`} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
