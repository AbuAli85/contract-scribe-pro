
import { useState, useEffect, useCallback } from "react";

interface UsePrintOptions {
  timeoutDuration?: number;
}

export const usePrint = ({ timeoutDuration = 10000 }: UsePrintOptions = {}) => {
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
      }, 1000);
    };
    
    window.addEventListener('beforeprint', beforePrintHandler);
    window.addEventListener('afterprint', afterPrintHandler);
    
    return () => {
      window.removeEventListener('beforeprint', beforePrintHandler);
      window.removeEventListener('afterprint', afterPrintHandler);
    };
  }, []);
  
  const handlePrint = useCallback(() => {
    // Don't attempt to print if already in printing state
    if (isPrinting) return;
    
    try {
      console.log("Print preparation starting...");
      
      // Make sure all contract elements are visible
      document.querySelectorAll('.contract-preview *, .a4-page *, .contract-content *').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = el.tagName === 'DIV' ? 'block' : '';
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });
      
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
          setTimeout(() => window.print(), 1500);
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
        }, timeoutDuration);
      }, 1000);
      
    } catch (error) {
      console.error("Print error:", error);
      document.body.classList.remove('printing');
      setIsPrinting(false);
    }
  }, [isPrinting, timeoutDuration]);

  return {
    isPrinting,
    handlePrint
  };
};
