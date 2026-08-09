// MASTER_LIST_VERSION: v1.0 — locked 2026-08-09 — approved by Fahad Alamri
// =============================================================
// Authority registry (L0)
//
// Each authority carries its addressee options, the praise formula
// used in the opening paragraph, the law it enforces, and the letter
// types it accepts (master-list order).
//
// ADDRESSEE MODEL: recipients[0] is the default and MUST equal the
// legacy hardcoded title — that is what keeps existing letters
// byte-identical. The honorific (معالي / سعادة / الفاضل) is part of
// the string: the renderer receives one composed title and drops it
// where the fixed title always went, so the layout never changes.
// Every list ends with a free-text option so no user is trapped by
// the dropdown.
// =============================================================

import type { MinistryAuthority, RecipientOption } from "./types";

/** The escape hatch appended to every authority's recipient list. */
const FREE_TEXT: RecipientOption = {
  ar: "أخرى — نص حر",
  en: "Other — free text",
  freeText: true,
};

/** "مدير الدائرة المختصة" + the department the user names. */
const DEPARTMENT: RecipientOption = {
  ar: "مدير دائرة",
  en: "Director of the Department of",
  needsDepartment: true,
};

export const AUTHORITIES: MinistryAuthority[] = [
  {
    id: "spf",
    nameAr: "صندوق الحماية الاجتماعية",
    nameEn: "Social Protection Fund",
    recipientTitleAr: "مدير الاشتراكات",
    recipientTitleEn: "The Director of Contributions",
    recipients: [
      { ar: "مدير الاشتراكات", en: "The Director of Contributions" },
      { ar: "سعادة رئيس صندوق الحماية الاجتماعية", en: "H.E. the Chairman of the Social Protection Fund" },
      { ar: "المدير العام", en: "The Director General" },
      { ar: "مدير دائرة الاشتراكات والتحصيل", en: "The Director of Contributions and Collection" },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "خدمة أصحاب الأعمال والمؤمَّن عليهم",
    praiseEn: "serving employers and the insured",
    lawAr: "قانون الحماية الاجتماعية الصادر بالمرسوم السلطاني رقم (٥٢/٢٠٢٣) ولوائحه التنفيذية",
    lawEn:
      "the Social Protection Law promulgated by Royal Decree No. (52/2023) and its executive regulations",
    allowedLetterTypes: [
      "installment", "unblock", "clearance", "spf_objection_dues",
      "spf_correct_insured_data", "spf_refund_overpayment", "spf_deregister_establishment",
    ],
  },
  {
    id: "mol",
    nameAr: "وزارة العمل",
    nameEn: "Ministry of Labour",
    recipientTitleAr: "مدير عام التشغيل",
    recipientTitleEn: "The Director of Labour Relations",
    recipients: [
      { ar: "مدير عام التشغيل", en: "The Director of Labour Relations" },
      { ar: "معالي وزير العمل", en: "H.E. the Minister of Labour" },
      { ar: "سعادة وكيل الوزارة", en: "H.E. the Undersecretary" },
      { ar: "المدير العام للعمل", en: "The Director General of Labour" },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "تنظيم سوق العمل ورعاية القوى العاملة الوطنية",
    praiseEn: "regulating the labour market and supporting the national workforce",
    lawAr: "قانون العمل الصادر بالمرسوم السلطاني رقم (٥٣/٢٠٢٣) ولوائحه التنفيذية",
    lawEn: "the Labour Law promulgated by Royal Decree No. (53/2023)",
    allowedLetterTypes: [
      "mol_omanisation_exemption", "extension", "mol_recruitment_clearance",
      "mol_replacement_permit", "mol_worker_transfer", "mol_occupation_change",
      "mol_permit_cancellation", "objection", "mol_clearance", "mol_permit_renewal",
      "mol_cancel_absconding", "mol_fines_waiver", "mol_termination_notice",
      "mol_secondment", "mol_midday_permit",
    ],
  },
  {
    id: "tax",
    nameAr: "جهاز الضرائب",
    nameEn: "Tax Authority",
    recipientTitleAr: "رئيس جهاز الضرائب",
    recipientTitleEn: "The Director of Taxpayer Services",
    recipients: [
      { ar: "رئيس جهاز الضرائب", en: "The Director of Taxpayer Services" },
      { ar: "سعادة رئيس جهاز الضرائب", en: "H.E. the Chairman of the Tax Authority" },
      { ar: "المدير العام", en: "The Director General" },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "تطوير المنظومة الضريبية وخدمة المكلفين",
    praiseEn: "developing the tax system and serving taxpayers",
    allowedLetterTypes: [
      "tax_objection", "tax_installment", "tax_return_amendment", "tax_clearance",
      "tax_vat_refund", "tax_penalty_waiver", "tax_vat_deregistration",
      "tax_residency_certificate",
    ],
  },
  {
    id: "mocipi",
    nameAr: "وزارة التجارة والصناعة وترويج الاستثمار",
    nameEn: "Ministry of Commerce, Industry and Investment Promotion",
    recipientTitleAr: "مدير عام التجارة",
    recipientTitleEn: "The Director of Commercial Affairs",
    recipients: [
      { ar: "مدير عام التجارة", en: "The Director of Commercial Affairs" },
      { ar: "معالي وزير التجارة والصناعة وترويج الاستثمار", en: "H.E. the Minister of Commerce, Industry and Investment Promotion" },
      { ar: "سعادة وكيل الوزارة", en: "H.E. the Undersecretary" },
      { ar: "المدير العام للتجارة", en: "The Director General of Commerce" },
      { ar: "مدير دائرة السجل التجاري", en: "The Director of the Commercial Registry Department" },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "دعم قطاع الأعمال وتيسير الاستثمار",
    praiseEn: "supporting the business sector and facilitating investment",
    allowedLetterTypes: [
      "mocipi_cr_amendment", "mocipi_activity_change", "mocipi_share_transfer",
      "mocipi_partner_change", "mocipi_signatory_change", "mocipi_trade_name_change",
      "mocipi_cr_ownership_transfer", "mocipi_cr_cancellation", "mocipi_preliminary_approval",
      "mocipi_objection", "mocipi_dissolution", "mocipi_foreign_branch",
      "mocipi_commercial_agency",
    ],
  },
  {
    id: "rop-passports",
    nameAr: "شرطة عمان السلطانية — الإدارة العامة للجوازات والإقامة",
    nameEn: "Royal Oman Police — Directorate General of Passports and Residence",
    recipientTitleAr: "مدير عام الجوازات والإقامة",
    recipientTitleEn: "The Director General",
    recipients: [
      { ar: "مدير عام الجوازات والإقامة", en: "The Director General" },
      { ar: "سعادة المدير العام للجوازات والإقامة", en: "H.E. the Director General of Passports and Residence" },
      { ar: "مدير إدارة الجوازات والإقامة بمحافظة", en: "The Director of Passports and Residence in the Governorate of", needsDepartment: true },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "خدمة المواطنين والمقيمين وتيسير الإجراءات",
    praiseEn: "serving citizens and residents and facilitating procedures",
    allowedLetterTypes: [
      "noc", "rop_family_to_work", "rop_family_joining", "rop_visit_to_work",
      "rop_investor_residence", "rop_card_replacement", "rop_residence_renewal",
      "rop_residence_cancellation", "rop_objection", "rop_data_correction",
      "rop_proof_of_residence", "rop_movement_record", "rop_proof_of_departure",
      "rop_visit_visa_extension",
    ],
  },
  {
    id: "muscat-municipality",
    nameAr: "بلدية مسقط",
    nameEn: "Muscat Municipality",
    recipientTitleAr: "رئيس بلدية مسقط",
    recipientTitleEn: "The Director of Licensing",
    recipients: [
      { ar: "رئيس بلدية مسقط", en: "The Director of Licensing" },
      { ar: "سعادة رئيس بلدية مسقط", en: "H.E. the Chairman of Muscat Municipality" },
      { ar: "المدير العام", en: "The Director General" },
      { ar: "مدير بلدية ولاية", en: "The Director of the Municipality of the Wilayat of", needsDepartment: true },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "خدمة المواطنين والمقيمين وتطوير المرافق العامة",
    praiseEn: "serving citizens and residents and developing public facilities",
    allowedLetterTypes: [
      "muni_license_renewal", "muni_signboard_permit", "muni_event_permit",
      "muni_violation_objection", "muni_clearance", "muni_license_transfer",
      "muni_building_permit", "muni_completion_certificate", "muni_lease_registration",
      "muni_parking_permit",
    ],
  },
  {
    id: "other",
    nameAr: "جهة حكومية أخرى",
    nameEn: "Other Government Authority",
    recipientTitleAr: "المدير العام",
    recipientTitleEn: "The Director General",
    recipients: [
      { ar: "المدير العام", en: "The Director General" },
      DEPARTMENT,
      FREE_TEXT,
    ],
    praiseAr: "خدمة المواطنين والمقيمين وقطاع الأعمال",
    praiseEn: "serving citizens, residents and the business sector",
    allowedLetterTypes: ["custom"],
  },
];

export const getAuthority = (id: string): MinistryAuthority =>
  AUTHORITIES.find((a) => a.id === id) ?? AUTHORITIES[AUTHORITIES.length - 1];

/** Short code used in English file names, e.g. "rop-passports" -> "ROP". */
export const authorityCode = (id: string): string =>
  (id.split("-")[0] || "GOV").toUpperCase();

/**
 * Build the single addressee string the renderer receives. A
 * department-based recipient appends the name the user typed; a
 * free-text recipient is the user's own words. No second address
 * line, no layout change.
 */
export function composeRecipientTitle(
  recipient: RecipientOption,
  lang: "ar" | "en",
  detail?: string,
): string {
  const base = lang === "en" ? recipient.en : recipient.ar;
  const extra = (detail ?? "").trim();

  if (recipient.freeText) return extra || base;
  if (recipient.needsDepartment && extra) return `${base} ${extra}`;
  return base;
}
