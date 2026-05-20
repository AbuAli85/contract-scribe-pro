// =============================================================
// Freelance Contract — Bilingual, Oman Law
// Authority: Civil Transactions Law (Royal Decree 29/2013)
//            Value Added Tax Law (Royal Decree 121/2020)
//            Labour Law (Royal Decree 35/2003) — confirming
//              this is NOT an employment relationship
//
// Used when a client engages an individual contractor / freelancer
// for a defined project. Covers scope, milestones, revisions,
// payment, IP ownership, independent contractor status, and
// confidentiality. Shorter and lighter than a full B2B service
// agreement — designed for solo practitioners.
//
// 18 fields across 5 steps · 12 clauses
// =============================================================

import type { TemplateContent } from "./types";

export const FREELANCE_CONTENT: TemplateContent = {
  id: "freelance",
  subtitleEn: "Freelance / Independent Contractor Agreement — Sultanate of Oman",
  subtitleAr: "عقد عمل حر / مقاول مستقل — سلطنة عُمان",

  fields: [
    // — Client
    {
      key: "client_name",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Full Legal Name",
      labelAr: "العميل — الاسم القانوني الكامل",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Oman Digital Media LLC",
      placeholderAr: "شركة عُمان للإعلام الرقمي ش.م.م",
    },
    {
      key: "client_cr",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — CR / Civil ID No.",
      labelAr: "العميل — رقم السجل التجاري / الهوية الشخصية",
      type: "text",
      required: true,
      placeholderEn: "1234567",
    },
    {
      key: "client_address",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Address",
      labelAr: "العميل — العنوان",
      type: "textarea",
      required: true,
      bilingual: true,
      placeholderEn: "Al Qurum Business Centre, Muscat, Sultanate of Oman",
      placeholderAr: "مركز القرم التجاري، مسقط، سلطنة عُمان",
    },
    {
      key: "client_rep",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Signatory Name",
      labelAr: "العميل — اسم المفوّض بالتوقيع",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Hamed Al-Rawahi",
      placeholderAr: "حامد الرواحي",
    },
    {
      key: "client_rep_title",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Signatory Title",
      labelAr: "العميل — منصب المفوّض",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Marketing Director",
      placeholderAr: "مدير التسويق",
    },

    // — Freelancer
    {
      key: "freelancer_name",
      group: "Freelancer",
      groupAr: "المستقل",
      labelEn: "Freelancer Full Name",
      labelAr: "الاسم الكامل للمستقل",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Layla Mohammed Al-Siyabi",
      placeholderAr: "ليلى محمد السيابي",
    },
    {
      key: "freelancer_id",
      group: "Freelancer",
      groupAr: "المستقل",
      labelEn: "Freelancer Civil ID / Passport No.",
      labelAr: "رقم الهوية / جواز السفر للمستقل",
      type: "text",
      required: true,
    },
    {
      key: "freelancer_address",
      group: "Freelancer",
      groupAr: "المستقل",
      labelEn: "Freelancer Address",
      labelAr: "عنوان المستقل",
      type: "textarea",
      required: true,
      bilingual: true,
      placeholderEn: "Al Seeb, Muscat, Sultanate of Oman",
      placeholderAr: "السيب، مسقط، سلطنة عُمان",
    },

    // — Project
    {
      key: "project_name",
      group: "Project",
      groupAr: "المشروع",
      labelEn: "Project Name / Title",
      labelAr: "اسم / عنوان المشروع",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Brand Identity Redesign 2026",
      placeholderAr: "إعادة تصميم الهوية البصرية 2026",
    },
    {
      key: "scope",
      group: "Project",
      groupAr: "المشروع",
      labelEn: "Scope of Work",
      labelAr: "نطاق العمل",
      type: "textarea",
      required: true,
      placeholderEn:
        "Design of new logo (3 concepts, up to 2 revision rounds), brand guidelines document, business card template, and letterhead template in both Arabic and English.",
      placeholderAr:
        "تصميم شعار جديد (3 مفاهيم، ما يصل إلى جولتَي مراجعة)، وثيقة دليل الهوية البصرية، قالب بطاقة العمل، وقالب ورق الخطابات باللغتين العربية والإنجليزية.",
    },
    {
      key: "start_date",
      group: "Project",
      groupAr: "المشروع",
      labelEn: "Project Start Date",
      labelAr: "تاريخ بدء المشروع",
      type: "date",
      required: true,
    },
    {
      key: "deadline",
      group: "Project",
      groupAr: "المشروع",
      labelEn: "Delivery Deadline",
      labelAr: "الموعد النهائي للتسليم",
      type: "date",
      required: true,
    },
    {
      key: "revision_rounds",
      group: "Project",
      groupAr: "المشروع",
      labelEn: "Included Revision Rounds",
      labelAr: "جولات المراجعة المشمولة",
      type: "select",
      required: true,
      defaultValue: "2",
      options: [
        { value: "1", labelEn: "1 round",  labelAr: "جولة واحدة" },
        { value: "2", labelEn: "2 rounds", labelAr: "جولتان" },
        { value: "3", labelEn: "3 rounds", labelAr: "3 جولات" },
        { value: "unlimited", labelEn: "Unlimited (within scope)", labelAr: "غير محدودة (ضمن النطاق)" },
      ],
      helperEn: "Additional revision rounds beyond this may incur extra fees.",
      helperAr: "جولات المراجعة الإضافية ما وراء هذا الحد قد تستلزم رسوماً إضافية.",
    },

    // — Fees
    {
      key: "total_fee",
      group: "Fees & Payment",
      groupAr: "الأتعاب والدفع",
      labelEn: "Total Project Fee (OMR, excl. VAT)",
      labelAr: "إجمالي أتعاب المشروع (ر.ع، غير شامل الضريبة)",
      type: "currency-omr",
      required: true,
      placeholderEn: "800.000",
    },
    {
      key: "payment_structure",
      group: "Fees & Payment",
      groupAr: "الأتعاب والدفع",
      labelEn: "Payment Structure",
      labelAr: "هيكل الدفع",
      type: "select",
      required: true,
      defaultValue: "split_50",
      options: [
        {
          value: "upfront",
          labelEn: "100% upfront before work begins",
          labelAr: "100% مقدماً قبل بدء العمل",
        },
        {
          value: "split_50",
          labelEn: "50% upfront · 50% on final delivery",
          labelAr: "50% مقدماً · 50% عند التسليم النهائي",
        },
        {
          value: "split_30_70",
          labelEn: "30% upfront · 70% on final delivery",
          labelAr: "30% مقدماً · 70% عند التسليم النهائي",
        },
        {
          value: "on_delivery",
          labelEn: "100% on final delivery and approval",
          labelAr: "100% عند التسليم النهائي والقبول",
        },
      ],
    },
    {
      key: "payment_terms_days",
      group: "Fees & Payment",
      groupAr: "الأتعاب والدفع",
      labelEn: "Invoice Payment Terms (days)",
      labelAr: "مهلة سداد الفاتورة (أيام)",
      type: "select",
      required: true,
      defaultValue: "7",
      options: [
        { value: "3",  labelEn: "3 days",  labelAr: "3 أيام" },
        { value: "7",  labelEn: "7 days",  labelAr: "7 أيام" },
        { value: "14", labelEn: "14 days", labelAr: "14 يوماً" },
        { value: "30", labelEn: "30 days", labelAr: "30 يوماً" },
      ],
    },

    // — IP
    {
      key: "ip_ownership",
      group: "IP & Rights",
      groupAr: "الملكية الفكرية والحقوق",
      labelEn: "Ownership of Final Deliverables",
      labelAr: "ملكية المخرجات النهائية",
      type: "select",
      required: true,
      defaultValue: "client_on_payment",
      options: [
        {
          value: "client_on_payment",
          labelEn: "Client owns all rights upon full payment",
          labelAr: "العميل يمتلك جميع الحقوق عند الدفع الكامل",
        },
        {
          value: "freelancer_licence",
          labelEn: "Freelancer retains copyright; grants Client exclusive licence",
          labelAr: "المستقل يحتفظ بحقوق النشر ويمنح العميل ترخيصاً حصرياً",
        },
        {
          value: "portfolio_right",
          labelEn: "Client owns rights; Freelancer may show in portfolio",
          labelAr: "العميل يمتلك الحقوق؛ يجوز للمستقل عرضها في معرض أعماله",
        },
      ],
      helperEn: "IP transfers only after full payment is received.",
      helperAr: "تنتقل الملكية الفكرية بعد استلام الدفع الكامل فقط.",
    },
  ],

  clauses: [
    {
      headingEn: "1. Parties",
      headingAr: "1. الأطراف",
      paragraphsEn: [
        "This Freelance Contract (\"Agreement\") is entered into between:",
        "{client_name} (CR / ID: {client_cr}), with address at {client_address}, represented by {client_rep} ({client_rep_title}) (\"Client\"); and",
        "{freelancer_name}, holder of Civil ID / Passport No. {freelancer_id}, with address at {freelancer_address} (\"Freelancer\").",
        "The Freelancer is an independent contractor and not an employee of the Client. This Agreement does not create an employment relationship under the Oman Labour Law (Royal Decree 35/2003).",
      ],
      paragraphsAr: [
        "تم إبرام عقد العمل الحر هذا (\"العقد\") بين:",
        "{client_name} (السجل التجاري / الهوية: {client_cr})، بعنوان {client_address}، ممثلة بـ{client_rep} ({client_rep_title}) (\"العميل\")؛ و",
        "{freelancer_name}، حامل الهوية الشخصية / جواز السفر رقم {freelancer_id}، بعنوان {freelancer_address} (\"المستقل\").",
        "المستقل مقاول مستقل وليس موظفاً لدى العميل. لا يُنشئ هذا العقد علاقة عمل بموجب قانون العمل العماني (المرسوم السلطاني 35/2003).",
      ],
    },
    {
      headingEn: "2. Project and Scope",
      headingAr: "2. المشروع ونطاق العمل",
      paragraphsEn: [
        "Project: {project_name}",
        "The Freelancer agrees to perform the following services (\"Services\"):",
        "{scope}",
        "Any work outside this scope constitutes a new engagement and must be agreed in a written amendment to this Agreement before additional work begins. Verbal approvals are not binding.",
      ],
      paragraphsAr: [
        "المشروع: {project_name}",
        "يوافق المستقل على تنفيذ الخدمات التالية (\"الخدمات\"):",
        "{scope}",
        "أي عمل خارج هذا النطاق يُعدّ ارتباطاً جديداً ويجب الاتفاق عليه في ملحق خطي لهذا العقد قبل بدء العمل الإضافي. الموافقات الشفهية غير ملزمة.",
      ],
    },
    {
      headingEn: "3. Timeline and Delivery",
      headingAr: "3. الجدول الزمني والتسليم",
      paragraphsEn: [
        "Work shall commence on {start_date}. Final deliverables shall be submitted by {deadline} (\"Deadline\").",
        "The Freelancer shall notify the Client promptly if any circumstance arises that may affect the Deadline. Time extensions must be agreed in writing.",
        "The Client agrees to provide necessary feedback, approvals, materials, and access within three (3) business days of any request by the Freelancer. Delays caused by the Client's failure to respond shall extend the Deadline accordingly.",
      ],
      paragraphsAr: [
        "يبدأ العمل في {start_date}. تُسلَّم المخرجات النهائية بحلول {deadline} (\"الموعد النهائي\").",
        "يُخطر المستقل العميل فوراً إذا نشأت أي ظروف قد تؤثر على الموعد النهائي. يجب الاتفاق على التمديدات الزمنية كتابياً.",
        "يلتزم العميل بتقديم التغذية الراجعة والموافقات والمواد والوصول اللازمة خلال ثلاثة (3) أيام عمل من أي طلب يُقدمه المستقل. تُمدَّد الآجال تلقائياً بمقدار التأخير الناجم عن عدم استجابة العميل.",
      ],
    },
    {
      headingEn: "4. Revisions",
      headingAr: "4. المراجعات",
      paragraphsEn: [
        "This Agreement includes {revision_rounds} round(s) of revisions at no additional charge.",
        "A \"revision\" means reasonable changes within the original scope that do not alter the fundamental direction of the work. A revision request shall be submitted in writing with consolidated feedback in a single communication.",
        "Additional revision rounds requested beyond the included number shall be charged at the Freelancer's standard hourly rate, to be agreed in writing before the work is undertaken.",
      ],
      paragraphsAr: [
        "يتضمن هذا العقد {revision_rounds} جولة(جولات) مراجعة دون رسوم إضافية.",
        "تعني \"المراجعة\" التغييرات المعقولة ضمن النطاق الأصلي التي لا تُغيّر الاتجاه الجوهري للعمل. يجب تقديم طلب المراجعة كتابياً بتغذية راجعة موحدة في مراسلة واحدة.",
        "جولات المراجعة الإضافية التي تتجاوز العدد المشمول تُحتسب بالسعر الساعي المعياري للمستقل، الذي يتفق عليه كتابياً قبل البدء بالعمل.",
      ],
    },
    {
      headingEn: "5. Fees, VAT, and Payment",
      headingAr: "5. الأتعاب وضريبة القيمة المضافة والدفع",
      paragraphsEn: [
        "The Client shall pay the Freelancer a total project fee of {total_fee} OMR, exclusive of VAT.",
        "VAT shall be applied at the rate prescribed by the Oman VAT Law (Royal Decree 121/2020) where applicable and invoiced separately.",
        "Payment schedule: {payment_structure}.",
        "Each invoice is due within {payment_terms_days} days of issue. Overdue invoices shall accrue a late charge of 2% per month. If any instalment remains unpaid, the Freelancer may suspend work until payment is received without liability for delays caused by the suspension.",
        "All files, source assets, and final deliverables are withheld until full payment is received.",
      ],
      paragraphsAr: [
        "يدفع العميل للمستقل إجمالي أتعاب المشروع بقيمة {total_fee} ر.ع، غير شاملة ضريبة القيمة المضافة.",
        "تُطبَّق ضريبة القيمة المضافة بالمعدل المقرر بموجب قانون ضريبة القيمة المضافة العماني (المرسوم السلطاني 121/2020) حيثما ينطبق ذلك، وتُفوتَر بشكل منفصل.",
        "جدول الدفع: {payment_structure}.",
        "كل فاتورة مستحقة الدفع خلال {payment_terms_days} يوماً من إصدارها. تستحق على الفواتير المتأخرة رسوم تأخير بنسبة 2% شهرياً. إذا بقي أي قسط غير مسدد، يجوز للمستقل تعليق العمل إلى حين استلام الدفع دون أي مسؤولية عن التأخيرات الناجمة عن التعليق.",
        "تُحجَز جميع الملفات والأصول المصدرية والمخرجات النهائية إلى حين استلام الدفع الكامل.",
      ],
    },
    {
      headingEn: "6. Intellectual Property",
      headingAr: "6. الملكية الفكرية",
      paragraphsEn: [
        "Ownership of final deliverables: {ip_ownership}.",
        "Until full payment is received, all intellectual property in the work (including drafts, concepts, and source files) remains exclusively owned by the Freelancer. The Client acquires no rights to use, reproduce, or distribute any work product prior to full payment.",
        "The Freelancer warrants that the deliverables are original work and do not, to the best of their knowledge, infringe any third-party intellectual property rights. The Client warrants that any materials, content, logos, or assets provided to the Freelancer are owned by or licensed to the Client.",
        "The Freelancer retains the right to use the project in their portfolio and promotional materials unless the Client specifically requests otherwise in writing.",
      ],
      paragraphsAr: [
        "ملكية المخرجات النهائية: {ip_ownership}.",
        "إلى حين استلام الدفع الكامل، تبقى جميع حقوق الملكية الفكرية في العمل (بما يشمل المسودات والمفاهيم وملفات المصدر) ملكاً حصرياً للمستقل. لا يكتسب العميل أي حقوق لاستخدام أو نسخ أو توزيع أي نتاج عمل قبل الدفع الكامل.",
        "يضمن المستقل أن المخرجات أعمال أصيلة ولا تنتهك، في حدود علمه، أي حقوق ملكية فكرية لأطراف ثالثة. ويضمن العميل أن أي مواد أو محتوى أو شعارات أو أصول مقدمة للمستقل مملوكة للعميل أو مُرخَّص له باستخدامها.",
        "يحتفظ المستقل بحقه في عرض المشروع في معرض أعماله والمواد الترويجية ما لم يطلب العميل خلاف ذلك كتابياً على وجه التحديد.",
      ],
    },
    {
      headingEn: "7. Confidentiality",
      headingAr: "7. السرية",
      paragraphsEn: [
        "The Freelancer agrees to keep confidential all non-public information disclosed by the Client in the course of this project, including but not limited to business plans, marketing strategies, client data, pricing, and technical specifications.",
        "Confidentiality obligations shall survive completion or termination of this Agreement for two (2) years. The Freelancer may disclose confidential information only to the extent required by law or court order, with prompt prior written notice to the Client where legally permissible.",
      ],
      paragraphsAr: [
        "يوافق المستقل على الحفاظ على سرية جميع المعلومات غير العامة التي يُفصح عنها العميل في سياق هذا المشروع، بما في ذلك على سبيل المثال لا الحصر خطط الأعمال واستراتيجيات التسويق وبيانات العملاء والأسعار والمواصفات التقنية.",
        "تستمر التزامات السرية بعد الانتهاء من هذا العقد أو إنهائه لمدة سنتين (2). لا يجوز للمستقل الإفصاح عن المعلومات السرية إلا بالقدر الذي يستلزمه القانون أو أمر المحكمة، مع الإخطار الخطي المسبق للعميل حيثما سمح القانون بذلك.",
      ],
    },
    {
      headingEn: "8. Independent Contractor Status",
      headingAr: "8. وضع المقاول المستقل",
      paragraphsEn: [
        "The Freelancer is an independent contractor. Nothing in this Agreement creates a relationship of employment, agency, joint venture, or partnership between the parties.",
        "The Freelancer is solely responsible for: (a) all taxes on income earned under this Agreement; (b) social insurance contributions applicable to self-employed individuals under Omani law; (c) obtaining any professional licences or permits required to perform the Services.",
        "The Client shall not withhold income taxes, pay employee benefits, or provide equipment unless specifically agreed in writing. The Freelancer may work for other clients during the term of this Agreement, unless a written exclusivity clause is separately agreed.",
      ],
      paragraphsAr: [
        "المستقل مقاول مستقل. لا يُنشئ أي شيء في هذا العقد علاقة توظيف أو وكالة أو مشروع مشترك أو شراكة بين الطرفين.",
        "المستقل مسؤول وحده عن: (أ) جميع الضرائب على الدخل المكتسب بموجب هذا العقد؛ (ب) مساهمات التأمين الاجتماعي المنطبقة على العاملين لحسابهم الخاص بموجب القانون العماني؛ (ج) الحصول على أي تراخيص أو تصاريح مهنية مطلوبة لتنفيذ الخدمات.",
        "لا يلتزم العميل باقتطاع ضرائب الدخل أو دفع مزايا الموظفين أو توفير المعدات ما لم يُتفق على ذلك كتابياً. يجوز للمستقل العمل لدى عملاء آخرين خلال مدة هذا العقد، ما لم يُتفق على بند حصرية مكتوب بشكل منفصل.",
      ],
    },
    {
      headingEn: "9. Termination",
      headingAr: "9. الإنهاء",
      paragraphsEn: [
        "Either party may terminate this Agreement upon seven (7) days' written notice.",
        "If the Client terminates before completion: the Client shall pay for all work completed to the date of termination at a pro-rated portion of the total fee, plus any non-refundable expenses reasonably incurred. Any upfront payment received covers work done to that point.",
        "If the Freelancer terminates without cause: the Freelancer shall refund any advance payment that exceeds the value of work completed to the date of termination.",
        "Upon termination, each party shall promptly return or destroy the other's confidential information.",
      ],
      paragraphsAr: [
        "يحق لأي طرف إنهاء هذا العقد بإشعار خطي مدته سبعة (7) أيام.",
        "إذا أنهى العميل العقد قبل الانتهاء: يدفع العميل مقابل جميع الأعمال المنجزة حتى تاريخ الإنهاء بنسبة من الأتعاب الإجمالية، إضافةً إلى أي مصاريف غير قابلة للاسترداد استُحقت بصورة معقولة. يغطي أي دفعة مقدمة مُستلمة الأعمال المنجزة حتى ذلك الحين.",
        "إذا أنهى المستقل العقد بدون مبرر: يُعيد المستقل أي دفعة مقدمة تزيد عن قيمة الأعمال المنجزة حتى تاريخ الإنهاء.",
        "عند الإنهاء، يُعيد كل طرف أو يتلف معلومات الطرف الآخر السرية فوراً.",
      ],
    },
    {
      headingEn: "10. Warranties and Liability",
      headingAr: "10. الضمانات والمسؤولية",
      paragraphsEn: [
        "The Freelancer warrants that the Services will be performed with reasonable skill and care, and that the deliverables will materially conform to the agreed scope.",
        "To the maximum extent permitted by law, the Freelancer's total liability under this Agreement shall not exceed the total fees paid by the Client under this Agreement. Neither party shall be liable for indirect, consequential, or special damages.",
        "The Client is responsible for obtaining independent legal, financial, or professional advice before relying on any deliverable for regulated purposes.",
      ],
      paragraphsAr: [
        "يضمن المستقل أن الخدمات ستُؤدَّى بمهارة وعناية معقولتَين، وأن المخرجات ستتوافق جوهرياً مع النطاق المتفق عليه.",
        "في أقصى حد مسموح به قانوناً، لا تتجاوز المسؤولية الإجمالية للمستقل بموجب هذا العقد إجمالي الأتعاب المدفوعة من العميل بموجبه. لا يتحمل أي طرف مسؤولية الأضرار غير المباشرة أو التبعية أو الخاصة.",
        "العميل مسؤول عن الحصول على مشورة قانونية أو مالية أو مهنية مستقلة قبل الاستناد إلى أي مخرج لأغراض تخضع للتنظيم.",
      ],
    },
    {
      headingEn: "11. Governing Law",
      headingAr: "11. القانون الحاكم",
      paragraphsEn: [
        "This Agreement shall be governed by the laws of the Sultanate of Oman. Any dispute arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent courts of the Sultanate of Oman.",
        "The parties agree to attempt to resolve any dispute through good-faith negotiation for fourteen (14) days before initiating formal proceedings.",
      ],
      paragraphsAr: [
        "يخضع هذا العقد لقوانين سلطنة عُمان. يخضع أي نزاع ينشأ بموجب هذا العقد أو يتعلق به للاختصاص القضائي الحصري للمحاكم المختصة في سلطنة عُمان.",
        "يتفق الطرفان على محاولة حل أي نزاع من خلال التفاوض بحسن نية لمدة أربعة عشر (14) يوماً قبل الشروع في إجراءات رسمية.",
      ],
    },
    {
      headingEn: "12. Signatures",
      headingAr: "12. التوقيعات",
      paragraphsEn: [
        "This Agreement has been executed in two bilingual copies, each party retaining one. In case of discrepancy between the Arabic and English versions, the Arabic version prevails.",
        " ",
        "CLIENT",
        "Name: {client_rep}",
        "Title: {client_rep_title}",
        "On behalf of: {client_name}",
        "Signature: _________________________   Date: _________________",
        " ",
        "FREELANCER",
        "Name: {freelancer_name}",
        "Civil ID / Passport: {freelancer_id}",
        "Signature: _________________________   Date: _________________",
      ],
      paragraphsAr: [
        "تم تحرير هذا العقد من نسختين ثنائيتَي اللغة، يحتفظ كل طرف بنسخة. في حال التعارض بين النسختين العربية والإنجليزية، تكون النسخة العربية هي السائدة.",
        " ",
        "العميل",
        "الاسم: {client_rep}",
        "المنصب: {client_rep_title}",
        "نيابةً عن: {client_name}",
        "التوقيع: _________________________   التاريخ: _________________",
        " ",
        "المستقل",
        "الاسم: {freelancer_name}",
        "الهوية / جواز السفر: {freelancer_id}",
        "التوقيع: _________________________   التاريخ: _________________",
      ],
    },
  ],
};
