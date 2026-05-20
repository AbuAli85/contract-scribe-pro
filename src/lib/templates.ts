// Free contract template library — lead magnet content
// Each template is the TOFU asset that captures email leads via EmailGateModal.
// PDFs should live in /public/templates/<id>.pdf and previews in /public/templates/previews/<id>.pdf

export type TemplateCategory =
  | "Employment"
  | "Confidentiality"
  | "Services"
  | "Freelance"
  | "Tenancy"
  | "Partnership"
  | "Sales"
  | "HR Bundle";

export interface ContractTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  category: TemplateCategory;
  /** lucide-react icon name (rendered dynamically in TemplateCard) */
  icon: string;
  /** isPro = locked; clicking opens upgrade modal instead of email gate */
  isPro: boolean;
  /** Public path relative to /public (e.g. /templates/employment.pdf) */
  pdfUrl: string;
  /** Optional preview path; falls back to pdfUrl if absent */
  previewUrl?: string;
  /** Optional demand hint shown on card */
  demand?: string;
}

export const TEMPLATES: ContractTemplate[] = [
  {
    id: "employment",
    titleEn: "Employment Contract",
    titleAr: "عقد عمل",
    descEn:
      "Full Oman Labour Law compliant. Probation, notice period, OT terms, annual leave (per RD 35/2003). Bilingual.",
    descAr:
      "متوافق بالكامل مع قانون العمل العماني. فترة التجربة، فترة الإشعار، شروط العمل الإضافي، الإجازة السنوية (وفقاً للمرسوم السلطاني 35/2003). ثنائي اللغة.",
    category: "Employment",
    icon: "Briefcase",
    isPro: false,
    pdfUrl: "/templates/employment.pdf",
    demand: "Highest demand",
  },
  {
    id: "nda",
    titleEn: "NDA / Confidentiality Agreement",
    titleAr: "اتفاقية سرية",
    descEn:
      "Mutual and one-way variants. Covers trade secrets, IP, and client data. Aligned with Omani Commercial Law.",
    descAr:
      "نسخ متبادلة وأحادية الاتجاه. تغطي الأسرار التجارية والملكية الفكرية وبيانات العملاء. متوافقة مع القانون التجاري العماني.",
    category: "Confidentiality",
    icon: "Handshake",
    isPro: false,
    pdfUrl: "/templates/nda.pdf",
  },
  {
    id: "service-agreement",
    titleEn: "Service Agreement",
    titleAr: "عقد خدمات",
    descEn:
      "B2B service delivery contract. Deliverables, payment terms, IP ownership, and termination clauses.",
    descAr:
      "عقد تقديم خدمات بين الشركات. التسليمات وشروط الدفع وملكية الملكية الفكرية وبنود الإنهاء.",
    category: "Services",
    icon: "Wrench",
    isPro: false,
    pdfUrl: "/templates/service-agreement.pdf",
  },
  {
    id: "freelance",
    titleEn: "Freelance Contract",
    titleAr: "عقد عمل حر",
    descEn:
      "For individual contractors. Scope of work, milestones, revision policy, and ownership of work product.",
    descAr:
      "للمتعاقدين الأفراد. نطاق العمل ومراحل الدفع وسياسة المراجعة وملكية المنتج النهائي.",
    category: "Freelance",
    icon: "Laptop",
    isPro: false,
    pdfUrl: "/templates/freelance.pdf",
  },
  {
    id: "tenancy",
    titleEn: "Tenancy Agreement",
    titleAr: "عقد إيجار",
    descEn:
      "Residential and commercial variants. Aligned with Oman Tenancy Law. Rent, deposit, maintenance, renewal.",
    descAr:
      "نسخ سكنية وتجارية. متوافقة مع قانون الإيجار العماني. الإيجار والوديعة والصيانة والتجديد.",
    category: "Tenancy",
    icon: "Home",
    isPro: false,
    pdfUrl: "/templates/tenancy.pdf",
  },
  {
    id: "partnership",
    titleEn: "Partnership Agreement",
    titleAr: "عقد شراكة",
    descEn:
      "Business partnership terms, profit/loss sharing, capital, decision-making, and exit. Omani Commercial Companies Law aligned.",
    descAr:
      "شروط شراكة الأعمال وتقاسم الأرباح/الخسائر ورأس المال وصنع القرار والخروج. متوافق مع قانون الشركات التجارية العماني.",
    category: "Partnership",
    icon: "Users",
    isPro: false,
    pdfUrl: "/templates/partnership.pdf",
  },
  {
    id: "sales-purchase",
    titleEn: "Sales & Purchase Agreement",
    titleAr: "عقد بيع وشراء",
    descEn:
      "Goods and asset transfer. Price, delivery, warranties, payment, and dispute resolution.",
    descAr:
      "نقل البضائع والأصول. السعر والتسليم والضمانات والدفع وحل النزاعات.",
    category: "Sales",
    icon: "ShoppingCart",
    isPro: false,
    pdfUrl: "/templates/sales-purchase.pdf",
  },
  {
    id: "hr-bundle",
    titleEn: "Full HR Policy Bundle",
    titleAr: "حزمة سياسات الموارد البشرية",
    descEn:
      "Employee Handbook, Disciplinary Policy, Leave Policy, and Code of Conduct. Pro feature — unlock with subscription.",
    descAr:
      "دليل الموظف وسياسة التأديب وسياسة الإجازات ومدونة قواعد السلوك. ميزة Pro - افتح بالاشتراك.",
    category: "HR Bundle",
    icon: "Star",
    isPro: true,
    pdfUrl: "/templates/hr-bundle.pdf",
    demand: "Pro upgrade trigger",
  },
];

export const getTemplateById = (id: string): ContractTemplate | undefined =>
  TEMPLATES.find((t) => t.id === id);
