// =============================================================
// Ministry Letters — Authority Registry
//
// Each authority carries its correct addressee title and the
// praise formula used in the opening paragraph. Extend freely —
// the layout never changes.
// =============================================================

import type { MinistryAuthority } from "./types";

export const AUTHORITIES: MinistryAuthority[] = [
  {
    id: "spf",
    nameAr: "صندوق الحماية الاجتماعية",
    nameEn: "Social Protection Fund",
    recipientTitleAr: "مدير الاشتراكات",
    praiseAr: "خدمة أصحاب الأعمال والمؤمَّن عليهم",
    lawAr: "قانون الحماية الاجتماعية الصادر بالمرسوم السلطاني رقم (٥٢/٢٠٢٣) ولوائحه التنفيذية",
  },
  {
    id: "mol",
    nameAr: "وزارة العمل",
    nameEn: "Ministry of Labour",
    recipientTitleAr: "مدير عام التشغيل",
    praiseAr: "تنظيم سوق العمل ورعاية القوى العاملة الوطنية",
    lawAr: "قانون العمل الصادر بالمرسوم السلطاني رقم (٥٣/٢٠٢٣) ولوائحه التنفيذية",
  },
  {
    id: "mocipi",
    nameAr: "وزارة التجارة والصناعة وترويج الاستثمار",
    nameEn: "Ministry of Commerce, Industry & Investment Promotion",
    recipientTitleAr: "مدير عام التجارة",
    praiseAr: "دعم قطاع الأعمال وتيسير الاستثمار",
  },
  {
    id: "rop-passports",
    nameAr: "شرطة عمان السلطانية — الإدارة العامة للجوازات والإقامة",
    nameEn: "Royal Oman Police — DG of Passports & Residency",
    recipientTitleAr: "مدير عام الجوازات والإقامة",
    praiseAr: "خدمة المواطنين والمقيمين وتيسير الإجراءات",
  },
  {
    id: "tax",
    nameAr: "جهاز الضرائب",
    nameEn: "Oman Tax Authority",
    recipientTitleAr: "رئيس جهاز الضرائب",
    praiseAr: "تطوير المنظومة الضريبية وخدمة المكلفين",
  },
  {
    id: "muscat-municipality",
    nameAr: "بلدية مسقط",
    nameEn: "Muscat Municipality",
    recipientTitleAr: "رئيس بلدية مسقط",
    praiseAr: "خدمة المواطنين والمقيمين وتطوير المرافق العامة",
  },
  {
    id: "other",
    nameAr: "جهة حكومية أخرى",
    nameEn: "Other Government Authority",
    recipientTitleAr: "المدير العام",
    praiseAr: "خدمة المواطنين والمقيمين وقطاع الأعمال",
  },
];

export const getAuthority = (id: string): MinistryAuthority =>
  AUTHORITIES.find((a) => a.id === id) ?? AUTHORITIES[AUTHORITIES.length - 1];
