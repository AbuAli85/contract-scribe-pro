
import React, { useEffect } from 'react';
import { setupPrintContainer, cleanupPrinting } from '@/utils/print-container';
import { printDebugTools } from '@/utils/print-debug-tools';
import { useNestedPrintContainer } from '@/hooks/useNestedPrintContainer';

interface PrintContainerProps {
  children: React.ReactNode;
  onReady?: (isReady: boolean) => void;
  className?: string;
}

/**
 * A container for print-related content that ensures proper visibility
 * and prevents duplicate content when nested
 */
const PrintContainer: React.FC<PrintContainerProps> = ({
  children,
  onReady,
  className = ""
}) => {
  const { containerRef, isNested } = useNestedPrintContainer();
  
  // Initialize and validate print container
  useEffect(() => {
    if (isNested || !containerRef.current) return;
    
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
  }, [onReady, isNested]);
  
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
