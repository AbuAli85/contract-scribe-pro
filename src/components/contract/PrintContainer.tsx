
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
    if (!containerRef.current.classList.contains('print-container')) {
      containerRef.current.classList.add('print-container');
    }
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
  
  // Prevent nested duplicates by checking if we're already inside a print container
  const isNested = React.useMemo(() => {
    if (typeof document === 'undefined') return false;
    
    // Check if this container is inside another print container
    const isInsideContainer = containerRef.current?.closest('.print-container') !== null 
                             && containerRef.current?.closest('.print-container') !== containerRef.current;
    
    if (isInsideContainer) {
      console.warn('Warning: Nested print container detected. This may cause duplicate content when printing.');
    }
    
    return isInsideContainer;
  }, []);
  
  // If nested, wrap in a div without print-container class to avoid duplicates
  if (isNested) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div 
      ref={containerRef} 
      className={`print-container-wrapper ${className}`}
      data-testid="print-container"
    >
      {children}
    </div>
  );
};

export default PrintContainer;
