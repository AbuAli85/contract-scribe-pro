
import React, { useEffect, useState } from 'react';
import { printService } from '@/services/print.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useNestedPrintContainer } from '@/hooks/useNestedPrintContainer';

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
  const { containerRef, isNested } = useNestedPrintContainer();
  const [hasWarnings, setHasWarnings] = useState(false);
  
  // Ensure visibility for printing when component mounts
  useEffect(() => {
    // If nested, no need to set up printing environment
    if (isNested) {
      onReady?.(true);
      return;
    }
    
    if (!containerRef.current) return;
    
    // Short delay to allow content to render fully
    const timer = setTimeout(() => {
      try {
        // Add data-testid attribute for better targeting
        if (containerRef.current && !containerRef.current.hasAttribute('data-testid')) {
          containerRef.current.setAttribute('data-testid', 'print-container');
        }
        
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
        
        console.log('PrintPreview content ready check:', isReady, 'Print container found:', !!document.querySelector('.print-container'));
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
  }, [onReady, isNested]);

  // Apply print-specific styles to ensure content is visible
  const inlineStyles = `
    @media print {
      .print-container * {
        visibility: visible !important;
        display: initial !important;
        opacity: 1 !important;
        overflow: visible !important;
      }
      
      /* Hide nested containers to prevent duplicate printing */
      .print-nested-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      .a4-page {
        padding: 0 !important;
        margin: 0 !important;
        page-break-after: always !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }

      body, html {
        width: 100% !important;
        height: 100% !important; 
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      
      .contract-content, 
      .letterhead-background,
      .two-column-layout,
      .contract-column,
      .signature-area,
      .contract-title,
      .reference-section,
      .id-photo-container {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 100 !important;
      }
      
      .two-column-layout {
        display: flex !important;
      }
    }
  `;

  // If nested, render without print container to avoid duplicates
  if (isNested) {
    return (
      <div 
        ref={containerRef} 
        className="print-nested-container"
        data-testid="nested-print-preview" 
      >
        <div className="nested-content-notice p-4 bg-gray-50 rounded border border-gray-200 mb-4 print:hidden">
          <p className="text-sm text-gray-500">
            Nested print preview - This content will only be shown in the UI, not when printing
          </p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Inline critical print styles */}
      <style>{inlineStyles}</style>
      
      {hasWarnings && (
        <Alert variant="destructive" className="mb-4 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some print elements may not be visible. The system will attempt to fix this automatically.
          </AlertDescription>
        </Alert>
      )}
    
      <div 
        ref={containerRef} 
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
