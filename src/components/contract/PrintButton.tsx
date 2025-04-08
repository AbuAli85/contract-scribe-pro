
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePrint } from "@/hooks/usePrint";
import { useEffect } from "react";

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
  const { isPrinting, handlePrint } = usePrint();
  
  // Log contract data on mount to help with debugging
  useEffect(() => {
    if (contractData) {
      console.log("Contract data available for printing:", contractId);
    }
  }, [contractData, contractId]);

  const handlePrintClick = async () => {
    try {
      // Check if contractData is valid
      if (!contractData) {
        toast({
          title: language === "ar" ? "خطأ في تحضير الطباعة" : "Error preparing print",
          description: language === "ar" ? "بيانات العقد مفقودة. يرجى المحاولة مرة أخرى." : "Contract data is missing. Please try again.",
          variant: "destructive",
        });
        console.error("Contract data is missing");
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
        return;
      }

      console.log("Preparing document for print with data:", contractData);
      console.log("Selected documents:", selectedDocuments);
      
      // Call the handlePrint function from usePrint hook
      handlePrint('.print-container');

    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : 
          (language === "ar" ? "حدث خطأ أثناء الطباعة" : "An error occurred while printing"),
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrintClick}
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
