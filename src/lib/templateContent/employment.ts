// =============================================================
// Employment Contract — Bilingual, Oman Labour Law Compliant
// Authority: Royal Decree 35/2003 (Oman Labour Law) and amendments.
//
// This template captures the standard structure used in Oman
// employment contracts: parties, role, probation, hours,
// compensation broken down into basic + housing + transport +
// other allowances, leave entitlements, end-of-service gratuity,
// notice, confidentiality, governing law, and signatures.
//
// Customers fill ~20 fields once; the engine generates a fully
// formed bilingual .docx that's ready to print and sign.
// =============================================================

import type { TemplateContent } from "./types";

export const EMPLOYMENT_CONTENT: TemplateContent = {
  id: "employment",
  subtitleEn: "Oman Labour Law (Royal Decree 35/2003) Compliant",
  subtitleAr: "متوافق مع قانون العمل العماني (المرسوم السلطاني 35/2003)",

  // ── FIELDS ────────────────────────────────────────────────────
  fields: [
    // — Employer details
    { key: "company_name", group: "Employer", groupAr: "صاحب العمل",
      labelEn: "Company Name", labelAr: "اسم الشركة",
      type: "text", required: true,
      placeholderEn: "Acme Trading LLC", placeholderAr: "شركة أكمي للتجارة ش.م.م" },
    { key: "company_cr", group: "Employer", groupAr: "صاحب العمل",
      labelEn: "Commercial Registration No.", labelAr: "رقم السجل التجاري",
      type: "text", required: true,
      placeholderEn: "1234567" },
    { key: "company_address", group: "Employer", groupAr: "صاحب العمل",
      labelEn: "Company Address", labelAr: "عنوان الشركة",
      type: "textarea", required: true,
      placeholderEn: "Building 123, Way 5678, Al Khuwair, Muscat, Sultanate of Oman" },

    // — Employee details
    { key: "employee_name", group: "Employee", groupAr: "الموظف",
      labelEn: "Employee Full Name", labelAr: "الاسم الكامل للموظف",
      type: "text", required: true,
      placeholderEn: "Mohammed Ahmed Al-Balushi" },
    { key: "employee_nationality", group: "Employee", groupAr: "الموظف",
      labelEn: "Nationality", labelAr: "الجنسية",
      type: "text", required: true, placeholderEn: "Omani" },
    { key: "employee_id", group: "Employee", groupAr: "الموظف",
      labelEn: "Civil ID / Passport No.", labelAr: "رقم البطاقة الشخصية / جواز السفر",
      type: "text", required: true },
    { key: "employee_address", group: "Employee", groupAr: "الموظف",
      labelEn: "Employee Address", labelAr: "عنوان الموظف",
      type: "textarea", required: true },

    // — Role
    { key: "job_title", group: "Role", groupAr: "المنصب",
      labelEn: "Job Title", labelAr: "المسمى الوظيفي",
      type: "text", required: true, placeholderEn: "Senior Accountant" },
    { key: "department", group: "Role", groupAr: "المنصب",
      labelEn: "Department", labelAr: "القسم",
      type: "text", required: false, placeholderEn: "Finance" },
    { key: "start_date", group: "Role", groupAr: "المنصب",
      labelEn: "Commencement Date", labelAr: "تاريخ بدء العمل",
      type: "date", required: true },
    { key: "contract_type", group: "Role", groupAr: "المنصب",
      labelEn: "Contract Type", labelAr: "نوع العقد",
      type: "select", required: true,
      defaultValue: "unlimited",
      options: [
        { value: "unlimited", labelEn: "Unlimited (open-ended)", labelAr: "غير محدد المدة" },
        { value: "limited",   labelEn: "Limited (fixed-term)",   labelAr: "محدد المدة" },
      ],
      helperEn: "Per Article 23 of the Labour Law", helperAr: "وفقاً للمادة 23 من قانون العمل" },

    // — Probation
    { key: "probation_months", group: "Probation", groupAr: "فترة التجربة",
      labelEn: "Probation Period", labelAr: "فترة التجربة",
      type: "select", required: true, defaultValue: "3",
      options: [
        { value: "1", labelEn: "1 month",  labelAr: "شهر واحد" },
        { value: "2", labelEn: "2 months", labelAr: "شهران" },
        { value: "3", labelEn: "3 months (maximum)", labelAr: "ثلاثة أشهر (الحد الأقصى)" },
      ],
      helperEn: "Maximum 3 months per Article 23 of the Labour Law",
      helperAr: "الحد الأقصى 3 أشهر وفقاً للمادة 23 من قانون العمل" },

    // — Hours
    { key: "hours_per_week", group: "Working Hours", groupAr: "ساعات العمل",
      labelEn: "Working Hours per Week", labelAr: "ساعات العمل في الأسبوع",
      type: "select", required: true, defaultValue: "45",
      options: [
        { value: "40", labelEn: "40 hours / 5 days", labelAr: "40 ساعة / 5 أيام" },
        { value: "45", labelEn: "45 hours / 6 days", labelAr: "45 ساعة / 6 أيام" },
        { value: "48", labelEn: "48 hours / 6 days (statutory max)", labelAr: "48 ساعة / 6 أيام (الحد الأقصى القانوني)" },
      ],
      helperEn: "Article 68: max 48 hours/week, 8 hours/day",
      helperAr: "المادة 68: حد أقصى 48 ساعة/أسبوع، 8 ساعات/يوم" },
    { key: "weekly_off_days", group: "Working Hours", groupAr: "ساعات العمل",
      labelEn: "Weekly Off Day(s)", labelAr: "يوم/أيام الراحة الأسبوعية",
      type: "select", required: true, defaultValue: "fri_sat",
      options: [
        { value: "fri",     labelEn: "Friday only",       labelAr: "الجمعة فقط" },
        { value: "fri_sat", labelEn: "Friday + Saturday", labelAr: "الجمعة + السبت" },
      ] },

    // — Compensation (OMR)
    { key: "basic_salary", group: "Compensation", groupAr: "الأجر",
      labelEn: "Basic Salary (OMR)", labelAr: "الراتب الأساسي (ر.ع)",
      type: "currency-omr", required: true, placeholderEn: "500.000" },
    { key: "housing_allowance", group: "Compensation", groupAr: "الأجر",
      labelEn: "Housing Allowance (OMR)", labelAr: "بدل السكن (ر.ع)",
      type: "currency-omr", required: false, defaultValue: "0.000" },
    { key: "transport_allowance", group: "Compensation", groupAr: "الأجر",
      labelEn: "Transport Allowance (OMR)", labelAr: "بدل المواصلات (ر.ع)",
      type: "currency-omr", required: false, defaultValue: "0.000" },
    { key: "other_allowances", group: "Compensation", groupAr: "الأجر",
      labelEn: "Other Allowances (OMR)", labelAr: "بدلات أخرى (ر.ع)",
      type: "currency-omr", required: false, defaultValue: "0.000" },

    // — Notice
    { key: "notice_days", group: "Termination", groupAr: "الإنهاء",
      labelEn: "Notice Period (days)", labelAr: "فترة الإشعار (يوم)",
      type: "select", required: true, defaultValue: "30",
      options: [
        { value: "30", labelEn: "30 days (statutory minimum)", labelAr: "30 يوم (الحد الأدنى القانوني)" },
        { value: "60", labelEn: "60 days", labelAr: "60 يوم" },
        { value: "90", labelEn: "90 days", labelAr: "90 يوم" },
      ],
      helperEn: "Article 39 — minimum 30 days written notice",
      helperAr: "المادة 39 — حد أدنى 30 يوماً إشعار خطي" },

    // — Signatories
    { key: "company_signatory", group: "Signatures", groupAr: "التوقيعات",
      labelEn: "Company Signatory Name", labelAr: "اسم ممثل الشركة الموقّع",
      type: "text", required: true },
    { key: "company_signatory_title", group: "Signatures", groupAr: "التوقيعات",
      labelEn: "Company Signatory Title", labelAr: "منصب ممثل الشركة",
      type: "text", required: true, placeholderEn: "General Manager" },
  ],

  // ── CLAUSES (full bilingual contract text) ─────────────────────
  clauses: [
    {
      headingEn: "1. Parties to the Agreement",
      headingAr: "1. أطراف الاتفاقية",
      paragraphsEn: [
        "This Employment Contract (the \"Contract\") is entered into between {company_name}, holder of Commercial Registration No. {company_cr}, with registered address at {company_address} (hereinafter referred to as the \"Employer\"), and {employee_name}, a {employee_nationality} national holding Civil ID / Passport No. {employee_id}, residing at {employee_address} (hereinafter referred to as the \"Employee\").",
        "Both parties have full legal capacity to enter into this Contract and accept its terms.",
      ],
      paragraphsAr: [
        "تم إبرام عقد العمل هذا (\"العقد\") بين {company_name}، صاحبة السجل التجاري رقم {company_cr}، ومقرها المسجل في {company_address} (يُشار إليها فيما بعد بـ\"صاحب العمل\")، و{employee_name}، {employee_nationality} الجنسية، حامل/حاملة بطاقة الهوية / جواز السفر رقم {employee_id}، المقيم/المقيمة في {employee_address} (يُشار إليه/إليها فيما بعد بـ\"الموظف\").",
        "يقر الطرفان بأهليتهما القانونية الكاملة لإبرام هذا العقد وقبول شروطه.",
      ],
    },
    {
      headingEn: "2. Position and Duties",
      headingAr: "2. المنصب والمهام",
      paragraphsEn: [
        "The Employer hereby engages the Employee in the position of {job_title} within the {department} department. The Employee accepts this appointment and agrees to perform the duties associated with this role diligently and in accordance with the Employer's reasonable instructions.",
        "The Employee shall devote their full working time, attention, and abilities to the duties of the position and shall not engage in any other paid employment without the prior written consent of the Employer.",
      ],
      paragraphsAr: [
        "يعيّن صاحب العمل بموجب هذا الموظف في منصب {job_title} ضمن قسم {department}. يقبل الموظف هذا التعيين ويوافق على أداء المهام المرتبطة بهذا المنصب باجتهاد ووفقاً للتعليمات المعقولة الصادرة عن صاحب العمل.",
        "يلتزم الموظف بتكريس وقت عمله الكامل واهتمامه وقدراته لمهام المنصب، ولا يجوز له العمل في أي وظيفة أخرى بأجر دون الحصول على موافقة خطية مسبقة من صاحب العمل.",
      ],
    },
    {
      headingEn: "3. Commencement Date and Contract Type",
      headingAr: "3. تاريخ البدء ونوع العقد",
      paragraphsEn: [
        "This Contract shall commence on {start_date} and shall be a {contract_type} contract in accordance with Article 23 of the Oman Labour Law (Royal Decree 35/2003).",
      ],
      paragraphsAr: [
        "يبدأ هذا العقد في {start_date} ويكون عقداً {contract_type} وفقاً للمادة 23 من قانون العمل العماني (المرسوم السلطاني 35/2003).",
      ],
    },
    {
      headingEn: "4. Probationary Period",
      headingAr: "4. فترة التجربة",
      paragraphsEn: [
        "The Employee shall serve a probationary period of {probation_months} month(s) commencing from the start date. During this period, either party may terminate this Contract by giving seven (7) days' written notice without obligation to pay end-of-service gratuity, in accordance with Article 23 of the Labour Law. The probationary period may not be extended.",
      ],
      paragraphsAr: [
        "يخضع الموظف لفترة تجربة مدتها {probation_months} شهر(أشهر) تبدأ من تاريخ مباشرة العمل. خلال هذه الفترة، يحق لأي من الطرفين إنهاء العقد بموجب إشعار خطي مدته سبعة (7) أيام دون الالتزام بدفع مكافأة نهاية الخدمة، وفقاً للمادة 23 من قانون العمل. لا يجوز تمديد فترة التجربة.",
      ],
    },
    {
      headingEn: "5. Working Hours and Weekly Rest",
      headingAr: "5. ساعات العمل والراحة الأسبوعية",
      paragraphsEn: [
        "The Employee's working hours shall be {hours_per_week} hours per week, distributed in accordance with the Employer's schedule and not exceeding eight (8) hours per day, in compliance with Article 68 of the Labour Law.",
        "The Employee shall be entitled to weekly rest on {weekly_off_days}. During the holy month of Ramadan, working hours for Muslim employees shall be reduced to six (6) hours per day in accordance with Article 71 of the Labour Law.",
      ],
      paragraphsAr: [
        "تكون ساعات عمل الموظف {hours_per_week} ساعة في الأسبوع، موزعة وفقاً لجدول صاحب العمل وبما لا يتجاوز ثماني (8) ساعات يومياً، التزاماً بالمادة 68 من قانون العمل.",
        "يستحق الموظف الراحة الأسبوعية في {weekly_off_days}. خلال شهر رمضان المبارك، تُخفّض ساعات العمل للموظفين المسلمين إلى ست (6) ساعات يومياً وفقاً للمادة 71 من قانون العمل.",
      ],
    },
    {
      headingEn: "6. Compensation and Allowances",
      headingAr: "6. الأجر والبدلات",
      paragraphsEn: [
        "The Employer shall pay the Employee a monthly gross salary comprised of the following components, payable in Omani Rials (OMR):",
        "  • Basic Salary: {basic_salary} OMR",
        "  • Housing Allowance: {housing_allowance} OMR",
        "  • Transport Allowance: {transport_allowance} OMR",
        "  • Other Allowances: {other_allowances} OMR",
        "Salary shall be paid by bank transfer no later than the seventh (7th) day of the following calendar month in compliance with the Wage Protection System (WPS) requirements of the Ministry of Labour.",
      ],
      paragraphsAr: [
        "يدفع صاحب العمل للموظف راتباً شهرياً إجمالياً يتكون من العناصر التالية، يُسدد بالريال العماني:",
        "  • الراتب الأساسي: {basic_salary} ر.ع",
        "  • بدل السكن: {housing_allowance} ر.ع",
        "  • بدل المواصلات: {transport_allowance} ر.ع",
        "  • بدلات أخرى: {other_allowances} ر.ع",
        "يُسدد الراتب عن طريق التحويل البنكي في موعد أقصاه اليوم السابع (7) من الشهر الميلادي التالي، التزاماً بمتطلبات نظام حماية الأجور (WPS) الصادر عن وزارة العمل.",
      ],
    },
    {
      headingEn: "7. Annual Leave",
      headingAr: "7. الإجازة السنوية",
      paragraphsEn: [
        "The Employee shall be entitled to thirty (30) calendar days of paid annual leave per completed year of service, in accordance with Article 61 of the Labour Law. Annual leave shall accrue after six (6) months of continuous service.",
        "Leave dates shall be scheduled by mutual agreement, with due regard to the operational requirements of the Employer.",
      ],
      paragraphsAr: [
        "يستحق الموظف ثلاثين (30) يوماً تقويمياً من الإجازة السنوية المدفوعة عن كل سنة خدمة كاملة، وفقاً للمادة 61 من قانون العمل. تبدأ الإجازة السنوية في الاستحقاق بعد ستة (6) أشهر من الخدمة المتواصلة.",
        "يتم تحديد مواعيد الإجازة بالاتفاق المتبادل مع مراعاة المتطلبات التشغيلية لصاحب العمل.",
      ],
    },
    {
      headingEn: "8. Sick Leave",
      headingAr: "8. الإجازة المرضية",
      paragraphsEn: [
        "The Employee shall be entitled to sick leave per Article 63 of the Labour Law on the following scale: ten (10) weeks per year, of which the first two weeks are at full pay, the third and fourth weeks at three-quarters pay, the fifth and sixth weeks at half pay, and the remainder unpaid. Sick leave must be supported by a medical certificate from a licensed practitioner.",
      ],
      paragraphsAr: [
        "يستحق الموظف إجازة مرضية وفقاً للمادة 63 من قانون العمل وفق المقياس التالي: عشرة (10) أسابيع سنوياً، منها الأسبوعان الأولان بأجر كامل، والأسبوعان الثالث والرابع بثلاثة أرباع الأجر، والأسبوعان الخامس والسادس بنصف الأجر، والباقي بدون أجر. يجب أن تكون الإجازة المرضية مدعومة بشهادة طبية من ممارس مرخّص.",
      ],
    },
    {
      headingEn: "9. Overtime",
      headingAr: "9. العمل الإضافي",
      paragraphsEn: [
        "Any work performed beyond the agreed working hours shall be compensated at the rate of one and one-quarter (1.25) times the ordinary hourly rate. Work performed on weekly rest days or public holidays shall be compensated at one and one-half (1.5) times the ordinary hourly rate, in accordance with Articles 69 and 70 of the Labour Law.",
      ],
      paragraphsAr: [
        "يُعوّض أي عمل يؤديه الموظف خارج ساعات العمل المتفق عليها بمعدل واحد وربع (1.25) ضعف الأجر الساعي العادي. ويُعوّض العمل المؤدى في أيام الراحة الأسبوعية أو العطلات الرسمية بمعدل واحد ونصف (1.5) ضعف الأجر الساعي العادي، وفقاً للمادتين 69 و70 من قانون العمل.",
      ],
    },
    {
      headingEn: "10. End-of-Service Gratuity",
      headingAr: "10. مكافأة نهاية الخدمة",
      paragraphsEn: [
        "Upon termination of employment by either party (other than dismissal for reasons specified in Article 40 of the Labour Law), the Employee shall be entitled to end-of-service gratuity calculated as follows: fifteen (15) days' basic salary for each of the first three (3) years of continuous service, and one (1) month's basic salary for each subsequent year, pro-rated for partial years, in accordance with Article 39 of the Labour Law.",
      ],
      paragraphsAr: [
        "عند انتهاء العمل من قبل أي من الطرفين (عدا الفصل للأسباب المنصوص عليها في المادة 40 من قانون العمل)، يستحق الموظف مكافأة نهاية الخدمة محتسبة كالتالي: خمسة عشر (15) يوماً من الراتب الأساسي عن كل سنة من السنوات الثلاث (3) الأولى من الخدمة المتواصلة، وشهر (1) من الراتب الأساسي عن كل سنة لاحقة، مع احتساب نسبي للسنوات الجزئية، وفقاً للمادة 39 من قانون العمل.",
      ],
    },
    {
      headingEn: "11. Termination and Notice Period",
      headingAr: "11. الإنهاء وفترة الإشعار",
      paragraphsEn: [
        "After the probationary period, either party may terminate this Contract by providing the other party with {notice_days} days' prior written notice. Either party may waive the notice period subject to payment of compensation equivalent to the salary for the notice period.",
        "Termination without notice shall only be permitted in the circumstances set out in Articles 40 and 41 of the Labour Law.",
      ],
      paragraphsAr: [
        "بعد فترة التجربة، يحق لأي من الطرفين إنهاء هذا العقد بتقديم إشعار خطي مسبق مدته {notice_days} يوماً للطرف الآخر. ويجوز لأي طرف التنازل عن فترة الإشعار مقابل دفع تعويض يعادل الراتب عن فترة الإشعار.",
        "لا يُسمح بالإنهاء دون إشعار إلا في الحالات المنصوص عليها في المادتين 40 و41 من قانون العمل.",
      ],
    },
    {
      headingEn: "12. Confidentiality",
      headingAr: "12. السرية",
      paragraphsEn: [
        "The Employee shall maintain strict confidentiality regarding all trade secrets, client information, financial data, and other proprietary information of the Employer, both during employment and for a period of two (2) years following termination, in accordance with Article 44 of the Labour Law.",
      ],
      paragraphsAr: [
        "يلتزم الموظف بالحفاظ على السرية التامة لجميع الأسرار التجارية ومعلومات العملاء والبيانات المالية وغيرها من المعلومات المملوكة لصاحب العمل، سواء خلال فترة العمل أو لمدة سنتين (2) بعد انتهائها، وفقاً للمادة 44 من قانون العمل.",
      ],
    },
    {
      headingEn: "13. Governing Law and Disputes",
      headingAr: "13. القانون الحاكم والنزاعات",
      paragraphsEn: [
        "This Contract shall be governed by the laws of the Sultanate of Oman, in particular the Oman Labour Law (Royal Decree 35/2003) and its amendments. Any dispute arising from or in connection with this Contract shall be referred to the competent Omani courts.",
      ],
      paragraphsAr: [
        "يخضع هذا العقد لقوانين سلطنة عُمان، وعلى وجه الخصوص قانون العمل العماني (المرسوم السلطاني 35/2003) وتعديلاته. يُحال أي نزاع ينشأ عن هذا العقد أو يتعلق به إلى المحاكم العمانية المختصة.",
      ],
    },
    {
      headingEn: "14. Signatures",
      headingAr: "14. التوقيعات",
      paragraphsEn: [
        "This Contract has been executed in two original bilingual copies, each party retaining one copy. In case of any discrepancy between the Arabic and English versions, the Arabic version shall prevail.",
        " ",
        "FOR THE EMPLOYER",
        "Name: {company_signatory}",
        "Title: {company_signatory_title}",
        "Signature: _________________________   Date: _________________",
        " ",
        "EMPLOYEE",
        "Name: {employee_name}",
        "Signature: _________________________   Date: _________________",
      ],
      paragraphsAr: [
        "تم تحرير هذا العقد من نسختين أصليتين ثنائيتي اللغة، يحتفظ كل طرف بنسخة. في حال وجود أي تعارض بين النسختين العربية والإنجليزية، تكون النسخة العربية هي السائدة.",
        " ",
        "عن صاحب العمل",
        "الاسم: {company_signatory}",
        "المنصب: {company_signatory_title}",
        "التوقيع: _________________________   التاريخ: _________________",
        " ",
        "الموظف",
        "الاسم: {employee_name}",
        "التوقيع: _________________________   التاريخ: _________________",
      ],
    },
  ],
};
