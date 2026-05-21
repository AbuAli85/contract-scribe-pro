// =============================================================
// SEO helper — manages title / description / canonical / OG /
// Twitter cards / JSON-LD structured data per route, then cleans
// up on unmount so SPA navigation doesn't leak stale metadata.
//
// Why a module instead of react-helmet:
//   - Zero new deps; matches the existing useEffect pattern
//   - JSON-LD via dedicated <script type="application/ld+json">
//   - Works with Vercel + static prerendering
// =============================================================

export interface SeoOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  lang?: "ar" | "en";
  /** Structured data objects (will be JSON.stringify'd into a script tag) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const HEAD_NODES: HTMLElement[] = [];

function setMeta(
  selector: string,
  attribute: "name" | "property",
  value: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, value);
    document.head.appendChild(el);
    HEAD_NODES.push(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
    HEAD_NODES.push(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = "csp-jsonld";
  let el = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.id = id;
    document.head.appendChild(el);
    HEAD_NODES.push(el);
  }
  el.textContent = JSON.stringify(data, null, 0);
}

/**
 * Apply SEO metadata. Returns a cleanup function suitable for
 * useEffect's return value.
 */
export function applySeo(opts: SeoOptions): () => void {
  const prevTitle = document.title;
  document.title = opts.title;

  setMeta("meta[name='description']", "name", "description", opts.description);

  // Open Graph
  setMeta("meta[property='og:title']",       "property", "og:title",       opts.title);
  setMeta("meta[property='og:description']", "property", "og:description", opts.description);
  setMeta("meta[property='og:type']",        "property", "og:type",        opts.ogType ?? "website");
  if (opts.ogImage) {
    setMeta("meta[property='og:image']", "property", "og:image", opts.ogImage);
  }

  // Twitter
  setMeta("meta[name='twitter:card']",        "name", "twitter:card",        "summary_large_image");
  setMeta("meta[name='twitter:title']",       "name", "twitter:title",       opts.title);
  setMeta("meta[name='twitter:description']", "name", "twitter:description", opts.description);

  // Canonical
  if (opts.canonical) {
    setLink("canonical", opts.canonical);
    setMeta("meta[property='og:url']", "property", "og:url", opts.canonical);
  }

  // JSON-LD
  if (opts.jsonLd) {
    setJsonLd(opts.jsonLd);
  }

  return () => {
    document.title = prevTitle;
    const el = document.head.querySelector("script#csp-jsonld");
    if (el) el.textContent = "{}";
  };
}

/**
 * Generate JSON-LD HowTo schema for a contract template page.
 * Google understands these and may render rich result steps.
 */
export function templateHowToSchema(opts: {
  name: string;
  description: string;
  url: string;
  inLanguage: "ar" | "en";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    inLanguage: opts.inLanguage === "ar" ? "ar-OM" : "en-OM",
    url: opts.url,
    estimatedCost: { "@type": "MonetaryAmount", currency: "OMR", value: 0 },
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: opts.inLanguage === "ar" ? "اختر النموذج" : "Pick the template",
        text:
          opts.inLanguage === "ar"
            ? "اختر النموذج المناسب من مكتبة Contract Scribe Pro."
            : "Choose the right template from the Contract Scribe Pro library.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: opts.inLanguage === "ar" ? "املأ التفاصيل" : "Fill in the details",
        text:
          opts.inLanguage === "ar"
            ? "أدخل بيانات الأطراف والشروط. الترجمة التلقائية متاحة لكل حقل."
            : "Enter party details and terms. Auto-translate is one click on every field.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: opts.inLanguage === "ar" ? "نزّل ووقّع" : "Download and sign",
        text:
          opts.inLanguage === "ar"
            ? "نزّل ملف .docx ثنائي اللغة، وقّعه إلكترونياً، وشاركه عبر واتساب."
            : "Download the bilingual .docx, sign electronically, and share over WhatsApp.",
      },
    ],
  };
}

/**
 * Organization schema for the site root.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Contract Scribe Pro",
    url: "https://contract-scribe-pro.vercel.app",
    logo: "https://contract-scribe-pro.vercel.app/logo.png",
    description:
      "Oman's largest bilingual (Arabic + English) contract template library, aligned with Omani law.",
    areaServed: { "@type": "Country", name: "Oman" },
    sameAs: ["https://twitter.com", "https://linkedin.com"],
  };
}

/**
 * Build a FAQ JSON-LD object from { q, a } pairs — perfect for
 * the FAQ section on /templates so Google may render expandable
 * FAQ rich results in search.
 */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
