// =============================================================
// ROP NOC Letter — Bilingual, Oman
// Addressed to: Royal Oman Police (شرطة عُمان السلطانية)
//
// A No Objection Certificate (NOC) is a formal letter from a
// sponsor, employer, or landlord confirming they raise no
// objection to a named individual undertaking a specific
// purpose — most commonly used when dealing with ROP for:
//   • Driving licence application / renewal
//   • Vehicle registration transfer or export
//   • Visa / residency permit matters
//   • Travel clearance
//   • Second-job / freelance permit
//   • Address registration (for expats)
//
// The letter is short and direct. Clauses map to letter sections
// rather than legal articles. Bilingual side-by-side layout.
//
// 14 fields across 4 steps · 6 letter sections
// =============================================================

import type { TemplateContent } from "./types";

export const NOC_ROP_CONTENT: TemplateContent = {
  id: "noc-rop",
  subtitleEn: "No Objection Certificate — Royal Oman Police",
  subtitleAr: "شهادة عدم ممانعة — شرطة عُمان السلطانية",

  fields: [
    // — Issuing Party
    {
      key: "issuer_name",
      group: "Issuing Party",
      groupAr: "جهة الإصدار",
      labelEn: "Company / Individual Name (Issuing the NOC)",
      labelAr: "اسم الشركة / الفرد (مُصدِر الشهادة)",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Gulf Trading LLC",
      placeholderAr: "شركة الخليج للتجارة ش.م.م",
    },
    {
      key: "issuer_cr",
      group: "Issuing Party",
      groupAr: "جهة الإصدار",
      labelEn: "Commercial Registration / Civil ID No.",
      labelAr: "رقم السجل التجاري / الهوية الشخصية",
      type: "text",
      required: true,
      placeholderEn: "1234567",
    },
    {
      key: "issuer_address",
      group: "Issuing Party",
      groupAr: "جهة الإصدار",
      labelEn: "Address",
      labelAr: "العنوان",
      type: "textarea",
      required: true,
      bilingual: true,
      placeholderEn: "P.O. Box 456, Al Khuwair, Muscat, Sultanate of Oman",
      placeholderAr: "ص.ب 456، الخوير، مسقط، سلطنة عُمان",
    },
    {
      key: "issuer_phone",
      group: "Issuing Party",
      groupAr: "جهة الإصدار",
      labelEn: "Phone / Fax",
      labelAr: "الهاتف / الفاكس",
      type: "phone",
      required: true,
      placeholderEn: "+968 2X XXX XXX",
    },
    {
      key: "issuer_email",
      group: "Issuing Party",
      groupAr: "جهة الإصدار",
      labelEn: "Email Address",
      labelAr: "البريد الإلكتروني",
      type: "email",
      required: false,
      placeholderEn: "info@company.com",
    },

    // — Signatory
    {
      key: "signatory_name",
      group: "Signatory",
      groupAr: "المفوّض بالتوقيع",
      labelEn: "Signatory Full Name",
      labelAr: "الاسم الكامل للمفوّض بالتوقيع",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Saif Mohammed Al-Rashdi",
      placeholderAr: "سيف محمد الراشدي",
    },
    {
      key: "signatory_title",
      group: "Signatory",
      groupAr: "المفوّض بالتوقيع",
      labelEn: "Signatory Title / Position",
      labelAr: "منصب المفوّض",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "General Manager",
      placeholderAr: "مدير عام",
    },
    {
      key: "letter_date",
      group: "Signatory",
      groupAr: "المفوّض بالتوقيع",
      labelEn: "Letter Date",
      labelAr: "تاريخ الخطاب",
      type: "date",
      required: true,
    },

    // — Subject Person
    {
      key: "subject_name",
      group: "Subject Person",
      groupAr: "الشخص المعني",
      labelEn: "Subject Person Full Name",
      labelAr: "الاسم الكامل للشخص المعني",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Ahmed Yusuf Al-Harthi",
      placeholderAr: "أحمد يوسف الحارثي",
    },
    {
      key: "subject_nationality",
      group: "Subject Person",
      groupAr: "الشخص المعني",
      labelEn: "Nationality",
      labelAr: "الجنسية",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Omani",
      placeholderAr: "عُماني",
    },
    {
      key: "subject_id",
      group: "Subject Person",
      groupAr: "الشخص المعني",
      labelEn: "Civil ID / Passport / Residence Card No.",
      labelAr: "رقم الهوية / جواز السفر / بطاقة الإقامة",
      type: "text",
      required: true,
    },
    {
      key: "subject_relationship",
      group: "Subject Person",
      groupAr: "الشخص المعني",
      labelEn: "Relationship to Issuer",
      labelAr: "صلة الشخص المعني بجهة الإصدار",
      type: "select",
      required: true,
      defaultValue: "employee",
      options: [
        { value: "employee",       labelEn: "Employee",             labelAr: "موظف" },
        { value: "dependent",      labelEn: "Sponsored dependent",  labelAr: "معال مكفول" },
        { value: "tenant",         labelEn: "Tenant",               labelAr: "مستأجر" },
        { value: "business_owner", labelEn: "Business owner / shareholder", labelAr: "صاحب عمل / مساهم" },
        { value: "individual",     labelEn: "Individual (self-issued)", labelAr: "فرد (يُصدرها لنفسه)" },
      ],
    },

    // — NOC Purpose
    {
      key: "noc_purpose",
      group: "NOC Purpose",
      groupAr: "الغرض من الشهادة",
      labelEn: "Purpose of NOC",
      labelAr: "الغرض من شهادة عدم الممانعة",
      type: "select",
      required: true,
      defaultValue: "driving_license",
      options: [
        {
          value: "driving_license",
          labelEn: "Driving licence application or renewal",
          labelAr: "تقديم طلب رخصة قيادة أو تجديدها",
        },
        {
          value: "vehicle_transfer",
          labelEn: "Vehicle registration transfer or change of ownership",
          labelAr: "نقل تسجيل المركبة أو تغيير ملكيتها",
        },
        {
          value: "vehicle_export",
          labelEn: "Vehicle export out of Oman",
          labelAr: "تصدير المركبة خارج سلطنة عُمان",
        },
        {
          value: "visa_renewal",
          labelEn: "Residence visa renewal or transfer of sponsorship",
          labelAr: "تجديد تأشيرة الإقامة أو نقل الكفالة",
        },
        {
          value: "travel_clearance",
          labelEn: "Travel clearance / exit permit",
          labelAr: "تصريح السفر / تصريح الخروج",
        },
        {
          value: "second_job",
          labelEn: "Second employment or freelance permit",
          labelAr: "تصريح عمل إضافي أو عمل حر",
        },
        {
          value: "address_registration",
          labelEn: "Address / residency registration with ROP",
          labelAr: "تسجيل العنوان / الإقامة لدى الشرطة",
        },
        {
          value: "general",
          labelEn: "General purpose (specify in details below)",
          labelAr: "غرض عام (يُحدد في التفاصيل أدناه)",
        },
      ],
      helperEn: "Select the specific reason for presenting this NOC to ROP.",
      helperAr: "اختر السبب المحدد لتقديم شهادة عدم الممانعة إلى الشرطة.",
    },
    {
      key: "noc_details",
      group: "NOC Purpose",
      groupAr: "الغرض من الشهادة",
      labelEn: "Additional Details (optional)",
      labelAr: "تفاصيل إضافية (اختياري)",
      type: "textarea",
      required: false,
      placeholderEn:
        "e.g. Vehicle: Toyota Land Cruiser 2020, Plate No. A 12345; or any other specific details relevant to the request.",
      placeholderAr:
        "مثال: المركبة: تويوتا لاند كروزر 2020، لوحة رقم أ 12345؛ أو أي تفاصيل محددة ذات صلة بالطلب.",
    },
  ],

  clauses: [
    {
      headingEn: "Letterhead",
      headingAr: "ترويسة الخطاب",
      paragraphsEn: [
        "{issuer_name}",
        "CR / ID: {issuer_cr}",
        "{issuer_address}",
        "Tel: {issuer_phone}  |  Email: {issuer_email}",
        "Date: {letter_date}",
      ],
      paragraphsAr: [
        "{issuer_name}",
        "السجل التجاري / الهوية: {issuer_cr}",
        "{issuer_address}",
        "هاتف: {issuer_phone}  |  بريد إلكتروني: {issuer_email}",
        "التاريخ: {letter_date}",
      ],
    },
    {
      headingEn: "Addressee",
      headingAr: "المرسَل إليه",
      paragraphsEn: [
        "To:",
        "The Director General",
        "Royal Oman Police",
        "Sultanate of Oman",
        " ",
        "Dear Sir / Madam,",
      ],
      paragraphsAr: [
        "إلى:",
        "المدير العام",
        "شرطة عُمان السلطانية",
        "سلطنة عُمان",
        " ",
        "سعادة المدير / السيدة الفاضلة،",
      ],
    },
    {
      headingEn: "Subject",
      headingAr: "الموضوع",
      paragraphsEn: [
        "RE: No Objection Certificate for {subject_name} — {noc_purpose}",
      ],
      paragraphsAr: [
        "الموضوع: شهادة عدم ممانعة بشأن {subject_name} — {noc_purpose}",
      ],
    },
    {
      headingEn: "Body",
      headingAr: "نص الخطاب",
      paragraphsEn: [
        "We, {issuer_name} (CR / ID No. {issuer_cr}), hereby confirm that we have NO OBJECTION to {subject_name}, a {subject_nationality} national holding Civil ID / Passport / Residence Card No. {subject_id}, who is our {subject_relationship}, proceeding with the following: {noc_purpose}.",
        "{noc_details}",
        "We confirm that {subject_name} is in good standing with {issuer_name} and that there are no legal, financial, or administrative impediments on our part to the above request.",
        "We kindly request the competent authority at the Royal Oman Police to render the necessary assistance and process the abovementioned request accordingly.",
      ],
      paragraphsAr: [
        "نحن، {issuer_name} (رقم السجل التجاري / الهوية: {issuer_cr})، نُفيد بموجب هذا الخطاب بأنه لا مانع لدينا من قيام {subject_name}، {subject_nationality} الجنسية، حامل الهوية الشخصية / جواز السفر / بطاقة الإقامة رقم {subject_id}، والذي/والتي يعمل/تعمل لدينا بصفة {subject_relationship}، بالمضي في الإجراء التالي: {noc_purpose}.",
        "{noc_details}",
        "نُؤكد أن {subject_name} على علاقة طيبة مع {issuer_name} وأنه لا توجد أي موانع قانونية أو مالية أو إدارية من جهتنا تحول دون الموافقة على الطلب المذكور أعلاه.",
        "نأمل من الجهة المختصة في شرطة عُمان السلطانية تقديم المساعدة اللازمة ومعالجة الطلب المشار إليه وفقاً لذلك.",
      ],
    },
    {
      headingEn: "Validity Statement",
      headingAr: "نطاق الصلاحية",
      paragraphsEn: [
        "This No Objection Certificate is issued solely for the purpose stated above and shall not be construed as a waiver of any rights, obligations, or liabilities between the Issuing Party and the Subject Person under any existing agreement or applicable law.",
        "This certificate is valid for ninety (90) days from the date of issue, unless otherwise specified by the requesting authority.",
      ],
      paragraphsAr: [
        "تُصدَر شهادة عدم الممانعة هذه للغرض المذكور أعلاه حصراً، ولا يُفسَّر إصدارها على أنه تنازل عن أي حقوق أو التزامات أو مسؤوليات قائمة بين جهة الإصدار والشخص المعني بموجب أي اتفاقية قائمة أو القانون المعمول به.",
        "تكون هذه الشهادة سارية المفعول لمدة تسعين (90) يوماً من تاريخ إصدارها، ما لم تحدد الجهة الطالبة غير ذلك.",
      ],
    },
    {
      headingEn: "Signature Block",
      headingAr: "كتلة التوقيع",
      paragraphsEn: [
        "Yours faithfully,",
        " ",
        "Name:      {signatory_name}",
        "Title:     {signatory_title}",
        "On behalf: {issuer_name}",
        " ",
        "Signature: _________________________",
        " ",
        "Official Stamp / Seal:",
        " ",
        "___________________________________",
        "(Company Stamp)",
      ],
      paragraphsAr: [
        "وتفضلوا بقبول وافر الاحترام والتقدير،",
        " ",
        "الاسم:    {signatory_name}",
        "المنصب:   {signatory_title}",
        "نيابةً عن: {issuer_name}",
        " ",
        "التوقيع: _________________________",
        " ",
        "الختم الرسمي:",
        " ",
        "___________________________________",
        "(ختم الشركة)",
      ],
    },
  ],
};
