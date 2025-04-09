
import React, { useEffect } from 'react';
import { printService } from '@/services/print.service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { setupPrintContainer, cleanupPrinting } from '@/utils/print-container';
import { useNestedPrintContainer } from '@/hooks/useNestedPrintContainer';

interface PrintPreviewProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  showWarnings?: boolean;
  className?: string;
}

/**
 * An enhanced print preview component that handles visibility and print preparation
 * while preventing duplicate content when nested
 */
const PrintPreview: React.FC<PrintPreviewProps> = ({
  children,
  onReady,
  showWarnings = true,
  className = ""
}) => {
  const { containerRef, isNested } = useNestedPrintContainer();
  const [warnings, setWarnings] = React.useState<string[]>([]);
  
  // Prepare content for printing and check for issues
  useEffect(() => {
    if (isNested || !containerRef.current) return;
    
    // Log container existence for debugging
    console.log('PrintPreview: Container initialized');
    
    // Setup print container
    setupPrintContainer();
    
    // Add critical inline print styles
    const style = document.createElement('style');
    style.setAttribute('media', 'print');
    style.textContent = `
      @media print {
        html, body {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        
        .print-container, .contract-preview, .a4-page {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        .contract-content, .two-column-layout, .contract-column, .signature-area {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        .two-column-layout {
          display: flex !important;
        }
        
        @page {
          size: A4 portrait;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Short delay to allow content to render fully
    const timer = setTimeout(() => {
      try {
        // Apply visibility fixes
        printService.fixVisibility('.print-container');
        
        // Set as ready
        setWarnings([]);
        
        // Notify parent component
        onReady?.(true);
        
        console.log('PrintPreview content ready, print container exists:', !!document.querySelector('.print-container'));
      } catch (error) {
        console.error('Error preparing print content:', error);
        setWarnings(['Error preparing content for printing']);
        onReady?.(false);
      }
      
      // Cleanup
      cleanupPrinting();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      try {
        document.head.removeChild(style);
      } catch (err) {
        // Style might have been removed already
      }
      cleanupPrinting();
    };
  }, [onReady, children, isNested]);

  // If nested, render without print container to avoid duplicates
  if (isNested) {
    return (
      <div 
        ref={containerRef}
        className={`print-nested-container ${className}`}
        data-testid="nested-print-content"
      >
        {children}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`print-container print-section ${className}`} 
      data-testid="print-container"
    >
      {showWarnings && warnings.length > 0 && (
        <Alert variant="destructive" className="mb-4 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Print Preview Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </div>
  );
};

export default PrintPreview;
