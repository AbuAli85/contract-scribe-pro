
import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PrintButtonProps {
  language: "ar" | "en";
  contractData?: any;
  selectedDocuments?: string[];
  documents?: any[];
  contractId?: string;
}

const PrintButton = ({ 
  language, 
  contractData, 
  selectedDocuments = ["contract"], 
  documents = [],
  contractId = "default"
}: PrintButtonProps) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      // Check if contractData is valid
      if (!contractData) {
        toast({
          title: "Error preparing print",
          description: language === "ar" ? "بيانات العقد مفقودة. يرجى المحاولة مرة أخرى." : "Contract data is missing. Please try again.",
          variant: "destructive",
        });
        console.error("Contract data is missing");
        setIsPrinting(false);
        return;
      }

      // Check if any documents are selected
      if (selectedDocuments.length === 0) {
        toast({
          title: language === "ar" ? "لم يتم تحديد أي مستندات" : "No documents selected",
          description: language === "ar" ? "يرجى تحديد مستند واحد على الأقل للطباعة" : "Please select at least one document to print",
          variant: "destructive",
        });
        console.warn("No documents selected for printing");
        setIsPrinting(false);
        return;
      }

      // Load signatures from localStorage if contractId is provided
      const signatures: any[] = [];
      if (contractId !== "default") {
        try {
          // Try to get signatures from the new format first
          const savedSignatures = localStorage.getItem(`contract-signatures-${contractId}`);
          if (savedSignatures) {
            const parsedSignatures = JSON.parse(savedSignatures);
            // Filter only signatures with actual signature data
            const validSignatures = parsedSignatures.filter((s: any) => s.signature);
            signatures.push(...validSignatures);
          }

          // If no signatures found, try the old format
          if (signatures.length === 0) {
            const savedSignatories = localStorage.getItem(`contract-signatories-${contractId}`);
            if (savedSignatories) {
              const signatories = JSON.parse(savedSignatories);
              // Filter only signed signatories with signature data
              const signedSignatories = signatories.filter((s: any) => s.signed && s.signatureData);

              // Convert to the expected format
              const convertedSignatures = signedSignatories.map((s: any) => ({
                partyId: s.id,
                partyName: s.name,
                partyRole: s.role,
                signature: s.signatureData,
                stamp: s.stampData,
                timestamp: s.signedAt || new Date().toISOString(),
              }));

              signatures.push(...convertedSignatures);
            }
          }
        } catch (error) {
          console.error("Error loading signatures:", error);
        }
      }

      console.log("Preparing document for print with data:", contractData);
      console.log("Selected documents:", selectedDocuments);

      // Force document rendering before printing
      document.body.classList.add('printing');
      
      // Force a reflow to ensure CSS changes are applied
      document.body.offsetHeight;
      
      // Delay to ensure styles are properly applied
      setTimeout(() => {
        // Double check document state before printing
        if (document.readyState !== 'complete') {
          console.log("Document not fully loaded, delaying print...");
          setTimeout(() => window.print(), 2000);
        } else {
          console.log("Initiating print operation...");
          window.print();
        }
        
        // Set a fallback to clear printing state if print dialog is dismissed
        setTimeout(() => {
          if (document.body.classList.contains('printing')) {
            console.log("Cleaning up print state via fallback...");
            document.body.classList.remove('printing');
            setIsPrinting(false);
          }
        }, 15000);
      }, 1000);
      
      // Clear print state after a short delay to allow print dialog to show
      setTimeout(() => {
        setIsPrinting(false);
      }, 3000);

    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : 
          (language === "ar" ? "حدث خطأ أثناء الطباعة" : "An error occurred while printing"),
        variant: "destructive",
      });
      document.body.classList.remove('printing');
      setIsPrinting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting}
    >
      <Printer className="h-4 w-4" />
      <span>{isPrinting 
        ? (language === "ar" ? "جاري التحضير..." : "Preparing...") 
        : (language === "ar" ? "طباعة" : "Print")}
      </span>
    </Button>
  );
};

export default PrintButton;
