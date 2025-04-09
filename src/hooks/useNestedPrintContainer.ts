
import { useRef, useMemo, useEffect, useState } from 'react';

/**
 * Custom hook to detect if the current component is nested inside another print container
 * and prevent duplicate content when printing
 */
export function useNestedPrintContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if this element is nested inside another print container
  const isNested = useMemo(() => {
    if (typeof window === 'undefined' || !containerRef.current) return false;
    
    // Check if this container is inside another print container
    const parent = containerRef.current.closest('.print-container');
    const isInsideContainer = parent !== null && parent !== containerRef.current;
    
    // Log warning if nested container is detected
    if (isInsideContainer && process.env.NODE_ENV === 'development') {
      console.log('Nested print container detected:', containerRef.current);
    }
    
    return isInsideContainer;
  }, [isInitialized]);
  
  // Add print container class if not nested
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initialized to trigger isNested calculation
    setIsInitialized(true);
    
    // If not nested, add necessary classes
    if (!isNested && containerRef.current) {
      // Add print-container class if it doesn't exist
      if (!containerRef.current.classList.contains('print-container')) {
        containerRef.current.classList.add('print-container');
      }
      
      // Add data-testid attribute for better debugging and testing
      if (!containerRef.current.hasAttribute('data-testid')) {
        containerRef.current.setAttribute('data-testid', 'print-container');
      }
      
      // Log successful setup
      console.log('Print container setup completed');
    } else if (isNested && containerRef.current) {
      // Add print-nested-container class to help with CSS targeting
      containerRef.current.classList.add('print-nested-container');
      containerRef.current.setAttribute('data-testid', 'nested-print-container');
      
      // Remove print-container class if it exists to prevent duplication
      if (containerRef.current.classList.contains('print-container')) {
        containerRef.current.classList.remove('print-container');
      }
      
      // Log nested container
      console.log('Nested print container configured to prevent duplication');
    }
  }, [isNested]);
  
  return { 
    containerRef, 
    isNested,
    isInitialized 
  };
}
