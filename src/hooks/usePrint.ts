
import { useState, useEffect, useCallback } from "react";

interface UsePrintOptions {
  timeoutDuration?: number;
}

export const usePrint = ({ timeoutDuration = 15000 }: UsePrintOptions = {}) => {
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
      
      // Force all contract elements to be visible
      document.querySelectorAll('.contract-preview *, .a4-page *, .contract-content *, .id-photo-container *, .id-photo-wrapper *, .signature-area *, .signature-block *, .reference-section *').forEach(el => {
        if (el instanceof HTMLElement) {
          // Set display property based on element type
          if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
            el.style.display = 'block';
          } else if (el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' || 
                    el.tagName === 'H2' || el.tagName === 'H3') {
            el.style.display = 'block';
          } else if (el.tagName === 'IMG') {
            el.style.display = 'inline-block';
          } else if (el.classList.contains('two-column-layout')) {
            el.style.display = 'flex';
          } else if (el.classList.contains('signature-area')) {
            el.style.display = 'flex';
          } else if (el.classList.contains('id-photo-container')) {
            el.style.display = 'flex';
          } else {
            el.style.display = '';
          }
          
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          
          // Ensure text elements have proper color
          if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || 
              el.tagName === 'H3' || el.tagName === 'SPAN' || el.tagName === 'DIV') {
            el.style.color = 'black';
          }
        }
      });
      
      // First, add printing class to body to activate CSS rules
      document.body.classList.add('printing');
      setIsPrinting(true);
      
      // Force a reflow to ensure CSS changes are applied
      document.body.offsetHeight;
      
      // Longer delay to ensure styles are properly applied
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
        }, timeoutDuration);
      }, 2000); // Increased from 1000ms to 2000ms
      
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
