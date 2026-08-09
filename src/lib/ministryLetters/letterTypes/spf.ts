// Master list v1.0 — §1 صندوق الحماية الاجتماعية (SPF) — 7 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";
import { authoredType } from "./_build";

const A = "spf";

export const SPF_TYPES: MinistryLetterType[] = [
  authoredType({
    id: "installment",
    authorityId: A,
    titleAr: "طلب تقسيط الاشتراكات المتأخرة",
    titleEn: "Installment of overdue contributions",
    descAr: "تقسيط الاشتراكات المستحقة على المنشأة على دفعات",
    descEn: "Pay overdue contributions in installments",
  }),
  authoredType({
    id: "unblock",
    authorityId: A,
    titleAr: "طلب رفع الإيقاف",
    titleEn: "Lifting of suspension / block",
    descAr: "رفع الإيقاف أو الحظر المفروض على المنشأة",
    descEn: "Lift a block/suspension on the establishment",
  }),
  authoredType({
    id: "clearance",
    authorityId: A,
    titleAr: "طلب براءة ذمة",
    titleEn: "Clearance certificate",
    descAr: "إصدار شهادة براءة ذمة للمنشأة",
    descEn: "Issue a clearance certificate",
  }),
  genericType({
    id: "spf_objection_dues",
    authorityId: A,
    titleAr: "اعتراض على مبالغ مستحقة",
    titleEn: "Objection to assessed dues",
    fields: [
      f("objected_amount", "المبلغ المعترض عليه (ر.ع)", "Objected amount (OMR)", { type: "currency-omr", placeholderEn: "1250.500" }),
      f("objection_period", "الفترة محل الاعتراض", "Period under objection", { placeholderAr: "يناير – مارس ٢٠٢٦", placeholderEn: "January – March 2026" }),
      f("objection_reasons", "أسباب الاعتراض", "Grounds of objection", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "spf_correct_insured_data",
    authorityId: A,
    titleAr: "طلب تصحيح بيانات مؤمَّن عليه",
    titleEn: "Correction of insured person's data",
    fields: [
      f("insured_name", "اسم المؤمَّن عليه", "Insured person's name"),
      f("civil_number", "الرقم المدني", "Civil number"),
      f("wrong_data", "البيان الخاطئ", "Incorrect detail"),
      f("correct_data", "البيان الصحيح", "Correct detail"),
    ],
  }),
  genericType({
    id: "spf_refund_overpayment",
    authorityId: A,
    titleAr: "طلب استرداد مبالغ مدفوعة بالزيادة",
    titleEn: "Refund of overpayment",
    fields: [
      f("refund_amount", "المبلغ المطلوب استرداده (ر.ع)", "Amount to be refunded (OMR)", { type: "currency-omr" }),
      f("payment_period", "فترة الدفع", "Payment period"),
      f("overpayment_reason", "سبب الزيادة", "Reason for the overpayment", { type: "textarea" }),
      f("iban", "رقم الحساب البنكي (IBAN)", "Bank account number (IBAN)", { placeholderEn: "OM00 0000 0000 0000 0000 000" }),
    ],
  }),
  genericType({
    id: "spf_deregister_establishment",
    authorityId: A,
    titleAr: "طلب إلغاء تسجيل منشأة",
    titleEn: "Deregistration of establishment",
    fields: [
      f("dereg_reason", "سبب الإلغاء", "Reason for deregistration", { type: "textarea" }),
      f("activity_stop_date", "تاريخ توقف النشاط", "Date activity ceased", { placeholderEn: "31 December 2026" }),
    ],
  }),
];
