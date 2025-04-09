
import { useRef, useMemo, useEffect } from 'react';

/**
 * Custom hook to detect if the current component is nested inside another print container
 * and prevent duplicate content when printing
 */
export function useNestedPrintContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if this element is nested inside another print container
  const isNested = useMemo(() => {
    if (typeof document === 'undefined' || !containerRef.current) return false;
    
    // Check if this container is inside another print container
    const isInsideContainer = 
      containerRef.current?.closest('.print-container') !== null && 
      containerRef.current?.closest('.print-container') !== containerRef.current;
    
    // Log warning if nested container is detected
    if (isInsideContainer) {
      console.warn('Warning: Nested print container detected. Preventing duplicate content for printing.');
    }
    
    return isInsideContainer;
  }, []);
  
  // Add print container class if not nested
  useEffect(() => {
    if (!containerRef.current || isNested) return;
    
    // Add print-container class if it doesn't exist
    if (!containerRef.current.classList.contains('print-container')) {
      containerRef.current.classList.add('print-container');
    }
    
    // Add data-testid attribute
    if (!containerRef.current.hasAttribute('data-testid')) {
      containerRef.current.setAttribute('data-testid', 'print-container');
    }
  }, [isNested]);
  
  return { containerRef, isNested };
}
