
import { useEffect, useState } from "react";
import { Printer, Loader2, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { documentSystem, type AttachedDocument } from "@/lib/documents";
import { useNavigate } from "react-router-dom";
import { contractService } from "@/services/contract.service";
import { printService } from "@/services/print.service";
import { setupPrintContainer, cleanupPrinting } from "@/utils/print-container";

interface PrintButtonProps {
  language: "ar" | "en";
  contractData?: any;
  selectedDocuments?: string[];
  contractId?: string;
  forceDirectPrint?: boolean;
}

const PrintButton = ({ 
  language, 
  contractData,
  selectedDocuments = ["contract"],
  contractId = "default",
  forceDirectPrint = true
}: PrintButtonProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const navigate = useNavigate();
  
  // Load documents that should be included in printing
  useEffect(() => {
    async function loadPrintDocuments() {
      if (!contractId || contractId === "default") return;
      
      setIsLoading(true);
      try {
        const docs = await documentSystem.getDocumentsForPrinting(contractId);
        setDocuments(docs);
      } catch (error) {
        console.error("Error loading documents for printing:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrintDocuments();
  }, [contractId]);
  
  // Check content visibility and prepare for printing
  useEffect(() => {
    if (!contractData) return;
    
    // Check visibility of contract elements after render
    const checkVisibility = setTimeout(() => {
      try {
        // Setup print container
        setupPrintContainer();
        
        // Pre-fix visibility issues
        printService.fixVisibility('.print-container');
        
        // Set content as ready to allow printing
        setContentReady(true);
        
        // Cleanup
        cleanupPrinting();
      } catch (error) {
        console.error("Error checking print content visibility:", error);
        // Set to true to allow printing even if validation errors occur
        setContentReady(true);
      }
    }, 500);
    
    return () => clearTimeout(checkVisibility);
  }, [contractData]);

  const handlePrintClick = () => {
    if (!contractData) {
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: language === "ar" ? "بيانات العقد مفقودة" : "Contract data is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPrinting(true);
      
      // Force setup the print container before printing
      setupPrintContainer();
      
      // Add inline print styles for maximum compatibility
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      style.textContent = `
        @media print {
          .print-container, .contract-preview, .a4-page, .contract-content {
            display: block !important;
            visibility: visible !important;
          }
          .two-column-layout {
            display: flex !important;
          }
          .letterhead-background, .contract-title, .id-photo-container, 
          .reference-section, .signature-area, .contract-column {
            display: block !important;
            visibility: visible !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `;
      document.head.appendChild(style);
      
      // Use direct print method for maximum compatibility
      setTimeout(() => {
        try {
          // Call print
          window.print();
          
          // Show success toast after a short delay
          setTimeout(() => {
            // Cleanup
            try {
              document.head.removeChild(style);
            } catch (e) {
              // Style might have been removed already
            }
            cleanupPrinting();
            setIsPrinting(false);
            
            toast({
              title: language === "ar" ? "تم إرسال الطباعة" : "Print Sent",
              description: language === "ar" ? "تم إرسال المستند إلى الطابعة" : "Document was sent to printer",
            });
          }, 1000);
        } catch (error) {
          console.error("Error in print operation:", error);
          
          try {
            document.head.removeChild(style);
          } catch (e) {
            // Style might have been removed already
          }
          cleanupPrinting();
          setIsPrinting(false);
          
          toast({
            title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        }
      }, 200);
    } catch (error) {
      console.error("Error in print button handler:", error);
      cleanupPrinting();
      setIsPrinting(false);
      
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrintClick}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting || isLoading || !contentReady}
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : !contentReady ? (
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      ) : documents.length > 0 ? (
        <FileText className="h-4 w-4" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>
        {isPrinting 
          ? (language === "ar" ? "جاري الطباعة..." : "Printing...") 
          : isLoading 
            ? (language === "ar" ? "جاري التحميل..." : "Loading...")
            : !contentReady 
              ? (language === "ar" ? "تجهيز المحتوى..." : "Preparing content...")
              : (language === "ar" ? "طباعة" : "Print")}
      </span>
      {documents.length > 0 && contentReady && (
        <span className="ml-1 text-xs">
          ({documents.length} {language === "ar" ? "مستندات" : "documents"})
        </span>
      )}
    </Button>
  );
};

export default PrintButton;
