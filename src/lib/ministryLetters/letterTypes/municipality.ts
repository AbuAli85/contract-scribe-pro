// Master list v1.0 — §6 بلدية مسقط (Muscat Municipality) — 10 types
import type { MinistryLetterType } from "../types";
import { f, genericType } from "../skeletons/generic";

const A = "muscat-municipality";

export const MUNICIPALITY_TYPES: MinistryLetterType[] = [
  genericType({
    id: "muni_license_renewal",
    authorityId: A,
    titleAr: "طلب تجديد ترخيص بلدي",
    titleEn: "Municipal license renewal",
    fields: [
      f("license_number", "رقم الترخيص", "License number"),
      f("activity", "النشاط", "Activity"),
      f("location_wilayat", "الموقع / الولاية", "Location / wilayat"),
    ],
  }),
  genericType({
    id: "muni_signboard_permit",
    authorityId: A,
    titleAr: "طلب تصريح لافتة إعلانية",
    titleEn: "Signboard permit",
    fields: [
      f("signboard_size", "مقاس اللافتة", "Signboard size", { placeholderEn: "3m × 1m" }),
      f("location", "الموقع", "Location"),
      f("signboard_text", "نص اللافتة", "Signboard text", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "muni_event_permit",
    authorityId: A,
    titleAr: "طلب تصريح فعالية / عمل مؤقت",
    titleEn: "Event / temporary-work permit",
    fields: [
      f("event_type", "نوع الفعالية / العمل", "Type of event / work"),
      f("location", "الموقع", "Location"),
      f("date_and_duration", "التاريخ والمدة", "Date and duration"),
    ],
  }),
  genericType({
    id: "muni_violation_objection",
    authorityId: A,
    titleAr: "اعتراض على مخالفة بلدية",
    titleEn: "Objection to a municipal violation",
    fields: [
      f("violation_number", "رقم المخالفة", "Violation number"),
      f("violation_date", "تاريخها", "Violation date"),
      f("objection_reasons", "أسباب الاعتراض", "Grounds of objection", { type: "textarea" }),
    ],
  }),
  genericType({
    id: "muni_clearance",
    authorityId: A,
    titleAr: "طلب براءة ذمة بلدية",
    titleEn: "Municipal clearance",
    fields: [
      f("license_number", "رقم الترخيص", "License number"),
      f("purpose", "الغرض", "Purpose"),
    ],
  }),
  genericType({
    id: "muni_license_transfer",
    authorityId: A,
    titleAr: "طلب نقل ملكية ترخيص",
    titleEn: "License ownership transfer",
    fields: [
      f("license_number", "رقم الترخيص", "License number"),
      f("current_owner", "المالك الحالي", "Current owner"),
      f("new_owner", "المالك الجديد", "New owner"),
    ],
  }),
  genericType({
    id: "muni_building_permit",
    authorityId: A,
    titleAr: "طلب إباحة بناء / تجديدها",
    titleEn: "Building permit (issue / renew)",
    fields: [
      f("plot_number", "رقم القطعة / الكروكي", "Plot / sketch number"),
      f("location_wilayat", "الموقع / الولاية", "Location / wilayat"),
      f("building_type", "نوع البناء", "Type of building"),
      f("issue_or_renew", "إصدار أم تجديد", "Issue or renew"),
    ],
  }),
  genericType({
    id: "muni_completion_certificate",
    authorityId: A,
    titleAr: "طلب شهادة إتمام بناء",
    titleEn: "Building completion certificate",
    fields: [
      f("building_permit_number", "رقم إباحة البناء", "Building permit number"),
      f("location", "الموقع", "Location"),
      f("completion_date", "تاريخ اكتمال الأعمال", "Date works were completed"),
    ],
  }),
  genericType({
    id: "muni_lease_registration",
    authorityId: A,
    titleAr: "طلب تسجيل / تجديد عقد إيجار",
    titleEn: "Lease contract registration / renewal",
    fields: [
      f("contract_parties", "طرفا العقد", "Parties to the contract"),
      f("location_unit", "الموقع / رقم الوحدة", "Location / unit number"),
      f("contract_duration", "مدة العقد", "Contract duration"),
      f("rent_value", "القيمة الإيجارية (ر.ع)", "Rent value (OMR)", { type: "currency-omr" }),
    ],
  }),
  genericType({
    id: "muni_parking_permit",
    authorityId: A,
    titleAr: "طلب تصريح حجز مواقف عامة",
    titleEn: "Public parking reservation permit",
    fields: [
      f("location", "الموقع", "Location"),
      f("parking_count", "عدد المواقف", "Number of parking spaces", { type: "number" }),
      f("duration_and_purpose", "المدة والغرض", "Duration and purpose", { type: "textarea" }),
    ],
  }),
];
