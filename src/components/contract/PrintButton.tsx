
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  // Setup print listener to ensure styles are reset after printing
  useEffect(() => {
    const afterPrintHandler = () => {
      document.body.classList.remove('printing');
    };
    
    window.addEventListener('afterprint', afterPrintHandler);
    return () => window.removeEventListener('afterprint', afterPrintHandler);
  }, []);
  
  const handlePrint = () => {
    try {
      // Add printing class to document body
      document.body.classList.add('printing');
      
      // Force all contract elements to be visible
      const contractElements = document.querySelectorAll('.contract-preview, .a4-page, .contract-content, .letterhead-background, .reference-section, .id-photo-container, .contract-title-area, .two-column-layout, .contract-column, .signature-area');
      
      contractElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.style.opacity = '1';
        }
      });
      
      // Handle flex containers specifically
      const flexElements = document.querySelectorAll('.two-column-layout, .signature-area');
      flexElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'flex';
        }
      });
      
      // Ensure content is fully rendered before printing
      setTimeout(() => {
        window.print();
      }, 500);
      
    } catch (error) {
      console.error("Print error:", error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="mb-6 print:hidden flex gap-2 items-center"
    >
      <Printer className="h-4 w-4" />
      <span>{language === "ar" ? "طباعة" : "Print"}</span>
    </Button>
  );
};

export default PrintButton;
