
import { printDebugTools } from './print-debug-tools';
import { printService } from '@/services/print.service';

/**
 * Utility that automatically checks the print environment on page load
 * and applies necessary fixes for optimal printing
 */
export const printEnvChecker = {
  /**
   * Run a quick environment check 
   */
  quickCheck: (): boolean => {
    // Check critical CSS for print support
    const hasPrintStyles = document.querySelectorAll('style[media="print"], link[media="print"]').length > 0;
    
    // Check print container exists
    const hasPrintContainer = document.querySelector('.print-container') !== null;
    
    return hasPrintStyles && hasPrintContainer;
  },
  
  /**
   * Initialize the environment with appropriate fixes
   */
  initEnvironment: () => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if we're on a page with printing capability
    const isPrintablePage = document.querySelector('.print-container, .contract-preview, .a4-page') !== null;
    
    if (!isPrintablePage) return;
    
    // Apply fixes after a short delay to ensure DOM is ready
    setTimeout(() => {
      const isValid = printEnvChecker.quickCheck();
      
      if (!isValid) {
        console.warn('Print environment issues detected. Applying automatic fixes...');
        
        // Apply visibility fixes
        printService.fixVisibility();
        
        // Run more comprehensive checks in development
        if (process.env.NODE_ENV === 'development') {
          printDebugTools.troubleshoot().catch(error => {
            console.error('Error running print troubleshooting:', error);
          });
        }
      }
    }, 1000);
  }
};

// Auto-initialize in browser environments when on printable pages
if (typeof window !== 'undefined') {
  // Wait for document to be fully loaded
  if (document.readyState === 'complete') {
    printEnvChecker.initEnvironment();
  } else {
    window.addEventListener('load', () => {
      printEnvChecker.initEnvironment();
    });
  }
}
