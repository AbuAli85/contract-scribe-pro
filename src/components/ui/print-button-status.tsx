
import React from "react";
import { Printer, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface PrintButtonStatusProps {
  isPrinting: boolean;
  isLoading: boolean;
  contentReady: boolean;
  documentsCount?: number;
  language: "ar" | "en";
  errorMessage?: string;
}

export function PrintButtonStatus({
  isPrinting,
  isLoading,
  contentReady,
  documentsCount = 0,
  language,
  errorMessage
}: PrintButtonStatusProps) {
  // Check if the error is related to UUID validation
  const isUuidError = errorMessage && 
    (errorMessage.includes('UUID') || errorMessage.includes('contract ID'));
  
  // Don't render the icon if we're in an error state
  if (!contentReady && !isLoading && !isPrinting) {
    return (
      <>
        <AlertCircle className="h-4 w-4 text-destructive" />
        {isUuidError 
          ? (language === "ar" ? "معرف غير صالح" : "Invalid ID") 
          : (language === "ar" ? "خطأ" : "Error")}
      </>
    );
  }

  // If printing is in progress, show the loader
  if (isPrinting) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {language === "ar" ? "جارٍ الطباعة..." : "Printing..."}
      </>
    );
  }

  // If data is loading, show a loader
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
      </>
    );
  }

  // Default print button state
  return (
    <>
      <Printer className="h-4 w-4" />
      {language === "ar" ? "طباعة" : "Print"}
    </>
  );
}
