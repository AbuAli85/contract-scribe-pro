
import React, { useEffect, useRef, useState } from 'react';
import { printService } from '@/services/print.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrintPreviewProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  className?: string;
}

/**
 * A wrapper component that prepares content for printing
 * by applying necessary CSS classes and visibility fixes
 */
const PrintPreview: React.FC<PrintPreviewProps> = ({ 
  children, 
  onReady,
  className = ""
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [hasWarnings, setHasWarnings] = useState(false);
  
  // Ensure visibility for printing when component mounts
  useEffect(() => {
    if (!previewRef.current) return;
    
    // Short delay to allow content to render fully
    const timer = setTimeout(() => {
      try {
        // Apply critical printing styles immediately
        document.documentElement.classList.add('is-printing');
        document.body.classList.add('printing');
        
        // Check if content is ready for printing
        const isReady = printService.validatePrintContent('.print-container');
        
        // Apply visibility fixes regardless of ready status
        // This ensures content is visible even if validation fails
        printService.fixVisibility('.print-container');
        
        // Display warnings if validation failed
        setHasWarnings(!isReady);
        
        // Notify parent component
        onReady?.(true); // Always report ready to allow printing attempt
        
        console.log('PrintPreview content ready:', isReady);
      } catch (error) {
        console.error('PrintPreview error:', error);
        setHasWarnings(true);
        // Still notify parent to allow printing attempt
        onReady?.(true);
      } finally {
        // Always clean up the printing classes after initialization
        setTimeout(() => {
          document.documentElement.classList.remove('is-printing');
          document.body.classList.remove('printing');
        }, 500);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady]);

  // Apply print-specific styles to ensure content is visible
  const inlineStyles = `
    @media print {
      .print-container * {
        visibility: visible !important;
        display: initial !important;
        opacity: 1 !important;
        overflow: visible !important;
      }
      
      .a4-page {
        padding: 0 !important;
        margin: 0 !important;
        page-break-after: always !important;
      }
    }
  `;

  return (
    <>
      {/* Inline critical print styles */}
      <style>{inlineStyles}</style>
      
      {hasWarnings && (
        <Alert variant="warning" className="mb-4 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some print elements may not be visible. The system will attempt to fix this automatically.
          </AlertDescription>
        </Alert>
      )}
    
      <div 
        ref={previewRef} 
        className={`print-container ${className}`}
        data-testid="print-container"
        style={{ position: 'relative', width: '100%' }}
      >
        {children}
      </div>
    </>
  );
};

export default PrintPreview;
