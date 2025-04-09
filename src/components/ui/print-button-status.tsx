
import React from "react";
import { Printer, Loader2, AlertTriangle, FileText } from "lucide-react";

interface PrintButtonStatusProps {
  isPrinting: boolean;
  isLoading: boolean;
  contentReady: boolean;
  documentsCount: number;
  language: "ar" | "en";
}

export function PrintButtonStatus({
  isPrinting,
  isLoading,
  contentReady,
  documentsCount,
  language
}: PrintButtonStatusProps) {
  if (isPrinting) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{language === "ar" ? "جاري الطباعة..." : "Printing..."}</span>
      </>
    );
  }
  
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
      </>
    );
  }
  
  if (!contentReady) {
    return (
      <>
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <span>{language === "ar" ? "تجهيز المحتوى..." : "Preparing content..."}</span>
      </>
    );
  }

  return (
    <>
      {documentsCount > 0 ? (
        <FileText className="h-4 w-4" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>
        {language === "ar" ? "طباعة" : "Print"}
      </span>
      {documentsCount > 0 && (
        <span className="ml-1 text-xs">
          ({documentsCount} {language === "ar" ? "مستندات" : "documents"})
        </span>
      )}
    </>
  );
}
