
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
  
  // If nested, wrap in a div without print-container class to avoid duplicates
  if (isNested) {
    return (
      <div className={`print-nested-container ${className}`} data-testid="nested-print-content">
        {children}
      </div>
    );
  }
  
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4 print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Print container error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={containerRef} 
        className={`print-container print-container-wrapper ${className}`}
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
