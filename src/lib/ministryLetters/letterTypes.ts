// =============================================================
// Ministry Letters — Letter Type Library
//
// Standard Arabic body skeletons. {tokens} resolve from:
//   COMMON_FIELDS (every letter) + the type's own fields +
//   computed tokens: {authority_praise} {authority_law_clause}
// =============================================================

import type { TemplateField } from "@/lib/templateContent/types";
import type { MinistryLetterType } from "./types";

/** Fields present on EVERY ministry letter */
export const COMMON_FIELDS: TemplateField[] = [
  {
    key: "company_name",
    group: "Company",
    groupAr: "بيانات المنشأة",
    labelEn: "Company Name (Arabic)",
    labelAr: "اسم الشركة",
    type: "text",
    required: true,
    placeholderAr: "شركة المثال للتجارة ش.م.م",
    placeholderEn: "شركة المثال للتجارة ش.م.م",
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
  },
  {
    key: "applicant_name",
    group: "Applicant",
    groupAr: "مقدم الطلب",
    labelEn: "Applicant Name (Arabic)",
    labelAr: "اسم مقدم الطلب",
    type: "text",
    required: true,
    placeholderAr: "سيف محمد الراشدي",
    placeholderEn: "سيف محمد الراشدي",
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

const OPENING =
  "بالإشارة إلى الموضوع أعلاه، نتقدم إليكم نحن شركة {company_name}، المسجلة بالسجل التجاري رقم ({cr_number})، بجزيل الشكر والتقدير لجهودكم في {authority_praise}.";

const CLOSING_COMMIT_GENERIC =
  "ونتعهد بالالتزام الكامل بكافة المتطلبات والإجراءات المقررة لديكم في هذا الشأن.";

export const LETTER_TYPES: MinistryLetterType[] = [
  {
    id: "installment",
    titleAr: "طلب تقسيط مستحقات",
    titleEn: "Installment Request",
    descAr: "تقسيط مبلغ مستحق على المنشأة على دفعات",
    descEn: "Pay outstanding dues in installments",
    subjectAr: "طلب سداد المستحقات على {installment_count} مع رفع الإيقاف",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة تمر بظروف مالية مؤقتة أثّرت على انتظام سداد المستحقات، وحرصًا منّا على الالتزام الكامل بأحكام {authority_law_clause}، نلتمس من عنايتكم الكريمة التفضل بالموافقة على ما يلي:",
      "أولًا: تقسيط إجمالي المبلغ المستحق على الشركة والبالغ ({total_amount} ريال عماني) على {installment_count}، بواقع {installment_breakdown}.",
      "ثانيًا: رفع الإيقاف (الحظر) المفروض على منشأتنا فور سداد القسط الأول، بما يمكّن الشركة من مواصلة أعمالها وإنجاز معاملاتها لدى الجهات الحكومية، والوفاء بالتزاماتها تجاه موظفيها.",
      "ونتعهد بسداد الأقساط في المواعيد المحددة دون تأخير، وبالانتظام في سداد المستحقات الجارية في مواعيدها القانونية.",
    ],
    fields: [
      { key: "total_amount", group: "Amounts", groupAr: "المبالغ", labelEn: "Total Due (OMR)", labelAr: "إجمالي المبلغ المستحق (ر.ع)", type: "currency-omr", required: true, placeholderEn: "443.191" },
      { key: "installment_count", group: "Amounts", groupAr: "المبالغ", labelEn: "Installments", labelAr: "عدد الأقساط", type: "select", required: true, defaultValue: "قسطين", options: [
        { value: "قسطين", labelEn: "Two installments", labelAr: "قسطين" },
        { value: "ثلاثة أقساط", labelEn: "Three installments", labelAr: "ثلاثة أقساط" },
        { value: "أربعة أقساط", labelEn: "Four installments", labelAr: "أربعة أقساط" },
      ]},
      { key: "installment_breakdown", group: "Amounts", groupAr: "المبالغ", labelEn: "Breakdown (Arabic)", labelAr: "تفصيل الأقساط", type: "textarea", required: true, placeholderAr: "(222.191 ريال عماني) للقسط الأول، و(221.000 ريال عماني) للقسط الثاني", placeholderEn: "(222.191 ريال عماني) للقسط الأول، و(221.000 ريال عماني) للقسط الثاني", helperAr: "بدون تواريخ إلا إذا طُلبت", helperEn: "Amounts per installment; no dates unless required" },
    ],
  },
  {
    id: "unblock",
    titleAr: "طلب رفع إيقاف",
    titleEn: "Lift Suspension Request",
    descAr: "رفع الإيقاف أو الحظر المفروض على المنشأة",
    descEn: "Lift a block/suspension on the establishment",
    subjectAr: "طلب رفع الإيقاف المفروض على المنشأة",
    bodyAr: [
      OPENING,
      "ونفيدكم بأنه تم إيقاف معاملات منشأتنا لديكم بسبب {block_reason}، وقد قمنا بمعالجة أسباب الإيقاف {resolution_note}.",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على رفع الإيقاف (الحظر) المفروض على منشأتنا، بما يمكّن الشركة من مواصلة أعمالها وإنجاز معاملاتها لدى الجهات الحكومية، والوفاء بالتزاماتها تجاه موظفيها.",
      CLOSING_COMMIT_GENERIC,
    ],
    fields: [
      { key: "block_reason", group: "Details", groupAr: "التفاصيل", labelEn: "Reason of Block (Arabic)", labelAr: "سبب الإيقاف", type: "text", required: true, placeholderAr: "تأخر سداد الاشتراكات", placeholderEn: "تأخر سداد الاشتراكات" },
      { key: "resolution_note", group: "Details", groupAr: "التفاصيل", labelEn: "How it was resolved (Arabic)", labelAr: "ما تم اتخاذه للمعالجة", type: "textarea", required: true, placeholderAr: "بسداد كامل المبلغ المستحق بتاريخه", placeholderEn: "بسداد كامل المبلغ المستحق بتاريخه" },
    ],
  },
  {
    id: "clearance",
    titleAr: "طلب براءة ذمة",
    titleEn: "Clearance Certificate Request",
    descAr: "إصدار شهادة براءة ذمة للمنشأة",
    descEn: "Issue a clearance certificate",
    subjectAr: "طلب إصدار شهادة براءة ذمة",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة قامت بسداد كافة المستحقات المترتبة عليها لديكم، وذلك لغرض {clearance_purpose}.",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على إصدار شهادة براءة ذمة للمنشأة.",
      CLOSING_COMMIT_GENERIC,
    ],
    fields: [
      { key: "clearance_purpose", group: "Details", groupAr: "التفاصيل", labelEn: "Purpose (Arabic)", labelAr: "الغرض من الشهادة", type: "text", required: true, placeholderAr: "استكمال إجراءات التخارج / تجديد السجل", placeholderEn: "استكمال إجراءات التخارج / تجديد السجل" },
    ],
  },
  {
    id: "extension",
    titleAr: "طلب تمديد مهلة",
    titleEn: "Deadline Extension Request",
    descAr: "تمديد مهلة لتوفيق الأوضاع أو استكمال متطلبات",
    descEn: "Extend a compliance/administrative deadline",
    subjectAr: "طلب تمديد مهلة {extension_subject}",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة تعمل حاليًا على {current_efforts}، ونلتمس من عنايتكم الكريمة التفضل بالموافقة على تمديد المهلة الممنوحة للشركة بشأن {extension_subject} حتى تاريخ {new_deadline}.",
      "ونتعهد باستكمال كافة المتطلبات خلال المهلة المطلوبة والالتزام الكامل بالأنظمة المقررة.",
    ],
    fields: [
      { key: "extension_subject", group: "Details", groupAr: "التفاصيل", labelEn: "Subject of Extension (Arabic)", labelAr: "موضوع التمديد", type: "text", required: true, placeholderAr: "توفيق أوضاع نسبة التعمين", placeholderEn: "توفيق أوضاع نسبة التعمين" },
      { key: "current_efforts", group: "Details", groupAr: "التفاصيل", labelEn: "Current Efforts (Arabic)", labelAr: "الجهود الجارية", type: "textarea", required: true, placeholderAr: "استكمال إجراءات استقطاب كوادر وطنية مؤهلة", placeholderEn: "استكمال إجراءات استقطاب كوادر وطنية مؤهلة" },
      { key: "new_deadline", group: "Details", groupAr: "التفاصيل", labelEn: "Requested Deadline", labelAr: "التاريخ المطلوب", type: "text", required: true, placeholderEn: "31 / 12 / 2026م" },
    ],
  },
  {
    id: "objection",
    titleAr: "تظلم / اعتراض",
    titleEn: "Objection / Grievance",
    descAr: "اعتراض على قرار صادر بحق المنشأة",
    descEn: "Object to a decision issued against the establishment",
    subjectAr: "تظلم من القرار رقم ({decision_ref})",
    bodyAr: [
      OPENING,
      "ونفيدكم بأنه صدر بحق منشأتنا القرار رقم ({decision_ref}) بتاريخ {decision_date} والمتضمن {decision_summary}.",
      "وحيث إن {objection_grounds}، فإننا نلتمس من عنايتكم الكريمة التفضل بإعادة النظر في القرار المشار إليه، ومرفق لكم المستندات المؤيدة لطلبنا.",
      CLOSING_COMMIT_GENERIC,
    ],
    fields: [
      { key: "decision_ref", group: "Decision", groupAr: "القرار", labelEn: "Decision Ref. No.", labelAr: "رقم القرار", type: "text", required: true },
      { key: "decision_date", group: "Decision", groupAr: "القرار", labelEn: "Decision Date", labelAr: "تاريخ القرار", type: "text", required: true, placeholderEn: "15 / 07 / 2026م" },
      { key: "decision_summary", group: "Decision", groupAr: "القرار", labelEn: "Decision Summary (Arabic)", labelAr: "ملخص القرار", type: "textarea", required: true },
      { key: "objection_grounds", group: "Decision", groupAr: "القرار", labelEn: "Grounds of Objection (Arabic)", labelAr: "أسباب التظلم", type: "textarea", required: true },
    ],
  },
  {
    id: "noc",
    titleAr: "طلب عدم ممانعة",
    titleEn: "No-Objection Request",
    descAr: "إصدار خطاب عدم ممانعة بشأن معاملة محددة",
    descEn: "Request a no-objection letter for a specific matter",
    subjectAr: "طلب إصدار خطاب عدم ممانعة",
    bodyAr: [
      OPENING,
      "نلتمس من عنايتكم الكريمة التفضل بالموافقة على إصدار خطاب عدم ممانعة بشأن {noc_matter}.",
      CLOSING_COMMIT_GENERIC,
    ],
    fields: [
      { key: "noc_matter", group: "Details", groupAr: "التفاصيل", labelEn: "Matter (Arabic)", labelAr: "موضوع عدم الممانعة", type: "textarea", required: true },
    ],
  },
  {
    id: "custom",
    titleAr: "خطاب حر (وصف الطلب)",
    titleEn: "Custom Letter (describe it)",
    descAr: "اكتب موضوع الخطاب وسطرًا أو سطرين عن الطلب",
    descEn: "Write the subject and 1–2 lines describing the request",
    subjectAr: "{custom_subject}",
    bodyAr: [
      OPENING,
      "{custom_body}",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على طلبنا المشار إليه أعلاه.",
      CLOSING_COMMIT_GENERIC,
    ],
    fields: [
      { key: "custom_subject", group: "Details", groupAr: "التفاصيل", labelEn: "Subject (Arabic)", labelAr: "موضوع الخطاب", type: "text", required: true },
      { key: "custom_body", group: "Details", groupAr: "التفاصيل", labelEn: "Request Description (Arabic)", labelAr: "وصف الطلب", type: "textarea", required: true, helperAr: "سطر أو سطران — سيُصاغ ضمن الهيكل الرسمي", helperEn: "1–2 lines — merged into the formal skeleton" },
    ],
  },
];

export const getLetterType = (id: string): MinistryLetterType | undefined =>
  LETTER_TYPES.find((t) => t.id === id);
