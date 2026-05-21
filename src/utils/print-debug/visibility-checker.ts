
/**
 * Visibility Checker Utility
 * 
 * Utility for checking visibility of print elements
 */

/**
 * Check the visibility of print elements
 */
export const checkPrintElementsVisibility = (): boolean => {
  // Check for .print-container first
  const printContainer = document.querySelector('.print-container');
  if (!printContainer) return false;
  
  // Check key elements for printing
  const criticalElements = [
    '.contract-preview', 
    '.contract-content', 
    '.contract-column',
    '.signature-area'
  ];
  
  // All critical elements must be present and visible
  return criticalElements.every(selector => {
    const element = document.querySelector(selector);
    if (!element) return false;
    
    if (element instanceof HTMLElement) {
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    }
    
    return true;
  });
};
