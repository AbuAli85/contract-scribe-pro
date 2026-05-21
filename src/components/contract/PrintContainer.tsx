
import React, { useEffect, useState } from 'react';
import { setupPrintContainer, cleanupPrinting } from '@/utils/print-container';
import { printDebugTools } from '@/utils/print-debug-tools';
import { useNestedPrintContainer } from '@/hooks/useNestedPrintContainer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrintContainerProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  className?: string;
  showDebugInfo?: boolean;
}

/**
 * An improved container for print-related content that ensures proper visibility
 * and prevents duplicate content when nested in other print containers
 */
const PrintContainer: React.FC<PrintContainerProps> = ({
  children,
  onReady,
  className = "",
  showDebugInfo = false
}) => {
  const { containerRef, isNested } = useNestedPrintContainer();
  const [error, setError] = useState<string | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  
  // Initialize and validate print container
  useEffect(() => {
    if (isNested) {
      // For nested containers, just notify the parent that we're ready
      onReady?.(true);
      return;
    }
    
    if (!containerRef.current) return;
    
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
        setContentVisible(true);
        
        // Add print-specific class to ensure styles apply
        document.documentElement.classList.add('print-ready');
        
        // Log container setup for debugging
        console.log('Print container setup complete');
      } catch (error) {
        console.error('Error setting up print container:', error);
        setError(error instanceof Error ? error.message : 'Unknown error setting up print container');
        onReady?.(false);
      } finally {
        // Clean up after setup
        cleanupPrinting();
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      cleanupPrinting();
      document.documentElement.classList.remove('print-ready');
    };
  }, [onReady, isNested]);
  
  // Add a forced visibility mechanism
  useEffect(() => {
    // Force visibility of content after a short delay
    const visibilityTimer = setTimeout(() => {
      if (!isNested && containerRef.current) {
        setContentVisible(true);
        // Apply critical styles inline for maximum compatibility
        const elements = containerRef.current.querySelectorAll('.contract-content, .a4-page, .two-column-layout, .contract-column');
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = el.classList.contains('two-column-layout') ? 'flex' : 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
        console.log('Content visibility forced');
      }
    }, 600);
    
    return () => clearTimeout(visibilityTimer);
  }, [isNested]);
  
  // If nested, wrap in a div with print-nested-container class to avoid duplicates
  if (isNested) {
    return (
      <div 
        ref={containerRef}
        className={`print-nested-container ${className}`} 
        data-testid="nested-print-container"
      >
        {/* Show debug info if needed */}
        {showDebugInfo && process.env.NODE_ENV === 'development' && (
          <div className="print-debug-info print:hidden bg-yellow-50 border border-yellow-200 p-2 text-xs mb-4 rounded">
            <p>Nested print container - Content suppressed for printing</p>
          </div>
        )}
        {children}
      </div>
    );
  }
  
  // Add critical print styles
  const inlineStyle = `
    @media print {
      .print-container, .contract-preview, .a4-page, .contract-content,
      .letterhead-background, .two-column-layout, .contract-column, 
      .reference-section, .signature-area, .id-photo-container {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .two-column-layout {
        display: flex !important;
      }
      
      .print-nested-container {
        display: none !important;
        visibility: hidden !important;
      }
    }
  `;
  
  return (
    <>
      <style>{inlineStyle}</style>
      
      {error && (
        <Alert variant="destructive" className="mb-4 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Print container error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={containerRef} 
        className={`print-container print-section ${contentVisible ? 'content-visible' : 'content-loading'} ${className}`}
        data-testid="print-container"
      >
        {showDebugInfo && process.env.NODE_ENV === 'development' && (
          <div className="print-debug-info print:hidden bg-yellow-50 border border-yellow-200 p-2 text-xs mb-4 rounded">
            <p>Print container active | Nested: {isNested ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        {children}
      </div>
    </>
  );
};

export default PrintContainer;
