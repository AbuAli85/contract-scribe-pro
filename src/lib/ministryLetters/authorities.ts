// MASTER_LIST_VERSION: v1.0 — locked 2026-08-09 — approved by Fahad Alamri
// =============================================================
// Authority registry (L0)
//
// Each authority carries its addressee options, the praise formula
// used in the opening paragraph, the law it enforces, and the letter
// types it accepts (master-list order).
//
// ADDRESSEE MODEL (Addressing Protocol v1.0 — approved 2026-08-10):
// each recipient entry stores its honorific INSIDE the string —
// «معالي / …», «سعادة / …», «الفاضل / …» — and its closing honorific
// («المحترم» or «الموقر») in `closing`. The renderer drops the composed
// string where the fixed title always went and prints `closing` in the
// third cell; it no longer prepends «الفاضل /» or hardcodes «المحترم».
// recipients[0] is the default; the scalar recipientTitleAr/En mirror it
// (honorific embedded) for callers that don't offer a choice. Every list
// ends with a free-text option so no user is trapped by the dropdown, and
// a free-text entry has no static `closing` — the renderer resolves it
// from the user's own text.
// =============================================================

import type { MinistryAuthority, RecipientOption } from "./types";

/** The escape hatch appended to every authority's recipient list. */
const FREE_TEXT: RecipientOption = {
  ar: "أخرى — نص حر",
  en: "Other — free text",
  freeText: true,
};

/** «الفاضل / مدير دائرة …» + the department the user names. */
const DEPARTMENT: RecipientOption = {
  ar: "الفاضل / مدير دائرة",
  en: "Director of the Department of",
  needsDepartment: true,
  closing: "المحترم",
};

export const AUTHORITIES: MinistryAuthority[] = [
  {
    id: "spf",
    nameAr: "صندوق الحماية الاجتماعية",
    nameEn: "Social Protection Fund",
    recipientTitleAr: "الفاضل / مدير الاشتراكات",
    recipientTitleEn: "The Director of Contributions",
    recipients: [
      { ar: "الفاضل / مدير الاشتراكات", en: "The Director of Contributions", closing: "المحترم" },
      { ar: "سعادة / رئيس صندوق الحماية الاجتماعية", en: "H.E. the Chairman of the Social Protection Fund", closing: "المحترم" },
      { ar: "الفاضل / المدير العام", en: "The Director General", closing: "المحترم" },
      { ar: "الفاضل / مدير دائرة الاشتراكات والتحصيل", en: "The Director of Contributions and Collection", closing: "المحترم" },
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
    recipientTitleAr: "الفاضل / مدير عام التشغيل",
    recipientTitleEn: "The Director of Labour Relations",
    recipients: [
      { ar: "الفاضل / مدير عام التشغيل", en: "The Director of Labour Relations", closing: "المحترم" },
      { ar: "معالي / وزير العمل", en: "H.E. the Minister of Labour", closing: "الموقر" },
      { ar: "سعادة / وكيل وزارة العمل", en: "H.E. the Undersecretary", closing: "المحترم" },
      { ar: "الفاضل / المدير العام للعمل", en: "The Director General of Labour", closing: "المحترم" },
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
    recipientTitleAr: "معالي / رئيس جهاز الضرائب",
    recipientTitleEn: "H.E. the Chairman of the Tax Authority",
    recipients: [
      // Merged from the old chairman pair (رئيس / سعادة رئيس): one office,
      // one entry, ministerial rank → «معالي / …» and closing «الموقر».
      { ar: "معالي / رئيس جهاز الضرائب", en: "H.E. the Chairman of the Tax Authority", closing: "الموقر" },
      { ar: "الفاضل / المدير العام", en: "The Director General", closing: "المحترم" },
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
    recipientTitleAr: "الفاضل / مدير عام التجارة",
    recipientTitleEn: "The Director of Commercial Affairs",
    recipients: [
      // Merged with the old «المدير العام للتجارة» honorific/wording duplicate
      // of the same office; the default's own EN survives (v1.1 reconciles the
      // مدير عام التجارة ↔ Commercial Affairs wording).
      { ar: "الفاضل / مدير عام التجارة", en: "The Director of Commercial Affairs", closing: "المحترم" },
      { ar: "معالي / وزير التجارة والصناعة وترويج الاستثمار", en: "H.E. the Minister of Commerce, Industry and Investment Promotion", closing: "الموقر" },
      { ar: "سعادة / الوكيل للتجارة والصناعة", en: "The Undersecretary for Commerce and Industry", closing: "المحترم" },
      { ar: "سعادة / الوكيلة لترويج الاستثمار", en: "The Undersecretary for Investment Promotion", closing: "المحترم" },
      // CR matters (signatory changes, amendments) are addressed here often
      // enough that it must be one tap, not a hand-typed title.
      { ar: "الفاضل / أمين السجل التجاري", en: "Registrar of the Commercial Registry", closing: "المحترم" },
      { ar: "الفاضل / مدير دائرة السجل التجاري", en: "The Director of the Commercial Registry Department", closing: "المحترم" },
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
    recipientTitleAr: "الفاضل / مدير عام الجوازات والإقامة",
    recipientTitleEn: "The Director General",
    recipients: [
      // Merged from the old DG pair (مدير عام / سعادة المدير العام) of the
      // same office; the default's own EN «The Director General» survives.
      { ar: "الفاضل / مدير عام الجوازات والإقامة", en: "The Director General", closing: "المحترم" },
      { ar: "الفاضل / مدير إدارة الجوازات والإقامة بمحافظة", en: "The Director of Passports and Residence in the Governorate of", needsDepartment: true, closing: "المحترم" },
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
    recipientTitleAr: "سعادة / رئيس بلدية مسقط",
    recipientTitleEn: "H.E. the Chairman of Muscat Municipality",
    recipients: [
      // Merged from the old chairman pair (رئيس / سعادة رئيس) of the same
      // office; the chairman entry's existing EN survives (§6). This changes
      // the English default addressee — one of the two authorised EN
      // exceptions this sprint (see also Tax).
      { ar: "سعادة / رئيس بلدية مسقط", en: "H.E. the Chairman of Muscat Municipality", closing: "المحترم" },
      { ar: "الفاضل / المدير العام", en: "The Director General", closing: "المحترم" },
      { ar: "الفاضل / مدير بلدية ولاية", en: "The Director of the Municipality of the Wilayat of", needsDepartment: true, closing: "المحترم" },
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
    recipientTitleAr: "الفاضل / المدير العام",
    recipientTitleEn: "The Director General",
    recipients: [
      { ar: "الفاضل / المدير العام", en: "The Director General", closing: "المحترم" },
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

/**
 * Arabic closing for a free-text addressee. The system prefixes no
 * honorific on free text, so the closing is inferred from the words the
 * user chose: a ministerial opening («معالي») takes «الموقر», everything
 * else takes «المحترم». (Addressing Protocol v1.0, Commit B rule.)
 */
export function freeTextClosingAr(text: string): "المحترم" | "الموقر" {
  return text.trim().startsWith("معالي") ? "الموقر" : "المحترم";
}
