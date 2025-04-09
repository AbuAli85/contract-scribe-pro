
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { documentSystem, type AttachedDocument } from "@/lib/documents";
import { setupPrintContainer, cleanupPrinting } from "@/utils/print-container";
import { printService } from "@/services/print.service";

interface UsePrintButtonOptions {
  contractId?: string;
  contractData?: any;
  language: "ar" | "en";
  selectedDocuments?: string[];
  forceDirectPrint?: boolean;
}

export function usePrintButton({
  contractId = "default",
  contractData,
  language,
  selectedDocuments = ["contract"],
  forceDirectPrint = true
}: UsePrintButtonOptions) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  
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

  const handlePrint = () => {
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

  return {
    documents,
    isLoading,
    isPrinting,
    contentReady,
    handlePrint
  };
}
