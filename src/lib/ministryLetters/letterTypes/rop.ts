// Master list v1.0 — §5 شرطة عُمان السلطانية — الجوازات والإقامة (ROP) — 14 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";
import { authoredType } from "./_build";

const A = "rop-passports";

export const ROP_TYPES: MinistryLetterType[] = [
  authoredType({
    id: "noc",
    authorityId: A,
    titleAr: "طلب عدم ممانعة (NOC)",
    titleEn: "Non-objection certificate",
    descAr: "إصدار خطاب عدم ممانعة بشأن معاملة محددة",
    descEn: "Request a no-objection letter for a specific matter",
  }),
  genericType({
    id: "rop_family_to_work",
    authorityId: A,
    titleAr: "طلب تحويل إقامة مرافق عائلي إلى إقامة عمل",
    titleEn: "Family-joining to employment visa",
    fields: [
      f("person_name", "اسم الشخص", "Person's name"),
      f("current_residence_number", "رقم الإقامة الحالية", "Current residence number"),
      f("new_sponsor", "الكفيل / المنشأة الجديدة", "New sponsor / establishment"),
      f("proposed_occupation", "المهنة المقترحة", "Proposed occupation"),
    ],
  }),
  genericType({
    id: "rop_family_joining",
    authorityId: A,
    titleAr: "طلب التحاق عائلي",
    titleEn: "Family joining visa request",
    fields: [
      f("sponsor_name", "اسم العامل / الكفيل", "Employee / sponsor name"),
      f("sponsor_salary", "راتب الكفيل (ر.ع)", "Sponsor's salary (OMR)", { type: "currency-omr", helperAr: "الحد الأدنى ٦٠٠ ر.ع", helperEn: "Minimum OMR 600" }),
      f("family_members", "أسماء أفراد الأسرة", "Family members' names", { type: "textarea" }),
      f("relationship", "صلة القرابة", "Relationship"),
      f("passport_numbers", "أرقام الجوازات", "Passport numbers", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "rop_visit_to_work",
    authorityId: A,
    titleAr: "طلب تحويل تأشيرة زيارة إلى إقامة عمل",
    titleEn: "Visit visa to work residence conversion",
    fields: [
      f("person_name", "اسم الشخص", "Person's name"),
      f("visit_visa_number", "رقم تأشيرة الزيارة", "Visit visa number"),
      f("sponsor", "الكفيل / المنشأة", "Sponsor / establishment"),
      f("proposed_occupation", "المهنة المقترحة", "Proposed occupation"),
    ],
  }),
  genericType({
    id: "rop_investor_residence",
    authorityId: A,
    titleAr: "طلب إقامة مستثمر",
    titleEn: "Investor residence request",
    fields: [
      f("investor_name", "اسم المستثمر", "Investor's name"),
      f("investor_cr_number", "رقم السجل التجاري", "Commercial registration number"),
      f("ownership_or_investment", "نسبة الملكية / قيمة الاستثمار", "Ownership share / investment value"),
      f("residence_duration", "مدة الإقامة", "Residence duration", { helperAr: "٥ أو ١٠ سنوات", helperEn: "5 or 10 years" }),
    ],
  }),
  genericType({
    id: "rop_card_replacement",
    authorityId: A,
    titleAr: "طلب بدل فاقد / تالف لبطاقة المقيم",
    titleEn: "Lost / damaged resident card replacement",
    fields: [
      f("resident_name", "اسم المقيم", "Resident's name"),
      f("card_number", "رقم البطاقة (إن وُجد)", "Card number (if known)", { required: false }),
      f("replacement_reason", "سبب الطلب (فاقد / تالف)", "Reason (lost / damaged)"),
    ],
  }),
  genericType({
    id: "rop_residence_renewal",
    authorityId: A,
    titleAr: "طلب تجديد إقامة",
    titleEn: "Residence renewal",
    fields: [
      f("resident_name", "اسم المقيم", "Resident's name"),
      f("residence_number", "رقم الإقامة", "Residence number"),
      f("renewal_period", "مدة التجديد المطلوبة", "Renewal period requested"),
    ],
  }),
  genericType({
    id: "rop_residence_cancellation",
    authorityId: A,
    titleAr: "طلب إلغاء إقامة / تأشيرة",
    titleEn: "Visa / residence cancellation",
    fields: [
      f("resident_name", "اسم المقيم", "Resident's name"),
      f("residence_or_visa_number", "رقم الإقامة / التأشيرة", "Residence / visa number"),
      f("cancellation_reason", "سبب الإلغاء", "Reason for cancellation", { type: "textarea" }),
      f("expected_departure_date", "تاريخ المغادرة المتوقع", "Expected departure date"),
    ],
  }),
  genericType({
    id: "rop_objection",
    authorityId: A,
    titleAr: "تظلم من قرار",
    titleEn: "Objection / appeal",
    fields: [
      f("decision_or_case_number", "رقم القرار / المعاملة", "Decision / case number"),
      f("objection_reasons", "أسباب التظلم", "Grounds of objection", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "rop_data_correction",
    authorityId: A,
    titleAr: "طلب تعديل بيانات",
    titleEn: "Data correction",
    fields: [
      f("wrong_data", "البيان الخاطئ", "Incorrect detail"),
      f("correct_data", "البيان الصحيح", "Correct detail"),
      f("supporting_document", "المستند الداعم", "Supporting document"),
    ],
  }),
  genericType({
    id: "rop_proof_of_residence",
    authorityId: A,
    titleAr: "طلب شهادة إثبات إقامة",
    titleEn: "Proof-of-residence certificate",
    fields: [
      f("resident_name", "اسم المقيم", "Resident's name"),
      f("civil_number", "الرقم المدني", "Civil number"),
      f("submitted_to", "الجهة المطلوب تقديم الشهادة لها", "Entity the certificate is for"),
    ],
  }),
  genericType({
    id: "rop_movement_record",
    authorityId: A,
    titleAr: "طلب كشف تحركات (دخول وخروج)",
    titleEn: "Entry-exit movement record",
    fields: [
      f("person_name", "اسم الشخص", "Person's name"),
      f("id_or_passport_number", "الرقم المدني / رقم الجواز", "Civil / passport number"),
      f("period", "الفترة المطلوبة", "Period required"),
      f("purpose", "الغرض", "Purpose"),
    ],
  }),
  genericType({
    id: "rop_proof_of_departure",
    authorityId: A,
    titleAr: "طلب شهادة إثبات مغادرة",
    titleEn: "Proof-of-departure certificate",
    fields: [
      f("person_name", "اسم الشخص", "Person's name"),
      f("passport_number", "رقم الجواز", "Passport number"),
      f("approx_departure_date", "تاريخ المغادرة التقريبي", "Approximate departure date"),
    ],
  }),
  genericType({
    id: "rop_visit_visa_extension",
    authorityId: A,
    titleAr: "طلب تمديد تأشيرة زيارة",
    titleEn: "Visit visa extension",
    fields: [
      f("visitor_name", "اسم الزائر", "Visitor's name"),
      f("visa_number", "رقم التأشيرة", "Visa number"),
      f("extension_period", "مدة التمديد المطلوبة", "Extension period requested"),
      f("extension_reason", "سبب التمديد", "Reason for the extension", { type: "textarea" }),
    ],
  }),
];
