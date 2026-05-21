
import React, { useState } from 'react';
import { FileDown, Loader2, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdf'; // Updated import path
import { setupPrintContainer } from '@/utils/print-container';
import { pdfDebugger } from '@/utils/pdf/pdfDebugger';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DownloadPDFButtonProps {
  language: "ar" | "en";
  contractData?: any;
  contractId?: string;
  className?: string;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary";
  includePassport?: boolean;
}

const DownloadPDFButton = ({ 
  language, 
  contractData,
  contractId = "default",
  className = "",
  buttonText,
  variant = "default",
  includePassport = true
}: DownloadPDFButtonProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
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
      
      // Apply critical styles for PDF export
      document.body.classList.add('printing');
      
      // Export to PDF with enhanced settings for full-page display
      await exportToPDF({
        selector: '.print-container',
        filename,
        language,
        pageFormat: 'a4', // Use A4 format
        contractData: contractData, // Pass the full contract data for passport page
        includePassport,
        debug: showDebug, // Use debug mode if enabled
        onSuccess: () => {
          document.body.classList.remove('printing');
          setIsExporting(false);
          console.log("PDF export successful");
        },
        onError: (error) => {
          document.body.classList.remove('printing');
          setIsExporting(false);
          console.error("PDF export error:", error);
          toast({
            title: language === "ar" ? "خطأ في التحميل" : "Download Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error in PDF export:", error);
      document.body.classList.remove('printing');
      setIsExporting(false);
      
      toast({
        title: language === "ar" ? "خطأ في التحميل" : "Download Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRunDiagnostics = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await pdfDebugger.diagnose();
  };

  const toggleDebugMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDebug(!showDebug);
    toast({
      title: showDebug ? "Debug Mode Disabled" : "Debug Mode Enabled",
      description: showDebug 
        ? "PDF export will run normally." 
        : "PDF export will run with extra diagnostics.",
    });
  };

  return (
    <div className="print:hidden inline-flex gap-1">
      <Button
        variant={variant}
        onClick={handleDownloadPDF}
        className={`flex gap-2 items-center ${className}`}
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
      
      {process.env.NODE_ENV === 'development' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-8 h-8 p-0" 
                onClick={toggleDebugMode}
              >
                <Bug className={`h-4 w-4 ${showDebug ? 'text-green-500' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showDebug ? 'Disable' : 'Enable'} PDF Debug Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default DownloadPDFButton;
