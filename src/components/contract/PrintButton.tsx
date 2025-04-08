
import { useEffect, useState } from "react"
import { Printer, Loader2, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { documentSystem, type AttachedDocument } from "@/lib/documents"
import { useNavigate } from "react-router-dom"
import { contractService } from "@/services/contract.service"
import { printService } from "@/services/print.service"
import { usePrint } from "@/hooks/usePrint"
import { directPrint } from "@/utils/direct-print"

interface PrintButtonProps {
  language: "ar" | "en"
  contractData?: any
  selectedDocuments?: string[]
  contractId?: string
  forceDirectPrint?: boolean
}

const PrintButton = ({ 
  language, 
  contractData,
  selectedDocuments = ["contract"],
  contractId = "default",
  forceDirectPrint = true // Force direct print for better compatibility
}: PrintButtonProps) => {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<AttachedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const navigate = useNavigate()
  
  // Use the centralized print hook with direct print option
  const { isPrinting, handlePrint } = usePrint({
    language,
    forceDirectPrint,
    onError: (error) => {
      console.error("Print error in PrintButton:", error);
      
      // Navigate to error page for cross-origin errors
      if (error.message.includes('cross-origin') || 
          error.message.includes('Permission denied') ||
          error.message.includes('SecurityError')) {
        navigate('/print-error?error=' + encodeURIComponent(error.message));
      }
    }
  });
  
  // Load documents that should be included in printing
  useEffect(() => {
    async function loadPrintDocuments() {
      if (!contractId || contractId === "default") return
      
      setIsLoading(true)
      try {
        const docs = await documentSystem.getDocumentsForPrinting(contractId)
        setDocuments(docs)
      } catch (error) {
        console.error("Error loading documents for printing:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrintDocuments()
  }, [contractId])
  
  // Check content visibility and prepare for printing
  useEffect(() => {
    if (!contractData) return
    
    // Ensure print container exists
    const ensurePrintContainer = () => {
      // Check for print container
      let printContainer = document.querySelector('.print-container');
      
      if (!printContainer) {
        console.log('Print container not found, searching for alternative elements');
        
        // Try to add print-container class to various potential elements
        const potentialContainers = [
          '.contract-preview',
          '.contract-container',
          '.a4-page',
          '[data-testid="print-container"]',
          '.contract-content'
        ];
        
        for (const selector of potentialContainers) {
          const element = document.querySelector(selector);
          if (element) {
            element.classList.add('print-container');
            console.log(`Added print-container class to ${selector}`);
            printContainer = element;
            break;
          }
        }
        
        // If still no container, create one and wrap closest relevant content
        if (!printContainer) {
          const contractElement = document.querySelector('.contract-preview, .contract-container, .a4-page');
          if (contractElement) {
            // If we found a contract element, add the class directly
            contractElement.classList.add('print-container');
            console.log('Created print container from existing element');
            printContainer = contractElement;
          } else {
            // Last resort - create a container and append to body
            const newContainer = document.createElement('div');
            newContainer.className = 'print-container';
            document.body.appendChild(newContainer);
            console.log('Created new print container element in body');
          }
        }
      }
      
      return !!printContainer;
    };
    
    // Check visibility of contract elements after render
    const checkVisibility = setTimeout(() => {
      try {
        // Ensure print container exists
        const containerExists = ensurePrintContainer();
        console.log('Print container exists:', containerExists);
        
        // Always pre-fix visibility issues that might exist
        printService.fixVisibility('.print-container');
        
        // Set content as ready to allow printing
        setContentReady(true);
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
      // Ensure print container exists before printing
      const printContainer = document.querySelector('.print-container');
      if (!printContainer) {
        console.error("Print container not found, searching for alternative elements");
        
        // Try to find any printable content
        const contractPreview = document.querySelector('.contract-preview');
        if (!contractPreview) {
          throw new Error(language === "ar" 
            ? "لم يتم العثور على محتوى قابل للطباعة" 
            : "No printable content found");
        }
        
        // Add print-container class to the contract preview
        contractPreview.classList.add('print-container');
        console.log("Added print-container class to contract-preview element");
      }
      
      // Add inline print styles directly to head
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      style.textContent = `
        @media print {
          .print-container, .contract-preview, .a4-page, .contract-content {
            display: block !important;
            visibility: visible !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `;
      document.head.appendChild(style);
      
      // Force immediate visibility fixes before printing
      document.documentElement.classList.add('is-printing');
      document.body.classList.add('printing');
      printService.fixVisibility('.print-container');
      
      // Use direct print method for maximum compatibility
      directPrint('.print-container');
      
      // Cleanup
      setTimeout(() => {
        try {
          document.head.removeChild(style);
        } catch (e) {
          // Style might have been removed already
        }
        document.documentElement.classList.remove('is-printing');
        document.body.classList.remove('printing');
      }, 2000);
      
      // Show success toast
      setTimeout(() => {
        toast({
          title: language === "ar" ? "تم إرسال الطباعة" : "Print Sent",
          description: language === "ar" ? "تم إرسال المستند إلى الطابعة" : "Document was sent to printer",
        });
      }, 1000);
    } catch (error) {
      console.error("Error in print button handler:", error);
      document.documentElement.classList.remove('is-printing');
      document.body.classList.remove('printing');
      
      // Show error toast
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
