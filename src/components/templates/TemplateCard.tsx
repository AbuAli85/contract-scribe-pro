import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Handshake, Wrench, Laptop, Home, Users, ShoppingCart,
  Star, Lock, Download, Eye, FileText, Bell, Mail, FileX, LogOut,
  AlertTriangle, TrendingUp, Receipt, Award, Ban, FileStack,
  ClipboardList, PieChart, Combine, FileSignature, Truck, Store,
  Package, ListOrdered, Car, Stamp, Gavel, Banknote, Plane,
  ShieldCheck, Building2, DoorOpen, Key, AlertCircle, OctagonAlert,
  Check, MessageSquareWarning, Camera, Megaphone, Music, Cloud,
  Code, BadgeCheck, Building, UserCheck, Heart,
  Stethoscope, GraduationCap, UserPlus, BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { ContractTemplate } from "@/lib/templates";

interface TemplateCardProps {
  template: ContractTemplate;
  language: "ar" | "en";
  onDownload: (template: ContractTemplate) => void;
  onPreview: (template: ContractTemplate) => void;
  onRequest: (template: ContractTemplate) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase, Handshake, Wrench, Laptop, Home, Users, ShoppingCart,
  Star, Mail, FileX, LogOut, AlertTriangle, TrendingUp, Receipt,
  Award, Ban, FileStack, ClipboardList, PieChart, Combine,
  FileSignature, Truck, Store, Package, ListOrdered, FileText, Car,
  Stamp, Gavel, Banknote, Plane, ShieldCheck, Building2, DoorOpen,
  Key, AlertCircle, OctagonAlert, Check, MessageSquareWarning,
  Camera, Megaphone, Music, Cloud, Lock, Code, BadgeCheck,
  Building, UserCheck, Heart, Stethoscope, GraduationCap, UserPlus,
  BookOpen,
};

const COPY = {
  ar: {
    free: "مجاني",
    pro: "Pro",
    comingSoon: "قريباً",
    preview: "معاينة",
    download: "تنزيل مجاني",
    unlock: "افتح بـ Pro",
    request: "اطلب الآن",
  },
  en: {
    free: "Free",
    pro: "Pro",
    comingSoon: "Coming Soon",
    preview: "Preview",
    download: "Download Free",
    unlock: "Unlock with Pro",
    request: "Request It",
  },
} as const;

const TemplateCard = ({
  template,
  language,
  onDownload,
  onPreview,
  onRequest,
}: TemplateCardProps) => {
  const isAr = language === "ar";
  const t = COPY[language];
  const Icon = ICON_MAP[template.icon] ?? FileText;

  const title = isAr ? template.titleAr : template.titleEn;
  const desc = isAr ? template.descAr : template.descEn;

  const isComingSoon = template.status === "coming-soon";
  const isPro = template.status === "pro";
  const isReady = template.status === "ready";

  return (
    <Card
      className={`relative h-full flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isPro ? "border-primary/30" : ""
      } ${isComingSoon ? "border-dashed" : ""}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Status badge — top end */}
      <div className="absolute top-3 end-3 z-10">
        {isPro && (
          <Badge variant="default" className="gap-1">
            <Lock className="h-3 w-3" />
            {t.pro}
          </Badge>
        )}
        {isComingSoon && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Bell className="h-3 w-3" />
            {t.comingSoon}
          </Badge>
        )}
        {isReady && (
          <Badge variant="secondary" className="text-xs">
            {t.free}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <h3
          className={`text-base font-bold leading-tight pe-12 ${
            isAr ? "text-right" : ""
          }`}
        >
          {title}
        </h3>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-3">
        <p
          className={`text-xs text-muted-foreground leading-relaxed flex-1 ${
            isAr ? "text-right" : ""
          }`}
        >
          {desc}
        </p>

        <div className="flex gap-2 pt-1 mt-auto">
          {isReady && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onPreview(template)}
              >
                <Eye className="me-1.5 h-3.5 w-3.5" />
                {t.preview}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onDownload(template)}
              >
                <Download className="me-1.5 h-3.5 w-3.5" />
                {t.download}
              </Button>
            </>
          )}

          {isPro && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => onDownload(template)}
            >
              <Lock className="me-1.5 h-3.5 w-3.5" />
              {t.unlock}
            </Button>
          )}

          {isComingSoon && (
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              onClick={() => onRequest(template)}
            >
              <Bell className="me-1.5 h-3.5 w-3.5" />
              {t.request}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(TemplateCard);
