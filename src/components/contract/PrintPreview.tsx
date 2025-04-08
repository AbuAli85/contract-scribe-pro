
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
      // Check if content is ready for printing
      const isReady = printService.validatePrintContent();
      
      // Apply visibility fixes if ready
      if (isReady) {
        printService.fixVisibility();
      }
      
      // Notify parent component
      onReady?.(isReady);
      
      console.log('PrintPreview content ready:', isReady);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div 
      ref={previewRef} 
      className={`print-container ${className}`}
    >
      {children}
    </div>
  );
};

export default PrintPreview;
