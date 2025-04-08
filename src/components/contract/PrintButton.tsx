
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Setup print listeners
  useEffect(() => {
    const beforePrintHandler = () => {
      console.log("beforeprint event triggered");
      document.body.classList.add('printing');
      setIsPrinting(true);
    };
    
    const afterPrintHandler = () => {
      console.log("afterprint event triggered");
      // Small delay to ensure browser has completed the print operation
      setTimeout(() => {
        document.body.classList.remove('printing');
        setIsPrinting(false);
      }, 500);
    };
    
    window.addEventListener('beforeprint', beforePrintHandler);
    window.addEventListener('afterprint', afterPrintHandler);
    
    return () => {
      window.removeEventListener('beforeprint', beforePrintHandler);
      window.removeEventListener('afterprint', afterPrintHandler);
    };
  }, []);
  
  const handlePrint = () => {
    // Don't attempt to print if already in printing state
    if (isPrinting) return;
    
    try {
      console.log("Print preparation starting...");
      
      // First, add printing class to body to activate CSS rules
      document.body.classList.add('printing');
      setIsPrinting(true);
      
      // Force a reflow to ensure CSS changes are applied
      document.body.offsetHeight;
      
      // Queue the actual print operation to give browser time to apply styles
      setTimeout(() => {
        // Double check document state before printing
        if (document.readyState !== 'complete') {
          console.log("Document not fully loaded, delaying print...");
          setTimeout(() => window.print(), 1000);
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
        }, 5000);
      }, 500);
      
    } catch (error) {
      console.error("Print error:", error);
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
      <span>{language === "ar" ? "طباعة" : "Print"}</span>
    </Button>
  );
};

export default PrintButton;
