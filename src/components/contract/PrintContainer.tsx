
import React, { useEffect, useRef } from 'react';
import { setupPrintContainer, cleanupPrinting } from '@/utils/print-container';
import { printDebugTools } from '@/utils/print-debug-tools';

interface PrintContainerProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  className?: string;
}

/**
 * A container for print-related content that ensures proper visibility
 */
const PrintContainer: React.FC<PrintContainerProps> = ({
  children,
  onReady,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize and validate print container
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Add print-container class and data-testid
    containerRef.current.classList.add('print-container');
    containerRef.current.setAttribute('data-testid', 'print-container');
    
    // Set up print container and critical styles
    const timer = setTimeout(() => {
      try {
        // Setup for printing
        setupPrintContainer();
        
        // Apply automatic fixes in development
        if (process.env.NODE_ENV === 'development') {
          printDebugTools.troubleshoot();
        }
        
        // Notify parent that container is ready
        onReady?.(true);
        
        // Log container setup for debugging
        console.log('Print container setup complete');
      } catch (error) {
        console.error('Error setting up print container:', error);
        onReady?.(false);
      } finally {
        // Clean up after setup
        cleanupPrinting();
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      cleanupPrinting();
    };
  }, [onReady]);
  
  // Critical print styles - improved with A4 exact measurements
  const printStyles = `
    @media print {
      /* Core settings and page format */
      @page {
        size: A4 portrait;
        margin: 0mm;
      }
      
      html, body, #root {
        height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background-color: white !important;
      }
      
      /* A4 page container */
      .a4-page {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      /* Critical element visibility */
      .print-container, 
      .contract-preview, 
      .a4-page,
      .contract-content, 
      .letterhead-background,
      .contract-title-area,
      .reference-section,
      .id-photo-container,
      .two-column-layout, 
      .contract-column, 
      .signature-area,
      .signature-block,
      .bottom-info {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Fix for flex containers */
      .two-column-layout {
        display: flex !important;
      }
      
      /* Exact positioning for key elements */
      .reference-section {
        position: absolute !important;
        top: 25mm !important;
        left: 10mm !important;
      }
      
      .contract-title-area {
        position: absolute !important;
        top: 28mm !important;
      }
      
      .id-photo-container {
        position: absolute !important;
        top: 32mm !important;
        width: 100% !important;
        display: flex !important;
        justify-content: center !important;
      }
      
      .two-column-layout {
        position: absolute !important;
        top: 35mm !important;
        left: 10mm !important;
        width: calc(100% - 20mm) !important;
      }
      
      .signature-area {
        position: absolute !important;
        top: 75mm !important;
        left: 10mm !important;
        width: calc(100% - 20mm) !important;
      }
      
      .bottom-info {
        position: absolute !important;
        bottom: 20mm !important;
        left: 10mm !important;
        right: 10mm !important;
      }
      
      /* Specific image sizing */
      .id-photo-wrapper {
        width: 400px !important;
        max-width: 100% !important;
        margin: 0 auto !important;
      }
    }
  `;
  
  return (
    <>
      <style>{printStyles}</style>
      <div 
        ref={containerRef} 
        className={`print-container ${className}`}
        data-testid="print-container"
      >
        {children}
      </div>
    </>
  );
};

export default PrintContainer;
