
import React, { useEffect, useRef } from 'react';
import { printService } from '@/services/print.service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrintPreviewProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  showWarnings?: boolean;
  className?: string;
}

/**
 * An enhanced print preview component that handles visibility and print preparation
 */
const PrintPreview: React.FC<PrintPreviewProps> = ({
  children,
  onReady,
  showWarnings = true,
  className = ""
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  
  // Prepare content for printing and check for issues
  useEffect(() => {
    if (!previewRef.current) return;
    
    // Immediately mark as print container
    previewRef.current.classList.add('print-container');
    previewRef.current.setAttribute('data-testid', 'print-container');
    
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
        
        // Set as ready anyway to allow printing
        setIsReady(true);
        setWarnings([]);
        
        // Notify parent component
        onReady?.(true);
        
        console.log('PrintPreview content ready, print container exists:', !!document.querySelector('.print-container'));
      } catch (error) {
        console.error('Error preparing print content:', error);
        setIsReady(false);
        setWarnings(['Error preparing content for printing']);
        onReady?.(false);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      try {
        document.head.removeChild(style);
      } catch (err) {
        // Style might have been removed already
      }
    };
  }, [onReady, children]);

  return (
    <div ref={previewRef} className={`print-container ${className}`} data-testid="print-container">
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
