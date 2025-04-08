
import React, { useEffect, useRef } from 'react';
import { printService } from '@/services/print.service';

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
  
  // Ensure visibility for printing when component mounts
  useEffect(() => {
    if (!previewRef.current) return;
    
    // Short delay to allow content to render fully
    const timer = setTimeout(() => {
      try {
        // Check if content is ready for printing
        const isReady = printService.validatePrintContent('.print-container');
        
        // Apply visibility fixes if ready
        if (isReady) {
          // Add critical printing class to html/body
          document.documentElement.classList.add('is-printing');
          document.body.classList.add('printing');
          
          // Apply additional visibility fixes
          printService.fixVisibility('.print-container');
        }
        
        // Notify parent component
        onReady?.(isReady);
        
        console.log('PrintPreview content ready:', isReady);
      } catch (error) {
        console.error('PrintPreview error:', error);
        // Still notify parent, but with failure status
        onReady?.(false);
      } finally {
        // Always clean up the printing classes after initialization
        setTimeout(() => {
          document.documentElement.classList.remove('is-printing');
          document.body.classList.remove('printing');
        }, 200);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div 
      ref={previewRef} 
      className={`print-container ${className}`}
      data-testid="print-container"
    >
      {children}
    </div>
  );
};

export default PrintPreview;
