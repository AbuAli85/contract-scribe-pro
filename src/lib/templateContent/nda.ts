// =============================================================
// NDA / Confidentiality Agreement — Bilingual, Oman Law
// Authority: Civil Transactions Law (Royal Decree 29/2013)
//            Commercial Companies Law (Royal Decree 18/2019)
//
// Supports mutual (both parties disclose) and one-way
// (only one party discloses) configurations. 15 fields,
// 12 clauses covering definitions, obligations, exclusions,
// term, return of information, remedies, and signatures.
// =============================================================

import type { TemplateContent } from "./types";

export const NDA_CONTENT: TemplateContent = {
  id: "nda",
  subtitleEn: "Confidentiality Agreement — Sultanate of Oman",
  subtitleAr: "اتفاقية عدم إفشاء السرية — سلطنة عُمان",

  // ── FIELDS ────────────────────────────────────────────────────
  fields: [
    // — Party A (always the disclosing party, or first mutual party)
    {
      key: "party_a_name",
      group: "Party A",
      groupAr: "الطرف الأول",
      labelEn: "Party A — Full Legal Name",
      labelAr: "الطرف الأول — الاسم القانوني الكامل",
      type: "text",
      required: true,
      placeholderEn: "Acme Trading LLC",
      placeholderAr: "شركة أكمي للتجارة ش.م.م",
    },
    {
      key: "party_a_cr",
      group: "Party A",
      groupAr: "الطرف الأول",
      labelEn: "Party A — CR / Registration No. (if company)",
      labelAr: "الطرف الأول — رقم السجل التجاري (إن وجد)",
      type: "text",
      required: false,
      placeholderEn: "1234567",
    },
    {
      key: "party_a_address",
      group: "Party A",
      groupAr: "الطرف الأول",
      labelEn: "Party A — Address",
      labelAr: "الطرف الأول — العنوان",
      type: "textarea",
      required: true,
      placeholderEn: "Al Khuwair, Muscat, Sultanate of Oman",
      placeholderAr: "الخوير، مسقط، سلطنة عُمان",
    },
    {
      key: "party_a_rep",
      group: "Party A",
      groupAr: "الطرف الأول",
      labelEn: "Party A — Signatory Name",
      labelAr: "الطرف الأول — اسم ممثل التوقيع",
      type: "text",
      required: true,
      placeholderEn: "Ahmed Al-Rashdi",
    },
    {
      key: "party_a_title",
      group: "Party A",
      groupAr: "الطرف الأول",
      labelEn: "Party A — Signatory Title",
      labelAr: "الطرف الأول — منصب ممثل التوقيع",
      type: "text",
      required: true,
      placeholderEn: "General Manager",
      placeholderAr: "مدير عام",
    },

    // — Party B (receiving party, or second mutual party)
    {
      key: "party_b_name",
      group: "Party B",
      groupAr: "الطرف الثاني",
      labelEn: "Party B — Full Legal Name",
      labelAr: "الطرف الثاني — الاسم القانوني الكامل",
      type: "text",
      required: true,
      placeholderEn: "Beta Solutions LLC",
      placeholderAr: "شركة بيتا للحلول ش.م.م",
    },
    {
      key: "party_b_cr",
      group: "Party B",
      groupAr: "الطرف الثاني",
      labelEn: "Party B — CR / Registration No. (if company)",
      labelAr: "الطرف الثاني — رقم السجل التجاري (إن وجد)",
      type: "text",
      required: false,
      placeholderEn: "7654321",
    },
    {
      key: "party_b_address",
      group: "Party B",
      groupAr: "الطرف الثاني",
      labelEn: "Party B — Address",
      labelAr: "الطرف الثاني — العنوان",
      type: "textarea",
      required: true,
      placeholderEn: "Madinat Al Sultan Qaboos, Muscat, Sultanate of Oman",
      placeholderAr: "مدينة السلطان قابوس، مسقط، سلطنة عُمان",
    },
    {
      key: "party_b_rep",
      group: "Party B",
      groupAr: "الطرف الثاني",
      labelEn: "Party B — Signatory Name",
      labelAr: "الطرف الثاني — اسم ممثل التوقيع",
      type: "text",
      required: true,
      placeholderEn: "Sara Al-Harthi",
    },
    {
      key: "party_b_title",
      group: "Party B",
      groupAr: "الطرف الثاني",
      labelEn: "Party B — Signatory Title",
      labelAr: "الطرف الثاني — منصب ممثل التوقيع",
      type: "text",
      required: true,
      placeholderEn: "CEO",
      placeholderAr: "الرئيس التنفيذي",
    },

    // — Agreement terms
    {
      key: "nda_type",
      group: "Agreement Terms",
      groupAr: "شروط الاتفاقية",
      labelEn: "NDA Type",
      labelAr: "نوع اتفاقية السرية",
      type: "select",
      required: true,
      defaultValue: "mutual",
      options: [
        {
          value: "mutual",
          labelEn: "Mutual (both parties disclose)",
          labelAr: "متبادلة (كلا الطرفين يُفصح)",
        },
        {
          value: "one-way",
          labelEn: "One-way (Party A discloses to Party B only)",
          labelAr: "أحادية الاتجاه (الطرف الأول يُفصح للطرف الثاني فقط)",
        },
      ],
      helperEn: "Mutual NDAs are standard for joint ventures and partnerships.",
      helperAr: "اتفاقيات السرية المتبادلة هي القياسية في المشاريع المشتركة والشراكات.",
    },
    {
      key: "purpose",
      group: "Agreement Terms",
      groupAr: "شروط الاتفاقية",
      labelEn: "Purpose of Disclosure",
      labelAr: "الغرض من الإفصاح",
      type: "textarea",
      required: true,
      placeholderEn:
        "Evaluating a potential business partnership for the development of a software platform.",
      placeholderAr:
        "تقييم شراكة عمل محتملة لتطوير منصة برمجية.",
    },
    {
      key: "effective_date",
      group: "Agreement Terms",
      groupAr: "شروط الاتفاقية",
      labelEn: "Effective Date",
      labelAr: "تاريخ السريان",
      type: "date",
      required: true,
    },
    {
      key: "confidentiality_years",
      group: "Agreement Terms",
      groupAr: "شروط الاتفاقية",
      labelEn: "Confidentiality Period",
      labelAr: "مدة السرية",
      type: "select",
      required: true,
      defaultValue: "3",
      options: [
        { value: "1", labelEn: "1 year", labelAr: "سنة واحدة" },
        { value: "2", labelEn: "2 years", labelAr: "سنتان" },
        { value: "3", labelEn: "3 years", labelAr: "ثلاث سنوات" },
        { value: "5", labelEn: "5 years", labelAr: "خمس سنوات" },
      ],
      helperEn: "How long after signing the obligation survives.",
      helperAr: "المدة التي تستمر فيها الالتزامات بعد التوقيع.",
    },
  ],

  // ── CLAUSES ───────────────────────────────────────────────────
  clauses: [
    {
      headingEn: "1. Parties",
      headingAr: "1. الأطراف",
      paragraphsEn: [
        'This Non-Disclosure Agreement ("Agreement") is entered into as of {effective_date} between:',
        "{party_a_name} (CR No. {party_a_cr}), with registered address at {party_a_address}, represented by {party_a_rep} ({party_a_title}) (\"Party A\"); and",
        "{party_b_name} (CR No. {party_b_cr}), with registered address at {party_b_address}, represented by {party_b_rep} ({party_b_title}) (\"Party B\").",
        'Party A and Party B are each a "Party" and collectively the "Parties".',
      ],
      paragraphsAr: [
        'تم إبرام اتفاقية عدم الإفصاح هذه ("الاتفاقية") اعتباراً من {effective_date} بين:',
        "{party_a_name} (رقم السجل التجاري: {party_a_cr})، مقرها المسجل في {party_a_address}، ممثلة بـ{party_a_rep} ({party_a_title}) (\"الطرف الأول\")؛ و",
        "{party_b_name} (رقم السجل التجاري: {party_b_cr})، مقرها المسجل في {party_b_address}، ممثلة بـ{party_b_rep} ({party_b_title}) (\"الطرف الثاني\").",
        'يُشار إلى الطرف الأول والطرف الثاني منفردَين بـ"الطرف" ومجتمعَين بـ"الطرفان".',
      ],
    },
    {
      headingEn: "2. Purpose",
      headingAr: "2. الغرض",
      paragraphsEn: [
        "The Parties desire to explore a business opportunity involving: {purpose}.",
        'In connection with this purpose (the "Permitted Purpose"), one or both Parties may disclose certain confidential information to the other. This Agreement governs the use and protection of such information.',
      ],
      paragraphsAr: [
        "يرغب الطرفان في استكشاف فرصة تجارية تتعلق بـ: {purpose}.",
        'تمهيداً لهذا الغرض ("الغرض المصرح به")، قد يُفصح أحد الطرفين أو كلاهما عن معلومات سرية معينة للطرف الآخر. تحكم هذه الاتفاقية استخدام هذه المعلومات وحمايتها.',
      ],
    },
    {
      headingEn: "3. Definition of Confidential Information",
      headingAr: "3. تعريف المعلومات السرية",
      paragraphsEn: [
        '"Confidential Information" means any non-public information, technical data, trade secrets, or know-how, including but not limited to: research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, financial data, or business plans — disclosed by one Party ("Disclosing Party") to the other ("Receiving Party"), whether orally, in writing, by drawing, or by inspection.',
        "Information that is marked as 'Confidential' or 'Proprietary' at the time of disclosure, or information that a reasonable person would understand to be confidential given the nature of the information and circumstances of disclosure, is included within this definition.",
      ],
      paragraphsAr: [
        'تعني "المعلومات السرية" أي معلومات غير عامة أو بيانات تقنية أو أسرار تجارية أو معرفة مهنية، بما في ذلك على سبيل المثال لا الحصر: الأبحاث وخطط المنتجات والمنتجات والخدمات وقوائم العملاء والأسواق والبرمجيات والتطوير والاختراعات والعمليات والصيغ والتكنولوجيا والتصاميم والرسومات والبيانات المالية وخطط الأعمال — التي يُفصح عنها أحد الطرفين ("الطرف المُفصِح") للطرف الآخر ("الطرف المتلقي")، سواء شفهياً أو كتابياً أو برسم أو بالفحص.',
        "تشمل هذه التعريف المعلومات التي تحمل علامة 'سري' أو 'خاص' وقت الإفصاح، أو المعلومات التي يفهم الشخص المعقول طبيعتها السرية في ضوء طبيعة المعلومات وظروف الإفصاح.",
      ],
    },
    {
      headingEn: "4. Obligations of the Receiving Party",
      headingAr: "4. التزامات الطرف المتلقي",
      paragraphsEn: [
        "The Receiving Party agrees to:",
        "(a) hold all Confidential Information in strict confidence;",
        "(b) not disclose any Confidential Information to any third party without the prior written consent of the Disclosing Party;",
        "(c) use the Confidential Information solely for the Permitted Purpose;",
        "(d) restrict disclosure within its own organisation to employees, directors, or advisors who have a need to know and are bound by confidentiality obligations no less protective than this Agreement;",
        "(e) promptly notify the Disclosing Party upon becoming aware of any unauthorised use or disclosure of Confidential Information.",
      ],
      paragraphsAr: [
        "يوافق الطرف المتلقي على:",
        "(أ) الحفاظ على جميع المعلومات السرية بصرامة تامة؛",
        "(ب) عدم الإفصاح عن أي معلومات سرية لأي طرف ثالث دون الحصول على موافقة خطية مسبقة من الطرف المُفصِح؛",
        "(ج) استخدام المعلومات السرية للغرض المصرح به فقط؛",
        "(د) تقييد الإفصاح داخل مؤسسته على الموظفين والمديرين أو المستشارين الذين يحتاجون إلى المعرفة وملتزمون بالتزامات سرية لا تقل حماية عن هذه الاتفاقية؛",
        "(هـ) إخطار الطرف المُفصِح فوراً عند علمه بأي استخدام أو إفصاح غير مصرح به للمعلومات السرية.",
      ],
    },
    {
      headingEn: "5. Exclusions",
      headingAr: "5. الاستثناءات",
      paragraphsEn: [
        "The confidentiality obligations in this Agreement do not apply to information that:",
        "(a) is or becomes publicly available through no breach of this Agreement by the Receiving Party;",
        "(b) was rightfully known to the Receiving Party prior to disclosure, without restriction;",
        "(c) is rightfully obtained by the Receiving Party from a third party without restriction;",
        "(d) is independently developed by the Receiving Party without use of the Confidential Information; or",
        "(e) is required to be disclosed by applicable law, regulation, or court order — provided the Receiving Party gives the Disclosing Party prompt written notice (where legally permissible) to seek a protective order.",
      ],
      paragraphsAr: [
        "لا تسري التزامات السرية الواردة في هذه الاتفاقية على المعلومات التي:",
        "(أ) أصبحت متاحة للعموم دون أي انتهاك لهذه الاتفاقية من جانب الطرف المتلقي؛",
        "(ب) كانت معروفة للطرف المتلقي بحق قبل الإفصاح دون قيود؛",
        "(ج) حصل عليها الطرف المتلقي بحق من طرف ثالث دون قيود؛",
        "(د) طورها الطرف المتلقي بصورة مستقلة دون الاستعانة بالمعلومات السرية؛ أو",
        "(هـ) يقتضي الإفصاح عنها القانون أو اللوائح أو أمر المحكمة — شريطة أن يُخطر الطرف المتلقي الطرف المُفصِح كتابياً وفوراً (حيثما سمح القانون) لاستصدار أمر وقائي.",
      ],
    },
    {
      headingEn: "6. Mutual vs. One-Way Disclosure",
      headingAr: "6. الإفصاح المتبادل أو أحادي الاتجاه",
      paragraphsEn: [
        "This Agreement is a {nda_type} confidentiality arrangement.",
        "In a mutual arrangement: both Party A and Party B may disclose Confidential Information to each other, and both shall be bound as Receiving Party with respect to the other's disclosures.",
        "In a one-way arrangement: only Party A is the Disclosing Party and only Party B is the Receiving Party. Party B's obligations under Clause 4 apply in full; Party A has no reciprocal obligation under this Agreement.",
      ],
      paragraphsAr: [
        "هذه الاتفاقية ترتيب سرية {nda_type}.",
        "في حالة الترتيب المتبادل: يجوز للطرف الأول والطرف الثاني كليهما الإفصاح عن معلومات سرية لبعضهما، ويلتزم كلاهما بصفة الطرف المتلقي فيما يتعلق بإفصاحات الطرف الآخر.",
        "في حالة الترتيب أحادي الاتجاه: الطرف الأول وحده هو الطرف المُفصِح والطرف الثاني وحده هو الطرف المتلقي. تسري التزامات الطرف الثاني بموجب البند 4 بالكامل، ولا يلتزم الطرف الأول بأي التزام مماثل بموجب هذه الاتفاقية.",
      ],
    },
    {
      headingEn: "7. Term",
      headingAr: "7. مدة الاتفاقية",
      paragraphsEn: [
        "This Agreement shall commence on the Effective Date and continue for {confidentiality_years} year(s). The confidentiality obligations shall survive termination of this Agreement and remain in force for {confidentiality_years} year(s) from the date of expiry or termination.",
        "Either Party may terminate this Agreement at any time upon thirty (30) days' written notice to the other Party, provided that obligations with respect to Confidential Information already received shall survive such termination.",
      ],
      paragraphsAr: [
        "تبدأ هذه الاتفاقية من تاريخ السريان وتستمر لمدة {confidentiality_years} سنة(سنوات). تستمر التزامات السرية بعد انتهاء هذه الاتفاقية وتظل سارية المفعول لمدة {confidentiality_years} سنة(سنوات) من تاريخ انتهاء المدة أو إنهاء الاتفاقية.",
        "يحق لأي طرف إنهاء هذه الاتفاقية في أي وقت بإشعار خطي مدته ثلاثون (30) يوماً للطرف الآخر، شريطة أن تستمر الالتزامات المتعلقة بالمعلومات السرية المُستلمة بالفعل بعد هذا الإنهاء.",
      ],
    },
    {
      headingEn: "8. Return or Destruction of Information",
      headingAr: "8. إعادة أو إتلاف المعلومات",
      paragraphsEn: [
        "Upon the written request of the Disclosing Party, or upon expiry or termination of this Agreement, the Receiving Party shall promptly:",
        "(a) return all tangible Confidential Information and any copies thereof to the Disclosing Party; or",
        "(b) certify in writing that all such materials and copies have been destroyed.",
        "Electronic copies retained on back-up systems shall be overwritten in the normal course of business.",
      ],
      paragraphsAr: [
        "بناءً على الطلب الخطي للطرف المُفصِح، أو عند انتهاء مدة هذه الاتفاقية أو إنهائها، يلتزم الطرف المتلقي فوراً بـ:",
        "(أ) إعادة جميع المعلومات السرية الملموسة وأي نسخ منها إلى الطرف المُفصِح؛ أو",
        "(ب) الإقرار كتابياً بأنه قد تم إتلاف جميع هذه المواد والنسخ.",
        "تُستبدل النسخ الإلكترونية المحفوظة في أنظمة النسخ الاحتياطي في سياق الأعمال الاعتيادي.",
      ],
    },
    {
      headingEn: "9. No Licence or Transfer of Rights",
      headingAr: "9. عدم منح ترخيص أو نقل ملكية",
      paragraphsEn: [
        "Nothing in this Agreement grants the Receiving Party any right, title, interest, or licence in or to any Confidential Information, intellectual property, patents, trademarks, copyrights, or trade secrets of the Disclosing Party.",
        "The Disclosing Party retains all ownership of its Confidential Information. No obligation to enter into any further agreement, transaction, or business relationship is created by this Agreement.",
      ],
      paragraphsAr: [
        "لا يمنح هذه الاتفاقية الطرف المتلقي أي حق أو ملكية أو مصلحة أو ترخيص في أي معلومات سرية أو ملكية فكرية أو براءات اختراع أو علامات تجارية أو حقوق طبع ونشر أو أسرار تجارية للطرف المُفصِح.",
        "يحتفظ الطرف المُفصِح بملكية معلوماته السرية كاملةً. لا تنشئ هذه الاتفاقية أي التزام بإبرام أي اتفاقية أو صفقة أو علاقة عمل أخرى.",
      ],
    },
    {
      headingEn: "10. Remedies",
      headingAr: "10. التعويض والانتصاف",
      paragraphsEn: [
        "The Parties acknowledge that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled, without prejudice to any other rights or remedies available to it, to seek equitable relief including injunctive relief and specific performance from competent Omani courts.",
        "The Receiving Party further agrees to indemnify and hold harmless the Disclosing Party from and against any and all losses, damages, costs, and expenses arising out of or in connection with any breach of this Agreement.",
      ],
      paragraphsAr: [
        "يُقر الطرفان بأن أي انتهاك لهذه الاتفاقية قد يتسبب في ضرر لا يمكن تعويضه بالتعويضات المالية للطرف المُفصِح. وبناءً على ذلك، يحق للطرف المُفصِح، دون الإخلال بأي حقوق أو سبل انتصاف أخرى متاحة له، طلب الانتصاف العادل بما في ذلك الأوامر القضائية والتنفيذ العيني من المحاكم العمانية المختصة.",
        "يوافق الطرف المتلقي أيضاً على تعويض الطرف المُفصِح وإبراء ذمته من وضد أي وجميع الخسائر والأضرار والتكاليف والنفقات الناشئة عن أو المرتبطة بأي انتهاك لهذه الاتفاقية.",
      ],
    },
    {
      headingEn: "11. Governing Law and Jurisdiction",
      headingAr: "11. القانون الحاكم والاختصاص القضائي",
      paragraphsEn: [
        "This Agreement shall be governed by and construed in accordance with the laws of the Sultanate of Oman, in particular the Civil Transactions Law (Royal Decree 29/2013) and Commercial Companies Law (Royal Decree 18/2019).",
        "Any dispute, controversy, or claim arising out of or relating to this Agreement, or its breach, termination, or invalidity, shall be subject to the exclusive jurisdiction of the competent courts of the Sultanate of Oman.",
      ],
      paragraphsAr: [
        "تخضع هذه الاتفاقية وتُفسَّر وفقاً لقوانين سلطنة عُمان، وعلى وجه الخصوص قانون المعاملات المدنية (المرسوم السلطاني 29/2013) وقانون الشركات التجارية (المرسوم السلطاني 18/2019).",
        "يخضع أي نزاع أو خلاف أو مطالبة تنشأ عن أو تتعلق بهذه الاتفاقية أو إخلالها أو إنهائها أو بطلانها للاختصاص القضائي الحصري للمحاكم المختصة في سلطنة عُمان.",
      ],
    },
    {
      headingEn: "12. Signatures",
      headingAr: "12. التوقيعات",
      paragraphsEn: [
        "This Agreement has been executed in two original bilingual copies, each Party retaining one copy. In case of any discrepancy between the Arabic and English versions, the Arabic version shall prevail.",
        " ",
        "PARTY A",
        "Name: {party_a_rep}",
        "Title: {party_a_title}",
        "On behalf of: {party_a_name}",
        "Signature: _________________________   Date: _________________",
        " ",
        "PARTY B",
        "Name: {party_b_rep}",
        "Title: {party_b_title}",
        "On behalf of: {party_b_name}",
        "Signature: _________________________   Date: _________________",
      ],
      paragraphsAr: [
        "تم تحرير هذه الاتفاقية من نسختين أصليتين ثنائيتي اللغة، يحتفظ كل طرف بنسخة. في حال وجود أي تعارض بين النسختين العربية والإنجليزية، تكون النسخة العربية هي السائدة.",
        " ",
        "الطرف الأول",
        "الاسم: {party_a_rep}",
        "المنصب: {party_a_title}",
        "نيابةً عن: {party_a_name}",
        "التوقيع: _________________________   التاريخ: _________________",
        " ",
        "الطرف الثاني",
        "الاسم: {party_b_rep}",
        "المنصب: {party_b_title}",
        "نيابةً عن: {party_b_name}",
        "التوقيع: _________________________   التاريخ: _________________",
      ],
    },
  ],
};
