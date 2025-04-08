
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
    
    // Short delay to allow content to render fully
    const timer = setTimeout(() => {
      try {
        // Validate printability
        const validationResult = printService.validatePrintContent();
        setIsReady(validationResult);
        
        // Apply visibility fixes if ready
        if (validationResult) {
          printService.fixVisibility();
          setWarnings([]);
        } else {
          // Collect warnings
          const newWarnings = [];
          
          if (!document.querySelector('.print-container')) {
            newWarnings.push('Print container not found');
          }
          
          const mediaStylesheets = document.querySelectorAll('style[media="print"], link[media="print"]');
          if (mediaStylesheets.length === 0) {
            newWarnings.push('No print stylesheets detected');
          }
          
          const contractContent = document.querySelector('.contract-content');
          if (!contractContent) {
            newWarnings.push('Contract content element not found');
          }
          
          setWarnings(newWarnings);
        }
        
        // Notify parent component
        onReady?.(isReady);
        
        console.log('PrintPreview content ready:', isReady);
      } catch (error) {
        console.error('Error preparing print content:', error);
        setIsReady(false);
        setWarnings(['Error preparing content for printing']);
        onReady?.(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady, children]);

  return (
    <div ref={previewRef} className={`print-container ${className}`}>
      {showWarnings && warnings.length > 0 && (
        <Alert variant="warning" className="mb-4 print:hidden">
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
