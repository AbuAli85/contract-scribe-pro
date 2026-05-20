// =============================================================
// Service Agreement — Bilingual, Oman Law
// Authority: Civil Transactions Law (Royal Decree 29/2013)
//            Commercial Companies Law (Royal Decree 18/2019)
//            Value Added Tax Law (Royal Decree 121/2020)
//
// B2B service delivery contract covering scope, deliverables,
// payment schedule, IP ownership, confidentiality, warranties,
// limitation of liability, termination, and dispute resolution.
//
// 20 fields across 6 steps · 13 clauses
// =============================================================

import type { TemplateContent } from "./types";

export const SERVICE_AGREEMENT_CONTENT: TemplateContent = {
  id: "service-agreement",
  subtitleEn: "B2B Service Agreement — Sultanate of Oman",
  subtitleAr: "عقد خدمات بين الشركات — سلطنة عُمان",

  // ── FIELDS ────────────────────────────────────────────────────
  fields: [
    // — Client (Party A)
    {
      key: "client_name",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Full Legal Name",
      labelAr: "العميل — الاسم القانوني الكامل",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Gulf Investments LLC",
      placeholderAr: "شركة الخليج للاستثمار ش.م.م",
    },
    {
      key: "client_cr",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Commercial Registration No.",
      labelAr: "العميل — رقم السجل التجاري",
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
      placeholderEn: "Building 10, Way 4512, Al Qurum, Muscat, Sultanate of Oman",
      placeholderAr: "مبنى 10، طريق 4512، القرم، مسقط، سلطنة عُمان",
    },
    {
      key: "client_rep",
      group: "Client",
      groupAr: "العميل",
      labelEn: "Client — Authorised Signatory Name",
      labelAr: "العميل — اسم المفوّض بالتوقيع",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Khalid Al-Wahaibi",
      placeholderAr: "خالد الوهيبي",
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
      placeholderEn: "General Manager",
      placeholderAr: "مدير عام",
    },

    // — Service Provider (Party B)
    {
      key: "provider_name",
      group: "Service Provider",
      groupAr: "مزود الخدمة",
      labelEn: "Service Provider — Full Legal Name",
      labelAr: "مزود الخدمة — الاسم القانوني الكامل",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "TechSolutions Oman LLC",
      placeholderAr: "شركة تك سوليوشنز عُمان ش.م.م",
    },
    {
      key: "provider_cr",
      group: "Service Provider",
      groupAr: "مزود الخدمة",
      labelEn: "Service Provider — Commercial Registration No.",
      labelAr: "مزود الخدمة — رقم السجل التجاري",
      type: "text",
      required: true,
      placeholderEn: "7654321",
    },
    {
      key: "provider_address",
      group: "Service Provider",
      groupAr: "مزود الخدمة",
      labelEn: "Service Provider — Address",
      labelAr: "مزود الخدمة — العنوان",
      type: "textarea",
      required: true,
      bilingual: true,
      placeholderEn: "Office 305, Al Madinah Tower, Ruwi, Muscat, Sultanate of Oman",
      placeholderAr: "مكتب 305، برج المدينة، الروي، مسقط، سلطنة عُمان",
    },
    {
      key: "provider_rep",
      group: "Service Provider",
      groupAr: "مزود الخدمة",
      labelEn: "Service Provider — Authorised Signatory Name",
      labelAr: "مزود الخدمة — اسم المفوّض بالتوقيع",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "Sara Al-Balushi",
      placeholderAr: "سارة البلوشي",
    },
    {
      key: "provider_rep_title",
      group: "Service Provider",
      groupAr: "مزود الخدمة",
      labelEn: "Service Provider — Signatory Title",
      labelAr: "مزود الخدمة — منصب المفوّض",
      type: "text",
      required: true,
      bilingual: true,
      placeholderEn: "CEO",
      placeholderAr: "الرئيس التنفيذي",
    },

    // — Scope & Timeline
    {
      key: "services_description",
      group: "Scope & Timeline",
      groupAr: "النطاق والجدول الزمني",
      labelEn: "Description of Services",
      labelAr: "وصف الخدمات",
      type: "textarea",
      required: true,
      placeholderEn:
        "Design, development, and deployment of a customer relationship management (CRM) web application, including user training and 3-month post-launch support.",
      placeholderAr:
        "تصميم وتطوير ونشر تطبيق ويب لإدارة علاقات العملاء (CRM)، بما يشمل تدريب المستخدمين ودعم ثلاثة أشهر بعد الإطلاق.",
    },
    {
      key: "start_date",
      group: "Scope & Timeline",
      groupAr: "النطاق والجدول الزمني",
      labelEn: "Commencement Date",
      labelAr: "تاريخ بدء الخدمة",
      type: "date",
      required: true,
    },
    {
      key: "end_date",
      group: "Scope & Timeline",
      groupAr: "النطاق والجدول الزمني",
      labelEn: "Completion / Expiry Date",
      labelAr: "تاريخ الانتهاء / الإنهاء",
      type: "date",
      required: true,
      helperEn: "For ongoing retainers, use a 1-year end date with renewal clause.",
      helperAr: "للخدمات الدائمة، استخدم تاريخ انتهاء بعد سنة واحدة مع بند التجديد.",
    },

    // — Fees & Payment
    {
      key: "total_fee",
      group: "Fees & Payment",
      groupAr: "الأتعاب والدفع",
      labelEn: "Total Contract Value (OMR, excl. VAT)",
      labelAr: "القيمة الإجمالية للعقد (ر.ع، غير شاملة الضريبة)",
      type: "currency-omr",
      required: true,
      placeholderEn: "5000.000",
    },
    {
      key: "payment_schedule",
      group: "Fees & Payment",
      groupAr: "الأتعاب والدفع",
      labelEn: "Payment Schedule",
      labelAr: "جدول الدفع",
      type: "select",
      required: true,
      defaultValue: "milestone",
      options: [
        {
          value: "upfront",
          labelEn: "100% upfront before work begins",
          labelAr: "100% مقدماً قبل بدء العمل",
        },
        {
          value: "milestone",
          labelEn: "50% upfront · 50% on completion",
          labelAr: "50% مقدماً · 50% عند الإنجاز",
        },
        {
          value: "monthly",
          labelEn: "Monthly instalments",
          labelAr: "أقساط شهرية",
        },
        {
          value: "quarterly",
          labelEn: "Quarterly instalments",
          labelAr: "أقساط ربع سنوية",
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
      defaultValue: "30",
      options: [
        { value: "7",  labelEn: "7 days net",  labelAr: "7 أيام صافية" },
        { value: "14", labelEn: "14 days net", labelAr: "14 يوماً صافية" },
        { value: "30", labelEn: "30 days net", labelAr: "30 يوماً صافية" },
        { value: "60", labelEn: "60 days net", labelAr: "60 يوماً صافية" },
      ],
      helperEn: "Late payment interest: 2% per month on overdue amounts.",
      helperAr: "فائدة التأخر في السداد: 2% شهرياً على المبالغ المتأخرة.",
    },

    // — IP & Ownership
    {
      key: "ip_ownership",
      group: "IP & Ownership",
      groupAr: "الملكية الفكرية",
      labelEn: "Ownership of Deliverables / IP",
      labelAr: "ملكية المخرجات والملكية الفكرية",
      type: "select",
      required: true,
      defaultValue: "client",
      options: [
        {
          value: "client",
          labelEn: "Client owns all deliverables upon full payment",
          labelAr: "العميل يمتلك جميع المخرجات عند الدفع الكامل",
        },
        {
          value: "provider",
          labelEn: "Provider retains IP; grants Client a licence",
          labelAr: "مزود الخدمة يحتفظ بالملكية الفكرية ويمنح العميل ترخيصاً",
        },
        {
          value: "shared",
          labelEn: "Jointly owned by both Parties",
          labelAr: "ملكية مشتركة بين الطرفين",
        },
      ],
      helperEn: "For software/creative work, 'Client owns' is standard.",
      helperAr: "للبرمجيات والأعمال الإبداعية، 'ملكية العميل' هو الاختيار القياسي.",
    },

    // — Termination
    {
      key: "notice_days",
      group: "Termination",
      groupAr: "الإنهاء",
      labelEn: "Termination Notice Period (days)",
      labelAr: "مهلة إشعار الإنهاء (أيام)",
      type: "select",
      required: true,
      defaultValue: "30",
      options: [
        { value: "14", labelEn: "14 days", labelAr: "14 يوماً" },
        { value: "30", labelEn: "30 days", labelAr: "30 يوماً" },
        { value: "60", labelEn: "60 days", labelAr: "60 يوماً" },
        { value: "90", labelEn: "90 days", labelAr: "90 يوماً" },
      ],
    },
  ],

  // ── CLAUSES ───────────────────────────────────────────────────
  clauses: [
    {
      headingEn: "1. Parties",
      headingAr: "1. الأطراف",
      paragraphsEn: [
        "This Service Agreement (\"Agreement\") is entered into between:",
        "{client_name} (CR No. {client_cr}), with registered address at {client_address}, represented by {client_rep} ({client_rep_title}) (\"Client\"); and",
        "{provider_name} (CR No. {provider_cr}), with registered address at {provider_address}, represented by {provider_rep} ({provider_rep_title}) (\"Service Provider\").",
        "Both Parties have full legal capacity to enter into this Agreement and accept its obligations.",
      ],
      paragraphsAr: [
        "تم إبرام عقد الخدمات هذا (\"العقد\") بين:",
        "{client_name} (رقم السجل التجاري: {client_cr})، مقرها المسجل في {client_address}، ممثلة بـ{client_rep} ({client_rep_title}) (\"العميل\")؛ و",
        "{provider_name} (رقم السجل التجاري: {provider_cr})، مقرها المسجل في {provider_address}، ممثلة بـ{provider_rep} ({provider_rep_title}) (\"مزود الخدمة\").",
        "يُقر كلا الطرفين بأهليتهما القانونية الكاملة لإبرام هذا العقد وقبول التزاماته.",
      ],
    },
    {
      headingEn: "2. Scope of Services",
      headingAr: "2. نطاق الخدمات",
      paragraphsEn: [
        "The Service Provider agrees to provide the following services to the Client (\"Services\"):",
        "{services_description}",
        "Any services outside the agreed scope must be confirmed in a written Change Order signed by authorised representatives of both Parties before additional work commences. Change Orders may result in adjustments to fees and timelines.",
      ],
      paragraphsAr: [
        "يوافق مزود الخدمة على تقديم الخدمات التالية للعميل (\"الخدمات\"):",
        "{services_description}",
        "يجب تأكيد أي خدمات خارج النطاق المتفق عليه في أمر تغيير خطي موقّع من ممثلين مفوَّضَين من كلا الطرفين قبل بدء العمل الإضافي. قد تؤدي أوامر التغيير إلى تعديلات في الأتعاب والجداول الزمنية.",
      ],
    },
    {
      headingEn: "3. Term",
      headingAr: "3. مدة العقد",
      paragraphsEn: [
        "This Agreement shall commence on {start_date} and shall continue until {end_date}, unless earlier terminated in accordance with Clause 10.",
        "Upon expiry, this Agreement may be renewed by mutual written consent of both Parties for successive periods on terms to be agreed at the time of renewal.",
      ],
      paragraphsAr: [
        "يبدأ هذا العقد في {start_date} ويستمر حتى {end_date}، ما لم يُنهَ مبكراً وفقاً للبند 10.",
        "عند انتهاء المدة، يجوز تجديد هذا العقد بموافقة خطية متبادلة من كلا الطرفين لفترات متتالية وفق شروط يتفق عليها وقت التجديد.",
      ],
    },
    {
      headingEn: "4. Fees, VAT, and Payment Schedule",
      headingAr: "4. الأتعاب وضريبة القيمة المضافة وجدول الدفع",
      paragraphsEn: [
        "The Client shall pay the Service Provider a total contract value of {total_fee} Omani Rials (OMR), exclusive of Value Added Tax (VAT).",
        "VAT shall be applied at the applicable rate in accordance with the Oman VAT Law (Royal Decree 121/2020) and shall be invoiced separately.",
        "Payment shall be made according to the following schedule: {payment_schedule}.",
        "Each invoice is payable within {payment_terms_days} calendar days of the invoice date. Overdue amounts shall attract a late payment charge of two percent (2%) per month or part thereof, without prejudice to any other remedies available to the Service Provider.",
        "All payments shall be made by bank transfer to the Service Provider's designated account. Bank charges are the responsibility of the paying Party.",
      ],
      paragraphsAr: [
        "يدفع العميل لمزود الخدمة قيمة إجمالية للعقد تبلغ {total_fee} ريال عماني (ر.ع)، غير شاملة ضريبة القيمة المضافة.",
        "تُطبَّق ضريبة القيمة المضافة بالمعدل المعمول به وفقاً لقانون ضريبة القيمة المضافة العماني (المرسوم السلطاني 121/2020) وتُفوتَر بشكل منفصل.",
        "يتم السداد وفقاً للجدول التالي: {payment_schedule}.",
        "كل فاتورة مستحقة الدفع خلال {payment_terms_days} يوماً تقويمياً من تاريخ الفاتورة. تستحق على المبالغ المتأخرة رسوم تأخير بواقع اثنين بالمئة (2%) شهرياً أو أي جزء من الشهر، دون الإخلال بأي سبل انتصاف أخرى متاحة لمزود الخدمة.",
        "تُسدَّد جميع المدفوعات عن طريق التحويل البنكي إلى الحساب المخصص لمزود الخدمة. الرسوم البنكية من مسؤولية الطرف الدافع.",
      ],
    },
    {
      headingEn: "5. Deliverables and Acceptance",
      headingAr: "5. المخرجات والقبول",
      paragraphsEn: [
        "The Service Provider shall deliver the agreed outputs as defined in the scope of services. The Client shall review and either accept or provide written notice of material defects within ten (10) business days of delivery.",
        "If the Client fails to respond within ten (10) business days, the deliverable shall be deemed accepted.",
        "The Service Provider shall remedy any material defects notified within the review period at no additional cost. Minor defects or stylistic preferences not disclosed during the approval process do not constitute grounds for rejection.",
      ],
      paragraphsAr: [
        "يقوم مزود الخدمة بتسليم المخرجات المتفق عليها كما هو محدد في نطاق الخدمات. يقوم العميل بمراجعتها وإما قبولها أو تقديم إشعار خطي بالعيوب الجوهرية في غضون عشرة (10) أيام عمل من تاريخ التسليم.",
        "إذا أخفق العميل في الرد خلال عشرة (10) أيام عمل، تُعدّ المخرجات مقبولة ضمنياً.",
        "يتعين على مزود الخدمة معالجة أي عيوب جوهرية يُبلَّغ عنها خلال فترة المراجعة دون أي تكلفة إضافية. لا تُشكّل العيوب الثانوية أو التفضيلات الجمالية التي لم يُبلَّغ عنها خلال عملية الموافقة أساساً للرفض.",
      ],
    },
    {
      headingEn: "6. Intellectual Property",
      headingAr: "6. الملكية الفكرية",
      paragraphsEn: [
        "Ownership of deliverables and intellectual property created under this Agreement: {ip_ownership}.",
        "Where the Client owns deliverables: all intellectual property rights in deliverables created specifically for the Client shall vest in the Client upon receipt of full payment. The Service Provider retains the right to use general methodologies, tools, and know-how developed prior to or independent of this Agreement.",
        "Where the Service Provider retains IP: the Service Provider grants the Client a non-exclusive, non-transferable, royalty-free licence to use the deliverables for its internal business purposes for the duration of this Agreement and thereafter.",
        "Each Party retains full ownership of its pre-existing intellectual property. Nothing in this Agreement transfers rights in pre-existing IP to the other Party.",
      ],
      paragraphsAr: [
        "ملكية المخرجات والملكية الفكرية المنشأة بموجب هذا العقد: {ip_ownership}.",
        "في حالة ملكية العميل للمخرجات: تنتقل جميع حقوق الملكية الفكرية في المخرجات المنشأة خصيصاً للعميل إليه عند استلام الدفع الكامل. يحتفظ مزود الخدمة بحقه في استخدام المنهجيات والأدوات والمعرفة المهنية العامة المطورة قبل هذا العقد أو بصورة مستقلة عنه.",
        "في حالة احتفاظ مزود الخدمة بالملكية الفكرية: يمنح مزود الخدمة العميل ترخيصاً غير حصري وغير قابل للتحويل وخالياً من الإتاوات لاستخدام المخرجات لأغراضه التجارية الداخلية طوال مدة هذا العقد وما بعدها.",
        "يحتفظ كل طرف بملكية كاملة لملكيته الفكرية الموجودة مسبقاً. لا يُنقل أي شيء في هذا العقد حقوقاً في الملكية الفكرية الموجودة مسبقاً إلى الطرف الآخر.",
      ],
    },
    {
      headingEn: "7. Confidentiality",
      headingAr: "7. السرية",
      paragraphsEn: [
        "Each Party acknowledges that in the course of this Agreement it may receive confidential information of the other Party, including but not limited to business plans, financial data, technical know-how, client lists, and pricing information.",
        "Each Party agrees to: (a) maintain all such information in strict confidence; (b) use it solely for performing obligations under this Agreement; (c) not disclose it to any third party without prior written consent; and (d) apply at minimum the same degree of protection it applies to its own confidential information.",
        "Confidentiality obligations shall survive termination of this Agreement for a period of three (3) years.",
      ],
      paragraphsAr: [
        "يُقر كل طرف بأنه قد يتلقى خلال مدة هذا العقد معلومات سرية خاصة بالطرف الآخر، بما في ذلك على سبيل المثال لا الحصر خطط الأعمال والبيانات المالية والمعرفة التقنية وقوائم العملاء ومعلومات الأسعار.",
        "يوافق كل طرف على: (أ) الحفاظ على جميع هذه المعلومات بصرامة تامة؛ (ب) استخدامها فقط للوفاء بالتزاماته بموجب هذا العقد؛ (ج) عدم الإفصاح عنها لأي طرف ثالث دون موافقة خطية مسبقة؛ و(د) تطبيق درجة الحماية ذاتها على الأقل التي يطبقها على معلوماته السرية الخاصة.",
        "تستمر التزامات السرية بعد إنهاء هذا العقد لمدة ثلاث (3) سنوات.",
      ],
    },
    {
      headingEn: "8. Warranties",
      headingAr: "8. الضمانات",
      paragraphsEn: [
        "The Service Provider warrants that: (a) it has full authority to enter into and perform this Agreement; (b) the Services will be performed by competent personnel in a professional and workmanlike manner; (c) the deliverables will substantially conform to the agreed specifications; and (d) the deliverables will not, to the best of its knowledge, infringe any third-party intellectual property rights.",
        "The Client warrants that: (a) it has full authority to enter into this Agreement; (b) it will provide the Service Provider with timely access to information, systems, and personnel reasonably necessary for performance; and (c) the content or materials supplied by the Client do not infringe any third-party rights.",
      ],
      paragraphsAr: [
        "يضمن مزود الخدمة أنه: (أ) يمتلك الصلاحية الكاملة لإبرام هذا العقد وتنفيذه؛ (ب) ستُقدَّم الخدمات من قِبل موظفين أكفاء بطريقة مهنية واحترافية؛ (ج) ستتوافق المخرجات جوهرياً مع المواصفات المتفق عليها؛ و(د) لن تنتهك المخرجات، في حدود علمه، أي حقوق ملكية فكرية لأطراف ثالثة.",
        "يضمن العميل أنه: (أ) يمتلك الصلاحية الكاملة لإبرام هذا العقد؛ (ب) سيوفر لمزود الخدمة في الوقت المناسب الوصول إلى المعلومات والأنظمة والموظفين اللازمين بشكل معقول للتنفيذ؛ و(ج) المحتوى أو المواد المقدمة من العميل لا تنتهك أي حقوق لأطراف ثالثة.",
      ],
    },
    {
      headingEn: "9. Limitation of Liability",
      headingAr: "9. تحديد المسؤولية",
      paragraphsEn: [
        "To the maximum extent permitted by Omani law, neither Party shall be liable to the other for any indirect, incidental, consequential, special, or punitive damages, including loss of profit, loss of data, or loss of business, arising out of or in connection with this Agreement, even if advised of the possibility of such damages.",
        "The total aggregate liability of the Service Provider to the Client under or in connection with this Agreement shall not exceed the total fees paid by the Client to the Service Provider in the twelve (12) months immediately preceding the event giving rise to the claim.",
        "Nothing in this clause limits liability for: (a) fraud or wilful misconduct; (b) death or personal injury caused by negligence; or (c) any liability that cannot be excluded by law.",
      ],
      paragraphsAr: [
        "في أقصى حد مسموح به بموجب القانون العماني، لا يتحمل أي طرف تجاه الآخر أي أضرار غير مباشرة أو عرضية أو تبعية أو خاصة أو عقابية، بما فيها الخسارة في الأرباح أو خسارة البيانات أو خسارة الأعمال، الناشئة عن أو المرتبطة بهذا العقد، حتى لو أُبلغ باحتمال وقوع مثل هذه الأضرار.",
        "يجب ألا تتجاوز المسؤولية الإجمالية لمزود الخدمة تجاه العميل بموجب هذا العقد أو فيما يتعلق به إجمالي الأتعاب المدفوعة من العميل لمزود الخدمة في الاثني عشر (12) شهراً السابقة مباشرة للحدث المُفضي إلى المطالبة.",
        "لا يُقيّد أي شيء في هذا البند المسؤولية عن: (أ) الاحتيال أو سوء السلوك المتعمد؛ (ب) الوفاة أو الإصابة الشخصية الناجمة عن الإهمال؛ أو (ج) أي مسؤولية لا يمكن استبعادها بموجب القانون.",
      ],
    },
    {
      headingEn: "10. Termination",
      headingAr: "10. الإنهاء",
      paragraphsEn: [
        "Either Party may terminate this Agreement for convenience by providing {notice_days} days' prior written notice to the other Party.",
        "Either Party may terminate this Agreement immediately upon written notice if the other Party: (a) commits a material breach and fails to remedy it within fourteen (14) days of receiving written notice of the breach; (b) becomes insolvent, is subject to a winding-up order, or has a receiver appointed over its assets; or (c) ceases to carry on business.",
        "Upon termination: (i) the Client shall pay for all Services performed and expenses reasonably incurred up to the termination date; (ii) each Party shall promptly return or destroy the other Party's confidential information; and (iii) intellectual property rights shall vest as per Clause 6 pro-rated to work completed.",
      ],
      paragraphsAr: [
        "يحق لأي طرف إنهاء هذا العقد بإرادته المنفردة بتقديم إشعار خطي مسبق مدته {notice_days} يوماً للطرف الآخر.",
        "يحق لأي طرف إنهاء هذا العقد فوراً بإشعار خطي إذا قام الطرف الآخر بـ: (أ) ارتكاب انتهاك جوهري وإخفاقه في معالجته خلال أربعة عشر (14) يوماً من استلام الإشعار الخطي بشأنه؛ (ب) الإعسار أو صدور أمر تصفية بحقه أو تعيين مصفٍّ على أصوله؛ أو (ج) التوقف عن ممارسة أعماله.",
        "عند الإنهاء: (أولاً) يدفع العميل مقابل جميع الخدمات المنجزة والمصاريف المعقولة المتكبدة حتى تاريخ الإنهاء؛ (ثانياً) يُعيد كل طرف أو يتلف معلومات الطرف الآخر السرية فوراً؛ و(ثالثاً) تنتقل حقوق الملكية الفكرية وفقاً للبند 6 بالتناسب مع العمل المنجز.",
      ],
    },
    {
      headingEn: "11. Independent Contractor",
      headingAr: "11. المقاول المستقل",
      paragraphsEn: [
        "The Service Provider is an independent contractor and not an employee, agent, partner, or joint venturer of the Client. The Service Provider has no authority to bind the Client in any contract or commitment.",
        "The Service Provider is responsible for all tax obligations, social insurance contributions, and employment-related liabilities for its own personnel. The Client shall have no obligation to withhold income tax or provide employee benefits to the Service Provider or its personnel.",
      ],
      paragraphsAr: [
        "مزود الخدمة مقاول مستقل وليس موظفاً أو وكيلاً أو شريكاً أو مشاركاً في مشروع مشترك مع العميل. ليس لمزود الخدمة أي صلاحية لإلزام العميل بأي عقد أو التزام.",
        "مزود الخدمة مسؤول عن جميع الالتزامات الضريبية ومساهمات التأمين الاجتماعي والالتزامات المتعلقة بالعمل لموظفيه الخاصين. لا يلتزم العميل بخصم ضريبة الدخل أو توفير مزايا موظفين لمزود الخدمة أو موظفيه.",
      ],
    },
    {
      headingEn: "12. Governing Law and Dispute Resolution",
      headingAr: "12. القانون الحاكم وحل النزاعات",
      paragraphsEn: [
        "This Agreement shall be governed by and construed in accordance with the laws of the Sultanate of Oman, in particular the Civil Transactions Law (Royal Decree 29/2013) and Commercial Companies Law (Royal Decree 18/2019).",
        "The Parties shall first attempt to resolve any dispute through good-faith negotiation for a period of thirty (30) days from the date one Party notifies the other of the dispute in writing.",
        "If the dispute is not resolved through negotiation, it shall be submitted to the exclusive jurisdiction of the competent courts of the Sultanate of Oman.",
      ],
      paragraphsAr: [
        "يخضع هذا العقد وتُفسَّر أحكامه وفقاً لقوانين سلطنة عُمان، وعلى وجه الخصوص قانون المعاملات المدنية (المرسوم السلطاني 29/2013) وقانون الشركات التجارية (المرسوم السلطاني 18/2019).",
        "يسعى الطرفان أولاً إلى حل أي نزاع من خلال التفاوض بحسن نية لمدة ثلاثين (30) يوماً من تاريخ إخطار أحد الطرفين للآخر بالنزاع كتابياً.",
        "إذا لم يُحسم النزاع عبر التفاوض، يُحال إلى الاختصاص القضائي الحصري للمحاكم المختصة في سلطنة عُمان.",
      ],
    },
    {
      headingEn: "13. Signatures",
      headingAr: "13. التوقيعات",
      paragraphsEn: [
        "This Agreement has been executed in two original bilingual copies, each Party retaining one copy. In case of any discrepancy between the Arabic and English versions, the Arabic version shall prevail.",
        " ",
        "CLIENT",
        "Name: {client_rep}",
        "Title: {client_rep_title}",
        "On behalf of: {client_name}",
        "Signature: _________________________   Date: _________________",
        " ",
        "SERVICE PROVIDER",
        "Name: {provider_rep}",
        "Title: {provider_rep_title}",
        "On behalf of: {provider_name}",
        "Signature: _________________________   Date: _________________",
      ],
      paragraphsAr: [
        "تم تحرير هذا العقد من نسختين أصليتين ثنائيتي اللغة، يحتفظ كل طرف بنسخة. في حال وجود أي تعارض بين النسختين العربية والإنجليزية، تكون النسخة العربية هي السائدة.",
        " ",
        "العميل",
        "الاسم: {client_rep}",
        "المنصب: {client_rep_title}",
        "نيابةً عن: {client_name}",
        "التوقيع: _________________________   التاريخ: _________________",
        " ",
        "مزود الخدمة",
        "الاسم: {provider_rep}",
        "المنصب: {provider_rep_title}",
        "نيابةً عن: {provider_name}",
        "التوقيع: _________________________   التاريخ: _________________",
      ],
    },
  ],
};
