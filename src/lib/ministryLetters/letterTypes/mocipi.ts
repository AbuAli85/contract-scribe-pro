// Master list v1.0 — §4 وزارة التجارة والصناعة وترويج الاستثمار (MOCIPI) — 13 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";

const A = "mocipi";

export const MOCIPI_TYPES: MinistryLetterType[] = [
  genericType({
    id: "mocipi_cr_amendment",
    authorityId: A,
    titleAr: "طلب تعديل بيانات السجل التجاري",
    titleEn: "CR data amendment",
    fields: [
      f("field_to_amend", "البيان المطلوب تعديله", "Detail to be amended"),
      f("new_value", "القيمة الجديدة", "New value"),
    ],
  }),
  genericType({
    id: "mocipi_activity_change",
    authorityId: A,
    titleAr: "طلب إضافة / حذف نشاط تجاري",
    titleEn: "Add / remove business activity",
    fields: [
      f("activity", "النشاط (إضافة أو حذف)", "Activity (add or remove)", { type: "textarea" }),
      f("activity_code", "رمز النشاط (إن وُجد)", "Activity code (if any)", { required: false }),
    ],
  }),
  genericType({
    id: "mocipi_share_transfer",
    authorityId: A,
    titleAr: "طلب بيع / التنازل عن حصص",
    titleEn: "Sale / transfer of shares",
    fields: [
      f("seller_name", "اسم الشريك البائع / المتنازل", "Selling / assigning partner"),
      f("buyer_name", "اسم المشتري / المتنازل له", "Buyer / assignee"),
      f("share_percentage", "نسبة الحصص %", "Share percentage %", { placeholderEn: "30%" }),
    ],
  }),
  genericType({
    id: "mocipi_partner_change",
    authorityId: A,
    titleAr: "طلب دخول / خروج شريك",
    titleEn: "Partner entry / exit",
    fields: [
      f("partner_name", "اسم الشريك", "Partner's name"),
      f("entry_or_exit", "دخول أم خروج", "Entry or exit"),
      f("percentage", "النسبة %", "Percentage %"),
    ],
  }),
  genericType({
    id: "mocipi_signatory_change",
    authorityId: A,
    titleAr: "طلب تغيير أو إضافة مفوض بالتوقيع",
    titleEn: "Change / add authorized signatory",
    fields: [
      f("new_signatory_name", "اسم المفوض الجديد", "New signatory's name"),
      f("civil_number", "الرقم المدني", "Civil number"),
      f("authority_limits", "حدود الصلاحية", "Limits of authority", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mocipi_trade_name_change",
    authorityId: A,
    titleAr: "طلب تغيير الاسم التجاري",
    titleEn: "Trade name change",
    fields: [
      f("current_trade_name", "الاسم التجاري الحالي", "Current trade name"),
      f("new_trade_name", "الاسم التجاري الجديد", "New trade name"),
    ],
  }),
  genericType({
    id: "mocipi_cr_ownership_transfer",
    authorityId: A,
    titleAr: "طلب نقل ملكية / التنازل عن السجل التجاري",
    titleEn: "CR ownership transfer / assignment",
    fields: [
      f("current_owner_name", "اسم المالك الحالي", "Current owner's name"),
      f("new_owner_name", "اسم المالك الجديد", "New owner's name"),
      f("both_civil_numbers", "الرقم المدني للطرفين", "Civil numbers of both parties"),
    ],
  }),
  genericType({
    id: "mocipi_cr_cancellation",
    authorityId: A,
    titleAr: "طلب شطب / إلغاء السجل التجاري",
    titleEn: "CR deletion / cancellation",
    fields: [
      f("cancellation_reason", "سبب الشطب", "Reason for cancellation", { type: "textarea" }),
      f("activity_stop_date", "تاريخ توقف النشاط", "Date activity ceased"),
      f("liabilities_declaration", "إقرار بسداد الالتزامات", "Declaration that liabilities are settled", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mocipi_preliminary_approval",
    authorityId: A,
    titleAr: "طلب موافقة مبدئية",
    titleEn: "Preliminary approval",
    fields: [
      f("proposed_activity", "النشاط المقترح", "Proposed activity"),
      f("location", "الموقع", "Location"),
    ],
  }),
  genericType({
    id: "mocipi_objection",
    authorityId: A,
    titleAr: "تظلم من قرار",
    titleEn: "Objection to a decision",
    fields: [
      f("decision_number", "رقم القرار", "Decision number"),
      f("decision_date", "تاريخه", "Decision date"),
      f("objection_reasons", "أسباب التظلم", "Grounds of objection", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mocipi_dissolution",
    authorityId: A,
    titleAr: "طلب حل وتصفية شركة",
    titleEn: "Company dissolution & liquidation",
    fields: [
      f("dissolution_reason", "سبب الحل", "Reason for dissolution", { type: "textarea" }),
      f("proposed_liquidator", "اسم المصفي المقترح", "Proposed liquidator"),
      f("liabilities_declaration", "إقرار بسداد الالتزامات", "Declaration that liabilities are settled", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mocipi_foreign_branch",
    authorityId: A,
    titleAr: "طلب تسجيل فرع شركة أجنبية / مكتب تمثيل",
    titleEn: "Foreign branch / representative office registration",
    fields: [
      f("parent_company", "اسم الشركة الأم ودولتها", "Parent company and its country"),
      f("activity", "النشاط", "Activity"),
      f("responsible_manager", "اسم المدير المسؤول", "Responsible manager"),
    ],
  }),
  genericType({
    id: "mocipi_commercial_agency",
    authorityId: A,
    titleAr: "طلب تسجيل / شطب وكالة تجارية",
    titleEn: "Commercial agency registration / deregistration",
    fields: [
      f("principal_name", "اسم الموكِّل الأجنبي", "Foreign principal's name"),
      f("products_services", "المنتجات / الخدمات", "Products / services", { type: "textarea" }),
      f("register_or_deregister", "تسجيل أم شطب", "Registration or deregistration"),
    ],
  }),
];
