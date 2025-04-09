
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
    if (typeof document === 'undefined' || !containerRef.current) return false;
    
    // Check if this container is inside another print container
    const isInsideContainer = !!containerRef.current?.closest('.print-container:not(.print-nested-container)');
    
    // Log warning if nested container is detected
    if (isInsideContainer) {
      console.warn('Warning: Nested print container detected. Preventing duplicate content for printing.');
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
    }
  }, [isNested]);
  
  return { 
    containerRef, 
    isNested,
    isInitialized 
  };
}
