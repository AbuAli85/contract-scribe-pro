import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Handshake,
  Wrench,
  Laptop,
  Home,
  Users,
  ShoppingCart,
  Star,
  Lock,
  Download,
  Eye,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { ContractTemplate } from "@/lib/templates";

interface TemplateCardProps {
  template: ContractTemplate;
  language: "ar" | "en";
  onDownload: (template: ContractTemplate) => void;
  onPreview: (template: ContractTemplate) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Handshake,
  Wrench,
  Laptop,
  Home,
  Users,
  ShoppingCart,
  Star,
};

const COPY = {
  ar: {
    free: "مجاني",
    pro: "Pro",
    preview: "معاينة",
    download: "تنزيل مجاني",
    unlock: "افتح بـ Pro",
  },
  en: {
    free: "Free",
    pro: "Pro",
    preview: "Preview",
    download: "Download Free",
    unlock: "Unlock with Pro",
  },
} as const;

const TemplateCard = ({
  template,
  language,
  onDownload,
  onPreview,
}: TemplateCardProps) => {
  const isAr = language === "ar";
  const t = COPY[language];
  const Icon = ICON_MAP[template.icon] ?? FileText;

  const title = isAr ? template.titleAr : template.titleEn;
  const desc = isAr ? template.descAr : template.descEn;

  return (
    <Card
      className={`relative h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        template.isPro ? "border-primary/30" : ""
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {template.isPro && (
        <div className="absolute top-3 end-3 z-10">
          <Badge variant="default" className="gap-1">
            <Lock className="h-3 w-3" />
            {t.pro}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-6 w-6" />
          </div>
          {!template.isPro && (
            <Badge variant="secondary" className="text-xs">
              {t.free}
            </Badge>
          )}
        </div>
        <h3 className={`text-lg font-bold leading-tight pt-2 ${isAr ? "text-right" : ""}`}>
          {title}
        </h3>
        <Badge variant="outline" className="w-fit text-xs font-normal">
          {template.category}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        <p
          className={`text-sm text-muted-foreground leading-relaxed flex-1 ${
            isAr ? "text-right" : ""
          }`}
        >
          {desc}
        </p>

        <div className="flex gap-2 pt-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPreview(template)}
            disabled={template.isPro}
          >
            <Eye className="me-1.5 h-4 w-4" />
            {t.preview}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onDownload(template)}
            variant={template.isPro ? "default" : "default"}
          >
            {template.isPro ? (
              <>
                <Lock className="me-1.5 h-4 w-4" />
                {t.unlock}
              </>
            ) : (
              <>
                <Download className="me-1.5 h-4 w-4" />
                {t.download}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
