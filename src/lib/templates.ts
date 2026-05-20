// =============================================================
// Template Catalog
//
// The full bilingual document library. Templates are organized by
// category. Each template has a `status`:
//
//   - "ready"        : Full bilingual content authored (downloads instantly)
//   - "coming-soon"  : Listed in the catalog but not yet authored.
//                      Clicking it captures a request into Supabase
//                      template_requests and tells the user we'll
//                      build it. Pure demand signal.
//   - "pro"          : Locked behind Pro subscription
//
// New templates: add to the appropriate CategoryGroup below. The
// catalog UI groups by `category`. The Templates page renders one
// section per CategoryGroup.
// =============================================================

export type TemplateStatus = "ready" | "coming-soon" | "pro";

export type TemplateCategory =
  | "Employment & HR"
  | "Business Agreements"
  | "Sales & Vendors"
  | "Personal & Family"
  | "Real Estate"
  | "Letters & Notices"
  | "Freelance & Creative"
  | "Technology & SaaS"
  | "Government & Compliance"
  | "Healthcare"
  | "Education"
  | "HR Bundle";

export interface ContractTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  category: TemplateCategory;
  /** lucide-react icon name */
  icon: string;
  status: TemplateStatus;
  /** isPro is a convenience flag derived from status === "pro" */
  isPro: boolean;
  pdfUrl?: string;
  previewUrl?: string;
  /** Optional demand hint shown on card */
  demand?: string;
}

// ── Shared blank slot helpers ────────────────────────────────────
const comingSoon = (
  id: string,
  titleEn: string,
  titleAr: string,
  descEn: string,
  descAr: string,
  category: TemplateCategory,
  icon: string
): ContractTemplate => ({
  id,
  titleEn,
  titleAr,
  descEn,
  descAr,
  category,
  icon,
  status: "coming-soon",
  isPro: false,
});

// ── The Full Catalog ─────────────────────────────────────────────
export const TEMPLATES: ContractTemplate[] = [
  // ───────────── EMPLOYMENT & HR ─────────────
  {
    id: "employment",
    titleEn: "Employment Contract",
    titleAr: "عقد عمل",
    descEn:
      "Full Oman Labour Law compliant. Probation, notice period, OT, annual leave (per RD 35/2003).",
    descAr:
      "متوافق بالكامل مع قانون العمل العماني. فترة التجربة، فترة الإشعار، العمل الإضافي، الإجازة السنوية.",
    category: "Employment & HR",
    icon: "Briefcase",
    status: "ready",
    isPro: false,
    demand: "Most popular",
  },
  comingSoon(
    "offer-letter",
    "Job Offer Letter",
    "خطاب عرض عمل",
    "Formal offer with salary, start date, benefits, and acceptance signature line.",
    "عرض رسمي مع الراتب وتاريخ البدء والمزايا وسطر التوقيع للقبول.",
    "Employment & HR",
    "Mail"
  ),
  comingSoon(
    "termination-letter",
    "Termination Letter",
    "خطاب إنهاء الخدمة",
    "Bilingual notice of termination with grounds, final settlement, and notice period.",
    "إشعار إنهاء الخدمة ثنائي اللغة مع الأسباب والتسوية النهائية وفترة الإشعار.",
    "Employment & HR",
    "FileX"
  ),
  comingSoon(
    "resignation-letter",
    "Resignation Letter",
    "خطاب استقالة",
    "Employee-side resignation letter with notice period and handover terms.",
    "خطاب استقالة من الموظف مع فترة الإشعار وشروط التسليم.",
    "Employment & HR",
    "LogOut"
  ),
  comingSoon(
    "warning-letter",
    "Disciplinary Warning Letter",
    "خطاب إنذار تأديبي",
    "Formal warning for misconduct or performance issues — bilingual, signed acknowledgement.",
    "إنذار رسمي لسوء السلوك أو مشاكل الأداء — ثنائي اللغة مع إقرار موقّع.",
    "Employment & HR",
    "AlertTriangle"
  ),
  comingSoon(
    "promotion-letter",
    "Promotion Letter",
    "خطاب ترقية",
    "Promotion notification with new title, salary, effective date, and revised duties.",
    "إشعار ترقية مع المسمى الجديد والراتب وتاريخ السريان والمهام المعدلة.",
    "Employment & HR",
    "TrendingUp"
  ),
  comingSoon(
    "salary-certificate",
    "Salary Certificate",
    "شهادة راتب",
    "Official salary certificate for bank, embassy, or government use.",
    "شهادة راتب رسمية للاستخدام في البنوك أو السفارات أو الجهات الحكومية.",
    "Employment & HR",
    "Receipt"
  ),
  comingSoon(
    "experience-letter",
    "Experience / Reference Letter",
    "شهادة خبرة",
    "Employer-issued letter confirming employment duration, role, and conduct.",
    "خطاب من صاحب العمل يؤكد مدة العمل والمنصب والسلوك.",
    "Employment & HR",
    "Award"
  ),
  comingSoon(
    "non-compete",
    "Non-Compete Agreement",
    "اتفاقية عدم منافسة",
    "Restricts employee from joining competitors for a defined period after exit.",
    "تمنع الموظف من الانضمام إلى المنافسين لفترة محددة بعد ترك العمل.",
    "Employment & HR",
    "Ban"
  ),

  // ───────────── BUSINESS AGREEMENTS ─────────────
  {
    id: "nda",
    titleEn: "NDA / Confidentiality Agreement",
    titleAr: "اتفاقية سرية",
    descEn:
      "Mutual and one-way variants. Covers trade secrets, IP, and client data.",
    descAr:
      "نسخ متبادلة وأحادية الاتجاه. تغطي الأسرار التجارية والملكية الفكرية وبيانات العملاء.",
    category: "Business Agreements",
    icon: "Handshake",
    status: "ready",
    isPro: false,
  },
  {
    id: "service-agreement",
    titleEn: "Service Agreement",
    titleAr: "عقد خدمات",
    descEn:
      "B2B service delivery contract. Deliverables, payment terms, IP, termination.",
    descAr:
      "عقد تقديم خدمات بين الشركات. التسليمات وشروط الدفع والملكية الفكرية والإنهاء.",
    category: "Business Agreements",
    icon: "Wrench",
    status: "ready",
    isPro: false,
  },
  {
    id: "partnership",
    titleEn: "Partnership Agreement",
    titleAr: "عقد شراكة",
    descEn:
      "Partnership terms, profit/loss sharing, capital, decision-making, and exit.",
    descAr:
      "شروط الشراكة وتقاسم الأرباح/الخسائر ورأس المال وصنع القرار والخروج.",
    category: "Business Agreements",
    icon: "Users",
    status: "ready",
    isPro: false,
  },
  comingSoon(
    "msa",
    "Master Services Agreement (MSA)",
    "اتفاقية الخدمات الرئيسية",
    "Umbrella agreement governing all future SOWs and engagements with a vendor or client.",
    "اتفاقية إطارية تحكم جميع بيانات العمل المستقبلية مع المورد أو العميل.",
    "Business Agreements",
    "FileStack"
  ),
  comingSoon(
    "sow",
    "Statement of Work (SOW)",
    "بيان العمل",
    "Specific project scope, deliverables, milestones, and pricing — sits under an MSA.",
    "نطاق المشروع المحدد والتسليمات والمراحل والتسعير — يقع تحت اتفاقية MSA.",
    "Business Agreements",
    "ClipboardList"
  ),
  comingSoon(
    "shareholders",
    "Shareholders Agreement",
    "اتفاقية المساهمين",
    "Governance, vesting, transfer restrictions, board composition, drag/tag-along rights.",
    "الحوكمة، الاستحقاق، قيود النقل، تشكيل المجلس، حقوق السحب والمشاركة.",
    "Business Agreements",
    "PieChart"
  ),
  comingSoon(
    "joint-venture",
    "Joint Venture Agreement",
    "اتفاقية مشروع مشترك",
    "Two parties forming a JV: capital, profit split, management, exit, dispute terms.",
    "طرفان يشكلان مشروعاً مشتركاً: رأس المال، توزيع الأرباح، الإدارة، الخروج، النزاعات.",
    "Business Agreements",
    "Combine"
  ),
  comingSoon(
    "loi",
    "Letter of Intent (LOI)",
    "خطاب نوايا",
    "Non-binding preliminary terms for an acquisition, investment, or major deal.",
    "شروط أولية غير ملزمة لعملية استحواذ أو استثمار أو صفقة كبرى.",
    "Business Agreements",
    "FileSignature"
  ),
  comingSoon(
    "distribution",
    "Distribution / Reseller Agreement",
    "اتفاقية توزيع",
    "Territory, exclusivity, pricing, marketing obligations, and termination.",
    "المنطقة، الحصرية، التسعير، التزامات التسويق، والإنهاء.",
    "Business Agreements",
    "Truck"
  ),
  comingSoon(
    "franchise",
    "Franchise Agreement",
    "اتفاقية امتياز",
    "Franchise rights, royalties, brand use, territory, and renewal terms.",
    "حقوق الامتياز، الإتاوات، استخدام العلامة التجارية، المنطقة، وشروط التجديد.",
    "Business Agreements",
    "Store"
  ),

  // ───────────── SALES & VENDORS ─────────────
  {
    id: "sales-purchase",
    titleEn: "Sales & Purchase Agreement",
    titleAr: "عقد بيع وشراء",
    descEn:
      "Goods and asset transfer. Price, delivery, warranties, payment, dispute resolution.",
    descAr:
      "نقل البضائع والأصول. السعر، التسليم، الضمانات، الدفع، وحل النزاعات.",
    category: "Sales & Vendors",
    icon: "ShoppingCart",
    status: "ready",
    isPro: false,
  },
  comingSoon(
    "vendor-agreement",
    "Vendor Agreement",
    "اتفاقية مورد",
    "B2B procurement terms: pricing, delivery SLAs, payment, liability, termination.",
    "شروط الشراء بين الشركات: التسعير، اتفاقيات مستوى الخدمة للتسليم، الدفع، المسؤولية.",
    "Sales & Vendors",
    "Package"
  ),
  comingSoon(
    "purchase-order",
    "Purchase Order Template",
    "نموذج طلب شراء",
    "Bilingual PO form with line items, totals, delivery, and payment terms.",
    "نموذج طلب شراء ثنائي اللغة مع البنود والمجاميع والتسليم وشروط الدفع.",
    "Sales & Vendors",
    "ListOrdered"
  ),
  comingSoon(
    "quotation",
    "Quotation / Proforma Invoice",
    "عرض سعر / فاتورة مبدئية",
    "Formal price quote with validity period, payment terms, and terms & conditions.",
    "عرض سعر رسمي مع فترة الصلاحية وشروط الدفع والأحكام والشروط.",
    "Sales & Vendors",
    "FileText"
  ),
  comingSoon(
    "bill-of-sale",
    "Bill of Sale",
    "وثيقة بيع",
    "Transfer of ownership for vehicles, equipment, or other movable assets.",
    "نقل ملكية المركبات أو المعدات أو الأصول المنقولة الأخرى.",
    "Sales & Vendors",
    "Car"
  ),

  // ───────────── PERSONAL & FAMILY ─────────────
  comingSoon(
    "power-of-attorney",
    "Power of Attorney",
    "وكالة قانونية",
    "Grant authority to another person to act on your behalf — general or specific.",
    "منح شخص آخر سلطة التصرف نيابة عنك — عامة أو خاصة.",
    "Personal & Family",
    "Stamp"
  ),
  comingSoon(
    "affidavit",
    "Affidavit / Sworn Statement",
    "إقرار / شهادة قسم",
    "Sworn declaration of facts for use in courts, embassies, or government bodies.",
    "إعلان تحت القسم بالحقائق للاستخدام في المحاكم أو السفارات أو الجهات الحكومية.",
    "Personal & Family",
    "Gavel"
  ),
  comingSoon(
    "loan-personal",
    "Personal Loan Agreement",
    "اتفاقية قرض شخصي",
    "Loan between individuals or family members: amount, interest, repayment, default.",
    "قرض بين الأفراد أو أفراد العائلة: المبلغ، الفائدة، السداد، التعثر.",
    "Personal & Family",
    "Banknote"
  ),
  comingSoon(
    "permission-travel",
    "Travel Consent (for Minor)",
    "موافقة سفر للقاصر",
    "Parental consent letter authorizing minor's travel with another adult.",
    "خطاب موافقة الوالدين يأذن بسفر القاصر مع شخص بالغ آخر.",
    "Personal & Family",
    "Plane"
  ),
  comingSoon(
    "sponsorship-letter",
    "Sponsorship / NOC Letter",
    "خطاب كفالة / عدم ممانعة",
    "Sponsorship letter for visa, employment, or government filings in Oman.",
    "خطاب كفالة للتأشيرة أو العمل أو الإجراءات الحكومية في عُمان.",
    "Personal & Family",
    "ShieldCheck"
  ),

  // ───────────── REAL ESTATE ─────────────
  {
    id: "tenancy",
    titleEn: "Residential Tenancy Agreement",
    titleAr: "عقد إيجار سكني",
    descEn:
      "Aligned with Oman Tenancy Law. Rent, deposit, maintenance, renewal terms.",
    descAr:
      "متوافق مع قانون الإيجار العماني. الإيجار، الوديعة، الصيانة، شروط التجديد.",
    category: "Real Estate",
    icon: "Home",
    status: "ready",
    isPro: false,
    demand: "High demand in Muscat",
  },
  comingSoon(
    "commercial-lease",
    "Commercial Lease Agreement",
    "عقد إيجار تجاري",
    "Commercial property lease: rent, term, use restrictions, fit-out, renewal.",
    "إيجار عقار تجاري: الإيجار، المدة، قيود الاستخدام، التجهيزات، التجديد.",
    "Real Estate",
    "Building2"
  ),
  comingSoon(
    "sublease",
    "Sublease Agreement",
    "اتفاقية إيجار فرعي",
    "Tenant subletting all or part of a leased property to a third party.",
    "المستأجر يؤجر كل أو جزءاً من العقار المستأجر لطرف ثالث.",
    "Real Estate",
    "DoorOpen"
  ),
  comingSoon(
    "property-sale",
    "Property Sale Agreement",
    "اتفاقية بيع عقار",
    "Sale of real estate: price, deposit, transfer of title, conditions precedent.",
    "بيع العقارات: السعر، الوديعة، نقل الملكية، الشروط الأولية.",
    "Real Estate",
    "Key"
  ),
  comingSoon(
    "property-management",
    "Property Management Agreement",
    "اتفاقية إدارة عقارية",
    "Owner appoints a manager to operate property: scope, fees, reporting, term.",
    "المالك يعين مديراً لتشغيل العقار: النطاق، الرسوم، التقارير، المدة.",
    "Real Estate",
    "Briefcase"
  ),

  // ───────────── LETTERS & NOTICES ─────────────
  comingSoon(
    "demand-letter",
    "Demand Letter",
    "خطاب مطالبة",
    "Formal demand for payment or action before initiating legal proceedings.",
    "مطالبة رسمية بالدفع أو الإجراء قبل بدء الإجراءات القانونية.",
    "Letters & Notices",
    "AlertCircle"
  ),
  comingSoon(
    "cease-desist",
    "Cease and Desist Letter",
    "خطاب إيقاف وكف",
    "Demand the recipient stop a specific activity (IP infringement, harassment, etc.).",
    "مطالبة المتلقي بإيقاف نشاط معين (انتهاك الملكية الفكرية، التحرش، إلخ).",
    "Letters & Notices",
    "OctagonAlert"
  ),
  comingSoon(
    "authorization-letter",
    "Authorization Letter",
    "خطاب تفويض",
    "Authorize a third party to collect documents, sign on your behalf, or act for you.",
    "تفويض طرف ثالث لاستلام المستندات أو التوقيع نيابة عنك.",
    "Letters & Notices",
    "Check"
  ),
  comingSoon(
    "complaint-letter",
    "Formal Complaint Letter",
    "خطاب شكوى رسمي",
    "Lodge a complaint with a business, regulator, or authority — clear facts and remedy.",
    "تقديم شكوى ضد شركة أو جهة تنظيمية أو سلطة — حقائق واضحة وطلب التصحيح.",
    "Letters & Notices",
    "MessageSquareWarning"
  ),
  comingSoon(
    "recommendation-letter",
    "Recommendation Letter",
    "خطاب توصية",
    "Professional recommendation for employee, student, or service provider.",
    "توصية مهنية لموظف أو طالب أو مقدم خدمة.",
    "Letters & Notices",
    "Star"
  ),

  // ───────────── FREELANCE & CREATIVE ─────────────
  {
    id: "freelance",
    titleEn: "Freelance Contract",
    titleAr: "عقد عمل حر",
    descEn:
      "For individual contractors. Scope, milestones, revisions, IP ownership.",
    descAr:
      "للمتعاقدين الأفراد. النطاق، المراحل، المراجعات، ملكية الملكية الفكرية.",
    category: "Freelance & Creative",
    icon: "Laptop",
    status: "ready",
    isPro: false,
  },
  comingSoon(
    "photo-release",
    "Photography / Model Release",
    "إقرار تصوير / نموذج",
    "Subject grants photographer rights to use images for commercial or editorial use.",
    "الموضوع يمنح المصور حقوق استخدام الصور للأغراض التجارية أو التحريرية.",
    "Freelance & Creative",
    "Camera"
  ),
  comingSoon(
    "influencer",
    "Influencer Marketing Agreement",
    "اتفاقية تسويق عبر المؤثرين",
    "Brand-influencer contract: deliverables, exclusivity, content rights, payment.",
    "عقد بين العلامة والمؤثر: التسليمات، الحصرية، حقوق المحتوى، الدفع.",
    "Freelance & Creative",
    "Megaphone"
  ),
  comingSoon(
    "music-license",
    "Music / Content License",
    "ترخيص موسيقى / محتوى",
    "License creative works for use in films, ads, products, or platforms.",
    "ترخيص الأعمال الإبداعية للاستخدام في الأفلام والإعلانات والمنتجات والمنصات.",
    "Freelance & Creative",
    "Music"
  ),

  // ───────────── TECHNOLOGY & SAAS ─────────────
  comingSoon(
    "saas-agreement",
    "SaaS Subscription Agreement",
    "اتفاقية اشتراك SaaS",
    "Software-as-a-service terms: license scope, SLA, data, fees, termination.",
    "شروط الاشتراك في برنامج كخدمة: نطاق الترخيص، اتفاقية مستوى الخدمة، البيانات.",
    "Technology & SaaS",
    "Cloud"
  ),
  comingSoon(
    "dpa",
    "Data Processing Agreement (DPA)",
    "اتفاقية معالجة البيانات",
    "Controller-processor terms aligned with global privacy standards.",
    "شروط المتحكم-المعالج متوافقة مع معايير الخصوصية العالمية.",
    "Technology & SaaS",
    "ShieldCheck"
  ),
  comingSoon(
    "privacy-policy",
    "Privacy Policy",
    "سياسة الخصوصية",
    "Website / app privacy policy disclosing what data is collected and how it's used.",
    "سياسة الخصوصية للموقع / التطبيق تكشف ما يتم جمعه من بيانات وكيفية استخدامها.",
    "Technology & SaaS",
    "Lock"
  ),
  comingSoon(
    "terms-of-service",
    "Terms of Service",
    "شروط الخدمة",
    "User-facing terms for a website, mobile app, or online service.",
    "شروط مواجهة المستخدم لموقع ويب أو تطبيق جوال أو خدمة عبر الإنترنت.",
    "Technology & SaaS",
    "FileText"
  ),
  comingSoon(
    "software-dev",
    "Software Development Agreement",
    "اتفاقية تطوير برمجيات",
    "Custom development engagement: scope, milestones, IP, acceptance, warranty.",
    "تطوير مخصص: النطاق، المراحل، الملكية الفكرية، القبول، الضمان.",
    "Technology & SaaS",
    "Code"
  ),

  // ───────────── GOVERNMENT & COMPLIANCE (OMAN) ─────────────
  comingSoon(
    "noc-rop",
    "ROP NOC Letter",
    "خطاب عدم ممانعة لشرطة عُمان السلطانية",
    "No Objection Certificate addressed to Royal Oman Police for vehicle/visa/permit.",
    "شهادة عدم ممانعة موجهة إلى شرطة عُمان السلطانية للمركبة/التأشيرة/التصريح.",
    "Government & Compliance",
    "BadgeCheck"
  ),
  comingSoon(
    "noc-employment",
    "Employment NOC Letter",
    "خطاب عدم ممانعة من صاحب العمل",
    "Employer NOC for employee visa renewal, second job, or family sponsorship.",
    "عدم ممانعة من صاحب العمل لتجديد تأشيرة الموظف أو وظيفة ثانية أو كفالة عائلية.",
    "Government & Compliance",
    "Building"
  ),
  comingSoon(
    "visa-sponsorship",
    "Visa Sponsorship Letter",
    "خطاب كفالة تأشيرة",
    "Formal sponsorship letter for family visa or domestic worker visa applications.",
    "خطاب كفالة رسمي لطلبات تأشيرة العائلة أو العامل المنزلي.",
    "Government & Compliance",
    "UserCheck"
  ),
  comingSoon(
    "trade-license",
    "Trade License Application Letter",
    "خطاب طلب رخصة تجارية",
    "Letter to MOCIIP requesting issuance or amendment of a commercial registration.",
    "خطاب إلى وزارة التجارة لطلب إصدار أو تعديل السجل التجاري.",
    "Government & Compliance",
    "Briefcase"
  ),

  // ───────────── HEALTHCARE ─────────────
  comingSoon(
    "patient-consent",
    "Patient Consent Form",
    "نموذج موافقة المريض",
    "Informed consent for medical procedures, data sharing, or telehealth.",
    "موافقة مستنيرة على الإجراءات الطبية أو مشاركة البيانات أو الصحة عن بُعد.",
    "Healthcare",
    "Heart"
  ),
  comingSoon(
    "locum-doctor",
    "Locum Doctor Agreement",
    "اتفاقية طبيب مناوب",
    "Short-term locum tenens engagement: hours, rate, scope, malpractice cover.",
    "ارتباط طبيب مناوب قصير الأجل: الساعات، السعر، النطاق، تغطية سوء الممارسة.",
    "Healthcare",
    "Stethoscope"
  ),

  // ───────────── EDUCATION ─────────────
  comingSoon(
    "student-enrollment",
    "Student Enrollment Agreement",
    "اتفاقية تسجيل طالب",
    "School or training program enrollment: fees, schedule, withdrawal, code of conduct.",
    "تسجيل في مدرسة أو برنامج تدريبي: الرسوم، الجدول، الانسحاب، قواعد السلوك.",
    "Education",
    "GraduationCap"
  ),
  comingSoon(
    "internship-agreement",
    "Internship Agreement",
    "اتفاقية تدريب",
    "Internship terms: duration, stipend (if any), supervision, completion certificate.",
    "شروط التدريب: المدة، المكافأة (إن وجدت)، الإشراف، شهادة الإتمام.",
    "Education",
    "UserPlus"
  ),
  comingSoon(
    "tutor-agreement",
    "Tutor / Coach Agreement",
    "اتفاقية مدرس / مدرب خاص",
    "Private tutoring or coaching engagement: rate, scheduling, cancellation policy.",
    "تدريس خاص أو تدريب: السعر، الجدولة، سياسة الإلغاء.",
    "Education",
    "BookOpen"
  ),

  // ───────────── HR BUNDLE (Pro) ─────────────
  {
    id: "hr-bundle",
    titleEn: "Full HR Policy Bundle",
    titleAr: "حزمة سياسات الموارد البشرية",
    descEn:
      "Employee Handbook, Disciplinary, Leave Policy, Code of Conduct. Pro feature.",
    descAr:
      "دليل الموظف، سياسة التأديب، سياسة الإجازات، مدونة قواعد السلوك. ميزة Pro.",
    category: "HR Bundle",
    icon: "Star",
    status: "pro",
    isPro: true,
    demand: "Pro upgrade trigger",
  },
];

export const getTemplateById = (id: string): ContractTemplate | undefined =>
  TEMPLATES.find((t) => t.id === id);

/** Templates grouped by category, in display order */
export const TEMPLATES_BY_CATEGORY: { category: TemplateCategory; items: ContractTemplate[] }[] = (() => {
  const order: TemplateCategory[] = [
    "Employment & HR",
    "Business Agreements",
    "Sales & Vendors",
    "Real Estate",
    "Personal & Family",
    "Letters & Notices",
    "Freelance & Creative",
    "Technology & SaaS",
    "Government & Compliance",
    "Healthcare",
    "Education",
    "HR Bundle",
  ];
  return order
    .map((category) => ({
      category,
      items: TEMPLATES.filter((t) => t.category === category),
    }))
    .filter((g) => g.items.length > 0);
})();

/** Counts for hero/social-proof copy */
export const CATALOG_STATS = {
  total: TEMPLATES.length,
  ready: TEMPLATES.filter((t) => t.status === "ready").length,
  comingSoon: TEMPLATES.filter((t) => t.status === "coming-soon").length,
  pro: TEMPLATES.filter((t) => t.status === "pro").length,
  categories: new Set(TEMPLATES.map((t) => t.category)).size,
};
