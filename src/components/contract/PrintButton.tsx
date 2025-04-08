
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Setup print listener to ensure styles are reset after printing
  useEffect(() => {
    const beforePrintHandler = () => {
      setIsPrinting(true);
    };
    
    const afterPrintHandler = () => {
      document.body.classList.remove('printing');
      setIsPrinting(false);
    };
    
    window.addEventListener('beforeprint', beforePrintHandler);
    window.addEventListener('afterprint', afterPrintHandler);
    return () => {
      window.removeEventListener('beforeprint', beforePrintHandler);
      window.removeEventListener('afterprint', afterPrintHandler);
    };
  }, []);
  
  const handlePrint = () => {
    try {
      // Add printing class to document body
      document.body.classList.add('printing');
      
      // Target all elements that need to be visible when printing
      const selectors = [
        '.contract-preview', 
        '.a4-page', 
        '.contract-content',
        '.letterhead-background',
        '.reference-section', 
        '.id-photo-container',
        '.id-photo-wrapper',
        '.id-photo',
        '.contract-title-area', 
        '.contract-main-title',
        '.two-column-layout', 
        '.contract-column',
        '.signature-area',
        '.contract-title',
        '.promoter-details',
        '.promoter-info',
        '.info-row',
        '.responsibilities',
        '.responsibilities-title',
        '.best-regards',
        '.signature-block',
        '.signature-line'
      ];
      
      // Apply print-specific styles directly to elements
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Store original styles
            const originalDisplay = element.style.display;
            const originalVisibility = element.style.visibility;
            const originalOpacity = element.style.opacity;
            
            // Force visibility
            element.style.display = selector.includes('two-column-layout') || 
                                   selector.includes('signature-area') ? 
                                   'flex' : 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            
            // Add data attributes to restore later
            element.dataset.originalDisplay = originalDisplay;
            element.dataset.originalVisibility = originalVisibility;
            element.dataset.originalOpacity = originalOpacity;
          }
        });
      });
      
      // Create a print-specific container if needed
      const printContainer = document.querySelector('.printing-container') || 
                            document.createElement('div');
      if (!document.querySelector('.printing-container')) {
        printContainer.classList.add('printing-container');
        document.body.appendChild(printContainer);
      }
      
      // Ensure content is fully rendered before printing
      setTimeout(() => {
        window.print();
        
        // Restore original styles after a delay
        setTimeout(() => {
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              if (element instanceof HTMLElement) {
                if (element.dataset.originalDisplay) {
                  element.style.display = element.dataset.originalDisplay;
                }
                if (element.dataset.originalVisibility) {
                  element.style.visibility = element.dataset.originalVisibility;
                }
                if (element.dataset.originalOpacity) {
                  element.style.opacity = element.dataset.originalOpacity;
                }
              }
            });
          });
        }, 1000);
      }, 1000);
      
    } catch (error) {
      console.error("Print error:", error);
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
