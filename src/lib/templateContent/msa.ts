// =============================================================
// Master Services Agreement (MSA) — Bilingual, Oman Law
// Authority: Royal Decree 29/2013 (Civil Transactions / Civil Code)
//            Royal Decree 18/2019 (Commercial Companies Law)
//
// PRO template — locked behind subscription. This is the umbrella
// contract that governs the ongoing commercial relationship between
// a Client and a Service Provider. Specific projects are captured
// in subsequent Statements of Work (SOWs) that incorporate these
// MSA terms by reference.
//
// 22 fields across 7 groups · 14 clauses
// =============================================================

import type { TemplateContent } from "./types";

export const MSA_CONTENT: TemplateContent = {
  id: "msa",
  subtitleEn: "Master Services Agreement — Sultanate of Oman",
  subtitleAr: "اتفاقية الخدمات الرئيسية — سلطنة عُمان",

  fields: [
    // ── Client ──────────────────────────────────────────────
    { key: "client_name", group: "Client", groupAr: "العميل",
      labelEn: "Client — Full Legal Name", labelAr: "العميل — الاسم القانوني الكامل",
      type: "text", required: true, bilingual: true,
      placeholderEn: "Gulf Investments LLC", placeholderAr: "شركة الخليج للاستثمار ش.م.م" },
    { key: "client_cr", group: "Client", groupAr: "العميل",
      labelEn: "Client — Commercial Registration No.", labelAr: "العميل — رقم السجل التجاري",
      type: "text", required: true, placeholderEn: "1234567" },
    { key: "client_address", group: "Client", groupAr: "العميل",
      labelEn: "Client — Registered Address", labelAr: "العميل — العنوان المسجل",
      type: "textarea", required: true, bilingual: true,
      placeholderEn: "Building 10, Way 4512, Al Qurum, Muscat, Sultanate of Oman",
      placeholderAr: "مبنى 10، طريق 4512، القرم، مسقط، سلطنة عُمان" },
    { key: "client_signatory", group: "Client", groupAr: "العميل",
      labelEn: "Client — Authorised Signatory", labelAr: "العميل — الموقّع المفوّض",
      type: "text", required: true, bilingual: true,
      placeholderEn: "Khalid Mohammed Al-Wahaibi", placeholderAr: "خالد محمد الوهيبي" },
    { key: "client_signatory_title", group: "Client", groupAr: "العميل",
      labelEn: "Client — Signatory Title", labelAr: "العميل — منصب الموقّع",
      type: "text", required: true, bilingual: true,
      placeholderEn: "Chief Executive Officer", placeholderAr: "الرئيس التنفيذي" },

    // ── Provider ────────────────────────────────────────────
    { key: "provider_name", group: "Provider", groupAr: "مقدم الخدمة",
      labelEn: "Provider — Full Legal Name", labelAr: "مقدم الخدمة — الاسم القانوني الكامل",
      type: "text", required: true, bilingual: true,
      placeholderEn: "TechSolutions Oman LLC", placeholderAr: "شركة تك سوليوشنز عُمان ش.م.م" },
    { key: "provider_cr", group: "Provider", groupAr: "مقدم الخدمة",
      labelEn: "Provider — Commercial Registration No.", labelAr: "مقدم الخدمة — رقم السجل التجاري",
      type: "text", required: true },
    { key: "provider_address", group: "Provider", groupAr: "مقدم الخدمة",
      labelEn: "Provider — Registered Address", labelAr: "مقدم الخدمة — العنوان المسجل",
      type: "textarea", required: true, bilingual: true,
      placeholderEn: "Office 305, Al Madinah Tower, Ruwi, Muscat, Sultanate of Oman",
      placeholderAr: "مكتب 305، برج المدينة، الروي، مسقط، سلطنة عُمان" },
    { key: "provider_signatory", group: "Provider", groupAr: "مقدم الخدمة",
      labelEn: "Provider — Authorised Signatory", labelAr: "مقدم الخدمة — الموقّع المفوّض",
      type: "text", required: true, bilingual: true,
      placeholderEn: "Sara Mohammed Al-Balushi", placeholderAr: "سارة محمد البلوشي" },
    { key: "provider_signatory_title", group: "Provider", groupAr: "مقدم الخدمة",
      labelEn: "Provider — Signatory Title", labelAr: "مقدم الخدمة — منصب الموقّع",
      type: "text", required: true, bilingual: true,
      placeholderEn: "Managing Director", placeholderAr: "المدير العام" },

    // ── Term ────────────────────────────────────────────────
    { key: "effective_date", group: "Term", groupAr: "المدة",
      labelEn: "Effective Date", labelAr: "تاريخ السريان",
      type: "date", required: true },
    { key: "initial_term_years", group: "Term", groupAr: "المدة",
      labelEn: "Initial Term", labelAr: "المدة الأولية",
      type: "select", required: true, defaultValue: "2",
      options: [
        { value: "1", labelEn: "1 year", labelAr: "سنة واحدة" },
        { value: "2", labelEn: "2 years", labelAr: "سنتان" },
        { value: "3", labelEn: "3 years", labelAr: "ثلاث سنوات" },
        { value: "5", labelEn: "5 years", labelAr: "خمس سنوات" },
      ] },
    { key: "renewal_type", group: "Term", groupAr: "المدة",
      labelEn: "Renewal Type", labelAr: "نوع التجديد",
      type: "select", required: true, defaultValue: "auto_1yr",
      options: [
        { value: "auto_1yr", labelEn: "Auto-renew 1 year unless 60 days notice", labelAr: "تجديد تلقائي لسنة ما لم يُقدّم إشعار 60 يوم" },
        { value: "auto_2yr", labelEn: "Auto-renew 2 years unless 90 days notice", labelAr: "تجديد تلقائي لسنتين ما لم يُقدّم إشعار 90 يوم" },
        { value: "manual", labelEn: "Manual renewal (mutual written agreement)", labelAr: "تجديد يدوي (اتفاق خطي متبادل)" },
      ] },

    // ── Commercial Terms ────────────────────────────────────
    { key: "payment_terms_days", group: "Commercial Terms", groupAr: "الشروط التجارية",
      labelEn: "Payment Terms (days)", labelAr: "شروط الدفع (يوماً)",
      type: "select", required: true, defaultValue: "30",
      options: [
        { value: "14", labelEn: "Net 14 days", labelAr: "صافي 14 يوم" },
        { value: "30", labelEn: "Net 30 days", labelAr: "صافي 30 يوم" },
        { value: "45", labelEn: "Net 45 days", labelAr: "صافي 45 يوم" },
        { value: "60", labelEn: "Net 60 days", labelAr: "صافي 60 يوم" },
      ] },
    { key: "late_fee_rate", group: "Commercial Terms", groupAr: "الشروط التجارية",
      labelEn: "Late Payment Interest (% per month)", labelAr: "فائدة التأخر في الدفع (% شهرياً)",
      type: "number", required: false, defaultValue: "1.5" },

    // ── Liability ───────────────────────────────────────────
    { key: "liability_cap_multiplier", group: "Liability", groupAr: "المسؤولية",
      labelEn: "Liability Cap (multiple of fees paid in prior 12 months)", labelAr: "حد المسؤولية (مضاعف الرسوم المدفوعة في آخر 12 شهر)",
      type: "select", required: true, defaultValue: "1",
      options: [
        { value: "1", labelEn: "1× (standard)", labelAr: "1× (قياسي)" },
        { value: "2", labelEn: "2×", labelAr: "2×" },
        { value: "3", labelEn: "3× (high-stakes)", labelAr: "3× (مخاطر عالية)" },
      ] },
    { key: "insurance_amount_omr", group: "Liability", groupAr: "المسؤولية",
      labelEn: "Provider Insurance Coverage (OMR)", labelAr: "تغطية تأمين مقدم الخدمة (ر.ع)",
      type: "currency-omr", required: false, defaultValue: "100000.000",
      helperEn: "Professional indemnity + general liability minimum",
      helperAr: "الحد الأدنى لتأمين المسؤولية المهنية والعامة" },

    // ── Disputes ────────────────────────────────────────────
    { key: "governing_law", group: "Disputes", groupAr: "النزاعات",
      labelEn: "Governing Law", labelAr: "القانون الحاكم",
      type: "select", required: true, defaultValue: "oman",
      options: [
        { value: "oman", labelEn: "Laws of the Sultanate of Oman", labelAr: "قوانين سلطنة عُمان" },
        { value: "oman_dial", labelEn: "Oman law with DIFC arbitration", labelAr: "قانون عُمان مع تحكيم مركز دبي المالي" },
      ] },
    { key: "dispute_forum", group: "Disputes", groupAr: "النزاعات",
      labelEn: "Dispute Resolution Forum", labelAr: "منتدى حل النزاعات",
      type: "select", required: true, defaultValue: "muscat_courts",
      options: [
        { value: "muscat_courts", labelEn: "Courts of Muscat (litigation)", labelAr: "محاكم مسقط (التقاضي)" },
        { value: "occ_arbitration", labelEn: "Oman Chamber of Commerce arbitration", labelAr: "تحكيم غرفة تجارة وصناعة عُمان" },
        { value: "international_arbitration", labelEn: "International arbitration (UNCITRAL/ICC)", labelAr: "تحكيم دولي (الأونسيترال/ICC)" },
      ] },

    // ── Signatures ──────────────────────────────────────────
    { key: "execution_date", group: "Signatures", groupAr: "التوقيعات",
      labelEn: "Execution Date", labelAr: "تاريخ التوقيع",
      type: "date", required: true },
  ],

  clauses: [
    {
      headingEn: "1. Parties",
      headingAr: "1. الأطراف",
      paragraphsEn: [
        "This Master Services Agreement (this \"Agreement\") is entered into on {execution_date} between:",
        "{client_name}, a company incorporated in the Sultanate of Oman under Commercial Registration No. {client_cr}, with registered address at {client_address} (the \"Client\");",
        "and",
        "{provider_name}, a company incorporated under Commercial Registration No. {provider_cr}, with registered address at {provider_address} (the \"Provider\").",
        "The Client and the Provider are each a \"Party\" and together the \"Parties\".",
      ],
      paragraphsAr: [
        "تم إبرام اتفاقية الخدمات الرئيسية هذه (\"الاتفاقية\") بتاريخ {execution_date} بين:",
        "{client_name}، شركة مسجلة في سلطنة عُمان بموجب السجل التجاري رقم {client_cr}، عنوانها المسجل {client_address} (\"العميل\")؛",
        "و",
        "{provider_name}، شركة مسجلة بموجب السجل التجاري رقم {provider_cr}، عنوانها المسجل {provider_address} (\"مقدم الخدمة\").",
        "يُشار إلى كل من العميل ومقدم الخدمة بـ\"الطرف\" ومعاً بـ\"الطرفين\".",
      ],
    },
    {
      headingEn: "2. Structure of the Engagement",
      headingAr: "2. هيكل التعاقد",
      paragraphsEn: [
        "This Agreement establishes the general legal and commercial framework governing services that the Provider will perform for the Client from time to time. The specific scope, deliverables, timeline, fees, and acceptance criteria of each engagement shall be set out in a separate Statement of Work (\"SOW\") signed by both Parties.",
        "Each executed SOW shall be deemed to incorporate the terms of this Agreement by reference. In the event of any conflict between this Agreement and an SOW, the terms of the SOW shall prevail for that specific engagement, but only with respect to the matters expressly addressed in the SOW.",
      ],
      paragraphsAr: [
        "تُنشئ هذه الاتفاقية الإطار القانوني والتجاري العام الذي يحكم الخدمات التي سيقدمها مقدم الخدمة للعميل من حين لآخر. يُحدَّد النطاق المحدد والتسليمات والجدول الزمني والرسوم ومعايير القبول لكل تعاقد في بيان عمل (\"SOW\") منفصل يوقّعه الطرفان.",
        "تُعتبر كل SOW مُوقّعة مُتضمّنة لشروط هذه الاتفاقية بالإحالة. في حال أي تعارض بين هذه الاتفاقية وSOW، تسود شروط SOW لذلك التعاقد المحدد، ولكن فقط فيما يتعلق بالمسائل المعالجة صراحةً في SOW.",
      ],
    },
    {
      headingEn: "3. Term and Renewal",
      headingAr: "3. المدة والتجديد",
      paragraphsEn: [
        "This Agreement shall commence on {effective_date} (the \"Effective Date\") and shall continue for an initial term of {initial_term_years} year(s) (the \"Initial Term\").",
        "Renewal: {renewal_type}.",
        "Termination of this Agreement does not automatically terminate any active SOW; the Parties shall agree in writing whether to wind down or complete in-flight SOWs.",
      ],
      paragraphsAr: [
        "تبدأ هذه الاتفاقية في {effective_date} (\"تاريخ السريان\") وتستمر لمدة أولية قدرها {initial_term_years} سنة/سنوات (\"المدة الأولية\").",
        "التجديد: {renewal_type}.",
        "لا يؤدي إنهاء هذه الاتفاقية إلى إنهاء أي SOW نشطة تلقائياً؛ يتفق الطرفان خطياً على إنهاء أو استكمال SOWs الجارية.",
      ],
    },
    {
      headingEn: "4. Fees, Invoicing and Payment",
      headingAr: "4. الرسوم والفوترة والدفع",
      paragraphsEn: [
        "Fees for each engagement shall be set out in the relevant SOW and may be expressed as fixed price, time-and-materials, retainer, or any other commercial model the Parties agree.",
        "Invoices shall be issued by the Provider in Omani Rials (OMR) unless otherwise specified in the SOW. Payment shall be made by bank transfer within {payment_terms_days} days of invoice receipt.",
        "Any undisputed amount that remains unpaid after the due date shall bear interest at {late_fee_rate}% per month (or the maximum rate permitted under Omani law, whichever is lower).",
        "All amounts are exclusive of any applicable Value Added Tax (VAT) under Royal Decree 121/2020, which shall be added where required.",
      ],
      paragraphsAr: [
        "تُحدَّد رسوم كل تعاقد في SOW ذات الصلة وقد يتم التعبير عنها كسعر ثابت، أو على أساس الوقت والمواد، أو رسوم احتفاظ، أو أي نموذج تجاري آخر يتفق عليه الطرفان.",
        "يُصدر مقدم الخدمة الفواتير بالريال العماني (ر.ع) ما لم يُنصّ على خلاف ذلك في SOW. يُسدَّد الدفع عن طريق التحويل البنكي خلال {payment_terms_days} يوماً من استلام الفاتورة.",
        "يستحق على أي مبلغ غير متنازع عليه يظل غير مدفوع بعد تاريخ الاستحقاق فائدة بنسبة {late_fee_rate}% شهرياً (أو الحد الأقصى المسموح به بموجب القانون العماني، أيهما أقل).",
        "جميع المبالغ لا تشمل ضريبة القيمة المضافة (VAT) المطبقة بموجب المرسوم السلطاني 121/2020، والتي تُضاف عند الاقتضاء.",
      ],
    },
    {
      headingEn: "5. Confidentiality",
      headingAr: "5. السرية",
      paragraphsEn: [
        "Each Party (the \"Receiving Party\") shall maintain in strict confidence all non-public information disclosed by the other Party (the \"Disclosing Party\") that is marked or reasonably identifiable as confidential, including but not limited to business strategy, financial data, client lists, technical know-how, and personal data.",
        "The confidentiality obligations under this clause shall survive termination of this Agreement for a period of five (5) years, except for trade secrets, which shall be protected for as long as they retain trade-secret status under Omani law.",
        "Each Party shall comply with applicable Oman personal data protection laws when processing personal data on behalf of the other Party.",
      ],
      paragraphsAr: [
        "يلتزم كل طرف (\"الطرف المستلم\") بالحفاظ على السرية التامة لجميع المعلومات غير العامة التي يفصح عنها الطرف الآخر (\"الطرف المُفصِح\") والمميَّزة أو التي يمكن تحديدها بشكل معقول كسرية، بما في ذلك على سبيل المثال لا الحصر: استراتيجية الأعمال، البيانات المالية، قوائم العملاء، الدراية الفنية، والبيانات الشخصية.",
        "تستمر التزامات السرية بموجب هذا البند بعد إنهاء هذه الاتفاقية لمدة خمس (5) سنوات، باستثناء الأسرار التجارية، التي تتم حمايتها طالما احتفظت بصفة الأسرار التجارية بموجب القانون العماني.",
        "يلتزم كل طرف بالقوانين العمانية المعمول بها لحماية البيانات الشخصية عند معالجتها نيابة عن الطرف الآخر.",
      ],
    },
    {
      headingEn: "6. Intellectual Property",
      headingAr: "6. الملكية الفكرية",
      paragraphsEn: [
        "Each Party retains all right, title, and interest in its pre-existing intellectual property (\"Background IP\"). Nothing in this Agreement transfers ownership of Background IP.",
        "Subject to full payment of all undisputed fees under the relevant SOW, the Provider hereby assigns to the Client all right, title, and interest in any deliverable specifically created by the Provider for the Client under that SOW (\"Foreground IP\"), except for: (i) the Provider's Background IP embedded therein, and (ii) generic tools, methodologies, and know-how that the Provider may reuse on other engagements.",
        "The Provider grants the Client a perpetual, royalty-free, worldwide licence to use such embedded Background IP solely as part of the deliverables.",
      ],
      paragraphsAr: [
        "يحتفظ كل طرف بجميع الحقوق والمصالح في ملكيته الفكرية السابقة (\"الملكية الفكرية الخلفية\"). لا يوجد في هذه الاتفاقية ما ينقل ملكية الملكية الفكرية الخلفية.",
        "مع مراعاة سداد جميع الرسوم غير المتنازع عليها بموجب SOW ذات الصلة، يتنازل مقدم الخدمة بموجب هذا للعميل عن جميع الحقوق والمصالح في أي تسليم تم إنشاؤه تحديداً من قبل مقدم الخدمة للعميل بموجب تلك SOW (\"الملكية الفكرية الأمامية\")، باستثناء: (1) الملكية الفكرية الخلفية لمقدم الخدمة المُدمَجة فيها، و(2) الأدوات والمنهجيات والدراية العامة التي قد يعيد مقدم الخدمة استخدامها في تعاقدات أخرى.",
        "يمنح مقدم الخدمة العميل ترخيصاً دائماً ومجانياً وعالمياً لاستخدام تلك الملكية الفكرية الخلفية المُدمَجة كجزء من التسليمات فقط.",
      ],
    },
    {
      headingEn: "7. Warranties",
      headingAr: "7. الضمانات",
      paragraphsEn: [
        "The Provider warrants that: (a) it has the legal capacity and corporate authority to enter into this Agreement; (b) services will be performed in a professional and workmanlike manner consistent with industry standards; (c) it has all necessary licences and permits from Omani authorities to perform the services; and (d) deliverables will not infringe the intellectual property rights of any third party to its knowledge.",
        "Each Party warrants that its execution of this Agreement does not breach any other contract or obligation.",
      ],
      paragraphsAr: [
        "يضمن مقدم الخدمة ما يلي: (أ) أن لديه الأهلية القانونية والصلاحية المؤسسية لإبرام هذه الاتفاقية؛ (ب) أن الخدمات ستُؤدى بطريقة احترافية وحرفية متوافقة مع معايير الصناعة؛ (ج) أن لديه جميع التراخيص والتصاريح اللازمة من السلطات العمانية لأداء الخدمات؛ و(د) أن التسليمات لن تنتهك حقوق الملكية الفكرية لأي طرف ثالث على حد علمه.",
        "يضمن كل طرف أن توقيعه على هذه الاتفاقية لا يخالف أي عقد أو التزام آخر.",
      ],
    },
    {
      headingEn: "8. Limitation of Liability",
      headingAr: "8. حد المسؤولية",
      paragraphsEn: [
        "EXCEPT FOR LIABILITY ARISING FROM (i) BREACH OF CONFIDENTIALITY, (ii) INFRINGEMENT OF INTELLECTUAL PROPERTY, (iii) GROSS NEGLIGENCE OR WILFUL MISCONDUCT, OR (iv) AMOUNTS PAYABLE UNDER THE INDEMNIFICATION CLAUSE, EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED {liability_cap_multiplier} TIMES THE FEES PAID OR PAYABLE BY THE CLIENT TO THE PROVIDER UNDER THE RELEVANT SOW IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.",
        "NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
      ],
      paragraphsAr: [
        "باستثناء المسؤولية الناشئة عن (1) خرق السرية، (2) انتهاك الملكية الفكرية، (3) الإهمال الجسيم أو سوء التصرف المتعمد، أو (4) المبالغ المستحقة بموجب بند التعويض، لا تتجاوز المسؤولية الإجمالية الكلية لكل طرف الناشئة عن هذه الاتفاقية أو المتعلقة بها {liability_cap_multiplier} ضعف الرسوم المدفوعة أو المستحقة من العميل لمقدم الخدمة بموجب SOW ذات الصلة في الاثني عشر (12) شهراً السابقة للحدث الذي أدى إلى المطالبة.",
        "لا يكون أي طرف مسؤولاً عن الأضرار غير المباشرة أو العرضية أو التبعية أو الخاصة أو العقابية، بما في ذلك خسارة الأرباح أو الإيرادات أو البيانات أو السمعة، حتى لو تم إخطاره بإمكانية حدوث مثل هذه الأضرار.",
      ],
    },
    {
      headingEn: "9. Indemnification",
      headingAr: "9. التعويض",
      paragraphsEn: [
        "The Provider shall indemnify, defend, and hold harmless the Client from any third-party claim that the deliverables infringe the intellectual property rights of such third party, subject to the Client providing prompt notice and reasonable cooperation.",
        "Each Party shall indemnify the other for damages arising from its gross negligence, wilful misconduct, or material breach of this Agreement.",
      ],
      paragraphsAr: [
        "يلتزم مقدم الخدمة بتعويض العميل والدفاع عنه وحمايته من أي مطالبة من طرف ثالث بأن التسليمات تنتهك حقوق الملكية الفكرية لذلك الطرف الثالث، شريطة قيام العميل بتقديم إخطار فوري وتعاون معقول.",
        "يعوّض كل طرف الآخر عن الأضرار الناشئة عن إهماله الجسيم أو سوء تصرفه المتعمد أو خرقه المادي لهذه الاتفاقية.",
      ],
    },
    {
      headingEn: "10. Insurance",
      headingAr: "10. التأمين",
      paragraphsEn: [
        "Throughout the term of this Agreement and for two (2) years thereafter, the Provider shall maintain at its own cost (i) professional indemnity insurance and (ii) general commercial liability insurance, each with minimum coverage of {insurance_amount_omr} OMR per occurrence, with a reputable insurer licensed in the Sultanate of Oman.",
        "The Provider shall provide certificates of insurance upon written request.",
      ],
      paragraphsAr: [
        "خلال مدة هذه الاتفاقية ولمدة سنتين (2) بعد ذلك، يحتفظ مقدم الخدمة على نفقته الخاصة بـ(1) تأمين المسؤولية المهنية و(2) تأمين المسؤولية التجارية العامة، كل منهما بحد أدنى للتغطية قدره {insurance_amount_omr} ر.ع لكل حادثة، لدى شركة تأمين موثوقة مرخصة في سلطنة عُمان.",
        "يقدم مقدم الخدمة شهادات التأمين عند الطلب الخطي.",
      ],
    },
    {
      headingEn: "11. Termination",
      headingAr: "11. الإنهاء",
      paragraphsEn: [
        "Either Party may terminate this Agreement: (a) for convenience by giving the other Party ninety (90) days' written notice; (b) immediately for material breach if the breach is not cured within thirty (30) days of written notice; or (c) immediately upon the other Party's insolvency, bankruptcy, or appointment of a receiver.",
        "Upon termination: (i) the Provider shall return or destroy all of the Client's Confidential Information; (ii) the Client shall pay all undisputed fees for services performed up to the termination date; and (iii) the surviving provisions (confidentiality, IP, limitation of liability, indemnification, governing law) shall continue in force.",
      ],
      paragraphsAr: [
        "يحق لأي طرف إنهاء هذه الاتفاقية: (أ) للملاءمة بتقديم إشعار خطي مدته تسعون (90) يوماً للطرف الآخر؛ (ب) فوراً بسبب خرق جوهري إذا لم يتم تصحيح الخرق خلال ثلاثين (30) يوماً من الإشعار الخطي؛ أو (ج) فوراً عند إعسار الطرف الآخر أو إفلاسه أو تعيين حارس قضائي.",
        "عند الإنهاء: (1) يُعيد مقدم الخدمة أو يُتلف جميع المعلومات السرية للعميل؛ (2) يدفع العميل جميع الرسوم غير المتنازع عليها للخدمات المؤداة حتى تاريخ الإنهاء؛ و(3) تستمر الأحكام الباقية (السرية، الملكية الفكرية، حد المسؤولية، التعويض، القانون الحاكم) سارية المفعول.",
      ],
    },
    {
      headingEn: "12. Governing Law and Disputes",
      headingAr: "12. القانون الحاكم والنزاعات",
      paragraphsEn: [
        "This Agreement shall be governed by and construed in accordance with {governing_law}, including the Civil Transactions Law (Royal Decree 29/2013) and the Commercial Companies Law (Royal Decree 18/2019) where applicable.",
        "The Parties shall first attempt to resolve any dispute amicably through good-faith negotiation between senior representatives for a period of thirty (30) days. Any unresolved dispute shall then be submitted to {dispute_forum}.",
      ],
      paragraphsAr: [
        "تخضع هذه الاتفاقية وتُفسَّر وفقاً لـ{governing_law}، بما في ذلك قانون المعاملات المدنية (المرسوم السلطاني 29/2013) وقانون الشركات التجارية (المرسوم السلطاني 18/2019) حيثما ينطبق.",
        "يحاول الطرفان أولاً حل أي نزاع ودياً من خلال التفاوض بحسن نية بين الممثلين الكبار لمدة ثلاثين (30) يوماً. يُحال أي نزاع لم يُحَل إلى {dispute_forum}.",
      ],
    },
    {
      headingEn: "13. General Provisions",
      headingAr: "13. أحكام عامة",
      paragraphsEn: [
        "Notices: All notices shall be in writing and delivered by courier, registered post, or email to the addresses set out in this Agreement.",
        "Assignment: Neither Party may assign this Agreement without the prior written consent of the other, except to an affiliate or successor in a merger or acquisition.",
        "Force Majeure: Neither Party shall be liable for failure to perform caused by events beyond its reasonable control, including natural disasters, government actions, or pandemics, provided that the affected Party gives prompt notice and uses reasonable efforts to mitigate.",
        "Severability: If any provision is held invalid, the remaining provisions shall continue in full force.",
        "Entire Agreement: This Agreement, together with all executed SOWs, constitutes the entire understanding between the Parties on the subject matter.",
        "Counterparts and Language: This Agreement is executed in two (2) bilingual originals. In case of any conflict between the English and Arabic versions, the Arabic version shall prevail.",
      ],
      paragraphsAr: [
        "الإخطارات: تكون جميع الإخطارات خطية وتُسلَّم بالبريد السريع أو البريد المسجل أو البريد الإلكتروني إلى العناوين المُحدَّدة في هذه الاتفاقية.",
        "التنازل: لا يجوز لأي طرف التنازل عن هذه الاتفاقية دون الموافقة الخطية المسبقة للطرف الآخر، باستثناء التنازل لشركة تابعة أو خلف في عملية اندماج أو استحواذ.",
        "القوة القاهرة: لا يتحمل أي طرف المسؤولية عن الإخفاق في الأداء الناجم عن أحداث خارجة عن سيطرته المعقولة، بما في ذلك الكوارث الطبيعية أو الإجراءات الحكومية أو الأوبئة، شريطة أن يقدم الطرف المتضرر إخطاراً فورياً ويبذل جهوداً معقولة للتخفيف.",
        "قابلية الفصل: إذا اعتُبر أي حكم باطلاً، تستمر الأحكام المتبقية سارية بالكامل.",
        "الاتفاقية الكاملة: تشكل هذه الاتفاقية، مع جميع SOWs المُوقّعة، التفاهم الكامل بين الطرفين حول الموضوع.",
        "النسخ واللغة: تُنفَّذ هذه الاتفاقية في نسختين (2) أصليتين ثنائيتي اللغة. في حال أي تعارض بين النسختين العربية والإنجليزية، تكون النسخة العربية هي السائدة.",
      ],
    },
    {
      headingEn: "14. Signatures",
      headingAr: "14. التوقيعات",
      paragraphsEn: [
        "Executed by the duly authorised representatives of the Parties on {execution_date}.",
        " ",
        "FOR THE CLIENT — {client_name}",
        "Name: {client_signatory}",
        "Title: {client_signatory_title}",
        "Signature: _________________________   Date: _________________",
        " ",
        "FOR THE PROVIDER — {provider_name}",
        "Name: {provider_signatory}",
        "Title: {provider_signatory_title}",
        "Signature: _________________________   Date: _________________",
      ],
      paragraphsAr: [
        "تم التوقيع من قبل الممثلين المفوضين حسب الأصول من الطرفين بتاريخ {execution_date}.",
        " ",
        "عن العميل — {client_name}",
        "الاسم: {client_signatory}",
        "المنصب: {client_signatory_title}",
        "التوقيع: _________________________   التاريخ: _________________",
        " ",
        "عن مقدم الخدمة — {provider_name}",
        "الاسم: {provider_signatory}",
        "المنصب: {provider_signatory_title}",
        "التوقيع: _________________________   التاريخ: _________________",
      ],
    },
  ],
};
