
import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfExport';
import { setupPrintContainer } from '@/utils/print-container';

interface DownloadPDFButtonProps {
  language: "ar" | "en";
  contractData?: any;
  contractId?: string;
  className?: string;
  buttonText?: string;
}

const DownloadPDFButton = ({ 
  language, 
  contractData,
  contractId = "default",
  className = "",
  buttonText
}: DownloadPDFButtonProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  const handleDownloadPDF = async () => {
    if (!contractData) {
      toast({
        title: language === "ar" ? "خطأ في التحميل" : "Download Error",
        description: language === "ar" ? "بيانات العقد مفقودة" : "Contract data is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Ensure print container exists
      setupPrintContainer();
      
      // Generate filename based on contract data
      const filename = `contract-${contractId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Export to PDF
      await exportToPDF({
        selector: '.print-container',
        filename,
        language,
        onSuccess: () => {
          setIsExporting(false);
        },
        onError: (error) => {
          setIsExporting(false);
          toast({
            title: language === "ar" ? "خطأ في التحميل" : "Download Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error in PDF export:", error);
      setIsExporting(false);
      
      toast({
        title: language === "ar" ? "خطأ في التحميل" : "Download Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="default"
      onClick={handleDownloadPDF}
      className={`print:hidden flex gap-2 items-center ${className}`}
      disabled={isExporting || !contractData}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      <span>
        {isExporting 
          ? (language === "ar" ? "جاري التحميل..." : "Exporting...") 
          : buttonText || (language === "ar" ? "تحميل PDF" : "Download PDF")}
      </span>
    </Button>
  );
};

export default DownloadPDFButton;
