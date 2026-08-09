// Master list v1.0 — §3 جهاز الضرائب (Tax Authority) — 8 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";

const A = "tax";
const taxNumber = () =>
  f("tax_number", "الرقم الضريبي", "Tax number (VATIN/TIN)", { placeholderEn: "OM1100000000" });

export const TAX_TYPES: MinistryLetterType[] = [
  genericType({
    id: "tax_objection",
    authorityId: A,
    titleAr: "تظلم ضريبي / اعتراض على ربط",
    titleEn: "Tax objection / appeal",
    fields: [
      taxNumber(),
      f("assessment_number", "رقم الربط / الإخطار", "Assessment / notice number"),
      f("tax_period", "السنة أو الفترة الضريبية", "Tax year or period", { placeholderEn: "2025" }),
      f("objected_amount", "المبلغ محل الاعتراض (ر.ع)", "Amount under objection (OMR)", { type: "currency-omr" }),
      f("objection_reasons", "أسباب الاعتراض", "Grounds of objection", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "tax_installment",
    authorityId: A,
    titleAr: "طلب تقسيط ضريبة مستحقة",
    titleEn: "Installment of tax due",
    fields: [
      taxNumber(),
      f("due_amount", "المبلغ المستحق (ر.ع)", "Amount due (OMR)", { type: "currency-omr" }),
      f("installments_count", "عدد الأقساط المطلوبة", "Number of installments requested", { type: "number", placeholderEn: "4" }),
      f("justifications", "المبررات", "Justifications", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "tax_return_amendment",
    authorityId: A,
    titleAr: "طلب تصحيح إقرار ضريبي",
    titleEn: "Amendment of a filed return",
    fields: [
      taxNumber(),
      f("tax_period", "الفترة الضريبية", "Tax period"),
      f("wrong_data", "البيان الخاطئ", "Incorrect detail"),
      f("correction_required", "التصحيح المطلوب", "Correction required", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "tax_clearance",
    authorityId: A,
    titleAr: "طلب شهادة براءة ذمة ضريبية",
    titleEn: "Tax clearance certificate",
    fields: [taxNumber(), f("certificate_purpose", "الغرض من الشهادة", "Purpose of the certificate")],
  }),
  genericType({
    id: "tax_vat_refund",
    authorityId: A,
    titleAr: "طلب استرداد ضريبة القيمة المضافة",
    titleEn: "VAT refund",
    fields: [
      taxNumber(),
      f("refund_amount", "المبلغ المطلوب استرداده (ر.ع)", "Amount to be refunded (OMR)", { type: "currency-omr" }),
      f("period", "الفترة", "Period"),
      f("iban", "رقم الحساب البنكي (IBAN)", "Bank account number (IBAN)"),
    ],
  }),
  genericType({
    id: "tax_penalty_waiver",
    authorityId: A,
    titleAr: "طلب إعفاء / إلغاء غرامة",
    titleEn: "Penalty waiver",
    fields: [
      f("penalty_number", "رقم الغرامة / الإخطار", "Penalty / notice number"),
      f("penalty_amount", "مبلغ الغرامة (ر.ع)", "Penalty amount (OMR)", { type: "currency-omr" }),
      f("justifications", "المبررات", "Justifications", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "tax_vat_deregistration",
    authorityId: A,
    titleAr: "طلب إلغاء التسجيل في ضريبة القيمة المضافة",
    titleEn: "VAT deregistration",
    fields: [
      taxNumber(),
      f("dereg_reason", "سبب إلغاء التسجيل", "Reason for deregistration", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "tax_residency_certificate",
    authorityId: A,
    titleAr: "طلب شهادة إقامة ضريبية",
    titleEn: "Tax residency certificate",
    fields: [
      taxNumber(),
      f("target_country", "الدولة المطلوب تقديم الشهادة لها", "Country the certificate is for"),
      f("tax_year", "السنة الضريبية", "Tax year", { placeholderEn: "2026" }),
    ],
  }),
];
