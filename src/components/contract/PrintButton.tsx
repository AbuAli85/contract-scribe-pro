
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printTimeoutRef = useRef<number | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Check if stylesheets are loaded
  useEffect(() => {
    // Check if document is already loaded
    if (document.readyState === 'complete') {
      setStylesLoaded(true);
    } else {
      const handleLoad = () => setStylesLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (printTimeoutRef.current) {
        window.clearTimeout(printTimeoutRef.current);
      }
    };
  }, []);

  // Setup print listener to ensure styles are reset after printing
  useEffect(() => {
    const beforePrintHandler = () => {
      setIsPrinting(true);
      document.body.classList.add('printing');
    };
    
    const afterPrintHandler = () => {
      // Delay removal to ensure proper cleanup
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
    if (!stylesLoaded) {
      console.log("Waiting for stylesheets to load completely...");
      setTimeout(() => {
        if (document.readyState === 'complete') {
          handlePrintWhenReady();
        } else {
          window.addEventListener('load', handlePrintWhenReady, { once: true });
        }
      }, 300);
      return;
    }
    
    handlePrintWhenReady();
  };
  
  const handlePrintWhenReady = () => {
    try {
      console.log("Print preparation starting...");
      
      // Add printing class to document body
      document.body.classList.add('printing');
      setIsPrinting(true);
      
      // Force all stylesheets to load by accessing them
      const styleSheets = Array.from(document.styleSheets);
      console.log(`Ensuring ${styleSheets.length} stylesheets are loaded`);
      
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
      
      // Apply print-specific styles
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements for ${selector}`);
        
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Store original styles
            const originalDisplay = element.style.display;
            const originalVisibility = element.style.visibility;
            const originalOpacity = element.style.opacity;
            
            // Force visibility with important flags
            element.style.cssText += `
              display: ${selector.includes('two-column-layout') || 
                        selector.includes('signature-area') || 
                        selector.includes('id-photo-container') ? 
                        'flex' : 'block'} !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;
            
            // Add data attributes to restore later
            element.dataset.originalDisplay = originalDisplay;
            element.dataset.originalVisibility = originalVisibility;
            element.dataset.originalOpacity = originalOpacity;
          }
        });
      });
      
      // Give browser time to apply style changes
      console.log("Scheduling print operation...");
      
      // Use RAF to ensure all repaints are complete
      requestAnimationFrame(() => {
        // Additional delay to ensure everything is ready
        printTimeoutRef.current = window.setTimeout(() => {
          console.log("Initiating print dialog...");
          
          // Initiate print dialog
          window.print();
          
          // Set a fallback timeout to reset print state if print dialog is closed or canceled
          printTimeoutRef.current = window.setTimeout(() => {
            console.log("Cleanup after print...");
            
            if (document.body.classList.contains('printing')) {
              console.log("Resetting print styles...");
              
              // Restore original styles
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                  if (element instanceof HTMLElement) {
                    const originalStyle = element.dataset.originalDisplay || '';
                    
                    // Clear forced styles
                    element.style.display = originalStyle;
                    element.style.visibility = element.dataset.originalVisibility || '';
                    element.style.opacity = element.dataset.originalOpacity || '';
                    
                    // Remove data attributes
                    delete element.dataset.originalDisplay;
                    delete element.dataset.originalVisibility;
                    delete element.dataset.originalOpacity;
                  }
                });
              });
              
              document.body.classList.remove('printing');
              setIsPrinting(false);
            }
          }, 3000); // Longer timeout to handle print dialog closing
        }, 800); // Delay before showing print dialog
      });
      
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
