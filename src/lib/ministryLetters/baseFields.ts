// =============================================================
// Base fields (L0) — present on EVERY ministry letter
//
// Master list v1.0: اسم الشركة/المنشأة، رقم السجل التجاري،
// اسم مقدم الطلب، الصفة، رقم التواصل. Letter types declare only
// their EXTRA fields.
// =============================================================

import type { FieldDef } from "./types";

export const BASE_FIELDS: FieldDef[] = [
  {
    key: "company_name",
    group: "Company",
    groupAr: "بيانات المنشأة",
    labelEn: "Company Name",
    labelAr: "اسم الشركة",
    type: "text",
    required: true,
    placeholderAr: "شركة المثال للتجارة ش.م.م",
    placeholderEn: "Example Trading LLC",
    helperAr: "الاسم كما هو مسجل — شاملًا (شركة/مؤسسة) و(ش.م.م)",
    helperEn: "Exactly as registered, including the legal form (LLC, SAOC…)",
  },
  {
    key: "cr_number",
    group: "Company",
    groupAr: "بيانات المنشأة",
    labelEn: "Commercial Registration No.",
    labelAr: "رقم السجل التجاري",
    type: "text",
    required: true,
    placeholderEn: "1234567",
    helperAr: "الرقم فقط — عبارة (السجل التجاري رقم) تُضاف تلقائيًا",
    helperEn: "Number only — the letter already says Commercial Registration No.",
  },
  {
    key: "applicant_name",
    group: "Applicant",
    groupAr: "مقدم الطلب",
    labelEn: "Applicant Name",
    labelAr: "اسم مقدم الطلب",
    type: "text",
    required: true,
    placeholderAr: "سيف محمد الراشدي",
    placeholderEn: "Saif Mohammed Al Rashdi",
  },
  {
    key: "applicant_capacity",
    group: "Applicant",
    groupAr: "مقدم الطلب",
    labelEn: "Capacity",
    labelAr: "الصفة",
    type: "text",
    required: true,
    defaultValue: "المفوض بالتوقيع",
  },
  {
    key: "applicant_phone",
    group: "Applicant",
    groupAr: "مقدم الطلب",
    labelEn: "Contact Number",
    labelAr: "رقم التواصل",
    type: "phone",
    required: true,
    placeholderEn: "9XXXXXXX",
  },
];
