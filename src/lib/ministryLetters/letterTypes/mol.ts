// Master list v1.0 — §2 وزارة العمل (MOL) — 15 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";
import { authoredType } from "./_build";

const A = "mol";

export const MOL_TYPES: MinistryLetterType[] = [
  genericType({
    id: "mol_omanisation_exemption",
    authorityId: A,
    titleAr: "طلب استثناء من نسبة التعمين",
    titleEn: "Omanisation exemption request",
    fields: [
      f("current_ratio", "النسبة الحالية %", "Current percentage %", { placeholderEn: "22%" }),
      f("requested_ratio", "النسبة المطلوب الاستثناء منها %", "Percentage exemption sought %", { placeholderEn: "35%" }),
      f("sector_activity", "القطاع / النشاط", "Sector / activity"),
      f("justifications", "المبررات", "Justifications", { type: "textarea" }),
    ],
  }),
  authoredType({
    id: "extension",
    authorityId: A,
    titleAr: "طلب تمديد مهلة توفيق الأوضاع",
    titleEn: "Extension of compliance deadline",
    descAr: "تمديد مهلة لتوفيق الأوضاع أو استكمال متطلبات",
    descEn: "Extend a compliance/administrative deadline",
  }),
  genericType({
    id: "mol_recruitment_clearance",
    authorityId: A,
    titleAr: "طلب ترخيص استقدام قوى عاملة",
    titleEn: "Labour recruitment clearance",
    fields: [
      f("workers_count", "عدد العمال المطلوب", "Number of workers required", { type: "number", placeholderEn: "10" }),
      f("occupations", "المهن المطلوبة", "Occupations required", { type: "textarea" }),
      f("nationalities", "الجنسيات", "Nationalities"),
    ],
  }),
  genericType({
    id: "mol_replacement_permit",
    authorityId: A,
    titleAr: "طلب تصريح عمل بدل مغادر / مغادرة مبكرة",
    titleEn: "Replacement work permit (departed worker)",
    fields: [
      f("departed_worker_name", "اسم العامل المغادر", "Departed worker's name"),
      f("departure_date", "تاريخ مغادرته", "Date of departure", { placeholderEn: "15 July 2026" }),
      f("occupation", "المهنة", "Occupation"),
      f("replacement_worker_details", "بيانات العامل البديل", "Replacement worker's details", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mol_worker_transfer",
    authorityId: A,
    titleAr: "طلب نقل خدمات عامل / تنازل",
    titleEn: "Worker transfer / release",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("worker_id_number", "الرقم المدني / رقم البطاقة", "Civil / card number"),
      f("from_establishment", "المنشأة المنقول منها", "Transferring from establishment"),
      f("to_establishment", "المنشأة المنقول إليها", "Transferring to establishment"),
    ],
  }),
  genericType({
    id: "mol_occupation_change",
    authorityId: A,
    titleAr: "طلب تعديل مهنة عامل",
    titleEn: "Occupation change",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("current_occupation", "المهنة الحالية", "Current occupation"),
      f("new_occupation", "المهنة الجديدة", "New occupation"),
    ],
  }),
  genericType({
    id: "mol_permit_cancellation",
    authorityId: A,
    titleAr: "طلب إلغاء تصريح عمل",
    titleEn: "Work permit cancellation",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("permit_number", "رقم التصريح", "Permit number"),
      f("cancellation_reason", "سبب الإلغاء", "Reason for cancellation", { type: "textarea" }),
    ],
  }),
  authoredType({
    id: "objection",
    authorityId: A,
    titleAr: "تظلم من مخالفة أو قرار",
    titleEn: "Objection to a violation / decision",
    descAr: "اعتراض على مخالفة أو قرار صادر بحق المنشأة",
    descEn: "Object to a violation or decision issued against the establishment",
  }),
  genericType({
    id: "mol_clearance",
    authorityId: A,
    titleAr: "طلب براءة ذمة",
    titleEn: "Clearance certificate",
    fields: [f("certificate_purpose", "الغرض من الشهادة", "Purpose of the certificate")],
  }),
  genericType({
    id: "mol_permit_renewal",
    authorityId: A,
    titleAr: "طلب تجديد تصريح عمل",
    titleEn: "Work permit renewal",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("permit_number", "رقم التصريح", "Permit number"),
      f("renewal_period", "مدة التجديد المطلوبة", "Renewal period requested", { placeholderAr: "سنتان", placeholderEn: "Two years" }),
    ],
  }),
  genericType({
    id: "mol_cancel_absconding",
    authorityId: A,
    titleAr: "طلب إلغاء بلاغ ترك عمل",
    titleEn: "Cancellation of absconding report",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("report_number", "رقم البلاغ", "Report number"),
      f("cancellation_reason", "سبب الإلغاء (تسوية / عودة العامل / خطأ)", "Reason (settlement / worker returned / error)", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mol_fines_waiver",
    authorityId: A,
    titleAr: "طلب إعفاء / تخفيض غرامات عمالية",
    titleEn: "Labour fines waiver / reduction",
    fields: [
      f("fine_number", "رقم الغرامة / الفاتورة", "Fine / invoice number"),
      f("fine_amount", "المبلغ (ر.ع)", "Amount (OMR)", { type: "currency-omr" }),
      f("justifications", "المبررات", "Justifications", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "mol_termination_notice",
    authorityId: A,
    titleAr: "إخطار إنهاء عقود قوى عاملة عمانية",
    titleEn: "Termination notice — Omani employees",
    fields: [
      f("affected_workers_count", "عدد العمال المعنيين", "Number of employees affected", { type: "number" }),
      f("termination_reasons", "أسباب الإنهاء", "Reasons for termination", { type: "textarea" }),
      f("proposed_date", "التاريخ المقترح", "Proposed date", { placeholderEn: "1 October 2026" }),
    ],
  }),
  genericType({
    id: "mol_secondment",
    authorityId: A,
    titleAr: "طلب انتداب / إعارة قوى عاملة",
    titleEn: "Worker secondment request",
    fields: [
      f("worker_name", "اسم العامل", "Worker's name"),
      f("borrowing_establishment", "المنشأة المستعيرة", "Borrowing establishment"),
      f("secondment_period", "مدة الانتداب", "Secondment period"),
    ],
  }),
  genericType({
    id: "mol_midday_permit",
    authorityId: A,
    titleAr: "طلب تصريح عمل وقت الظهيرة (صيفًا)",
    titleEn: "Summer midday work permit",
    fields: [
      f("work_site", "موقع العمل", "Work site"),
      f("work_nature", "طبيعة العمل", "Nature of the work", { type: "textarea" }),
      f("requested_period", "الفترة المطلوبة", "Period requested"),
    ],
  }),
];
