// =============================================================
// Ministry Letters — Authority Registry
//
// Each authority carries its correct addressee title and the
// praise formula used in the opening paragraph, in both
// languages. Extend freely — the layout never changes.
//
// The English titles are the forms these bodies use in their own
// correspondence, not literal translations of the Arabic.
// =============================================================

import type { MinistryAuthority } from "./types";

export const AUTHORITIES: MinistryAuthority[] = [
  {
    id: "spf",
    nameAr: "صندوق الحماية الاجتماعية",
    nameEn: "Social Protection Fund",
    recipientTitleAr: "مدير الاشتراكات",
    recipientTitleEn: "The Director of Contributions",
    praiseAr: "خدمة أصحاب الأعمال والمؤمَّن عليهم",
    praiseEn: "serving employers and the insured",
    lawAr: "قانون الحماية الاجتماعية الصادر بالمرسوم السلطاني رقم (٥٢/٢٠٢٣) ولوائحه التنفيذية",
    lawEn:
      "the Social Protection Law promulgated by Royal Decree No. (52/2023) and its executive regulations",
  },
  {
    id: "mol",
    nameAr: "وزارة العمل",
    nameEn: "Ministry of Labour",
    recipientTitleAr: "مدير عام التشغيل",
    recipientTitleEn: "The Director of Labour Relations",
    praiseAr: "تنظيم سوق العمل ورعاية القوى العاملة الوطنية",
    praiseEn: "regulating the labour market and supporting the national workforce",
    lawAr: "قانون العمل الصادر بالمرسوم السلطاني رقم (٥٣/٢٠٢٣) ولوائحه التنفيذية",
    lawEn: "the Labour Law promulgated by Royal Decree No. (53/2023)",
  },
  {
    id: "mocipi",
    nameAr: "وزارة التجارة والصناعة وترويج الاستثمار",
    nameEn: "Ministry of Commerce, Industry and Investment Promotion",
    recipientTitleAr: "مدير عام التجارة",
    recipientTitleEn: "The Director of Commercial Affairs",
    praiseAr: "دعم قطاع الأعمال وتيسير الاستثمار",
    praiseEn: "supporting the business sector and facilitating investment",
  },
  {
    id: "rop-passports",
    nameAr: "شرطة عمان السلطانية — الإدارة العامة للجوازات والإقامة",
    nameEn: "Royal Oman Police — Directorate General of Passports and Residence",
    recipientTitleAr: "مدير عام الجوازات والإقامة",
    recipientTitleEn: "The Director General",
    praiseAr: "خدمة المواطنين والمقيمين وتيسير الإجراءات",
    praiseEn: "serving citizens and residents and facilitating procedures",
  },
  {
    id: "tax",
    nameAr: "جهاز الضرائب",
    nameEn: "Tax Authority",
    recipientTitleAr: "رئيس جهاز الضرائب",
    recipientTitleEn: "The Director of Taxpayer Services",
    praiseAr: "تطوير المنظومة الضريبية وخدمة المكلفين",
    praiseEn: "developing the tax system and serving taxpayers",
  },
  {
    id: "muscat-municipality",
    nameAr: "بلدية مسقط",
    nameEn: "Muscat Municipality",
    recipientTitleAr: "رئيس بلدية مسقط",
    recipientTitleEn: "The Director of Licensing",
    praiseAr: "خدمة المواطنين والمقيمين وتطوير المرافق العامة",
    praiseEn: "serving citizens and residents and developing public facilities",
  },
  {
    id: "other",
    nameAr: "جهة حكومية أخرى",
    nameEn: "Other Government Authority",
    recipientTitleAr: "المدير العام",
    recipientTitleEn: "The Director General",
    praiseAr: "خدمة المواطنين والمقيمين وقطاع الأعمال",
    praiseEn: "serving citizens, residents and the business sector",
  },
];

export const getAuthority = (id: string): MinistryAuthority =>
  AUTHORITIES.find((a) => a.id === id) ?? AUTHORITIES[AUTHORITIES.length - 1];

/** Short code used in English file names, e.g. "rop-passports" -> "ROP". */
export const authorityCode = (id: string): string =>
  (id.split("-")[0] || "GOV").toUpperCase();
