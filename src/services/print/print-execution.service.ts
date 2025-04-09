
/**
 * Print Execution Service
 * Handles the actual printing operations
 */
import { toast } from '@/hooks/use-toast';
import { navigationService } from '../navigation.service';
import { directPrint } from '@/utils/direct-print';
import { fixVisibility, cleanupAfterPrinting } from './print-preparation.service';
import { validatePrintContent } from './print-validation.service';

export type PrintOptions = {
  selector?: string;
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  forceDirectPrint?: boolean;
};

/**
 * Print content using direct window.print approach for maximum compatibility
 * This method avoids cross-origin issues by using the native window.print() directly
 */
export const print = (options: PrintOptions = {}): Promise<void> => {
  const { 
    selector = '.print-container', 
    timeout = 300,
    onSuccess,
    onError,
    forceDirectPrint = true // Default to direct print for maximum compatibility
  } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Add printing classes immediately
      document.body.classList.add('printing');
      document.documentElement.classList.add('is-printing');
      
      // Apply visibility fixes first
      fixVisibility(selector);
      
      // Always use direct print method for better browser compatibility
      console.log('Using direct print method for better compatibility');
      
      try {
        // Use direct print utility
        directPrint(selector);
        
        // Handle success after print dialog closes
        setTimeout(() => {
          cleanupAfterPrinting();
          console.log('Print operation completed');
          onSuccess?.();
          resolve();
        }, 1000);
      } catch (error) {
        const printError = error instanceof Error 
          ? error 
          : new Error('Direct print failed');
        console.error('Direct print error:', printError);
        onError?.(printError);
        reject(printError);
      }
    } catch (error) {
      // Handle any setup errors
      const printError = error instanceof Error ? error : new Error('Print setup error');
      console.error('Print setup error:', printError);
      
      // Clean up
      cleanupAfterPrinting();
      
      // Handle error
      onError?.(printError);
      reject(printError);
    }
  });
};

/**
 * Safe window.print wrapper - avoids cross-origin issues
 * This is a synchronous function that can be called directly
 */
export const printNow = (selector = '.print-container'): void => {
  try {
    // Direct print is the most reliable method
    directPrint(selector);
  } catch (error) {
    console.error('Direct print error:', error);
    document.body.classList.remove('printing');
    document.documentElement.classList.remove('is-printing');
  }
};

/**
 * Handle print errors and navigation to error page
 */
export const handlePrintError = (error: Error): void => {
  console.error('Print error handling:', error);
  
  // Clean up
  cleanupAfterPrinting();
  
  // Show toast notification
  toast({
    title: "Print Error",
    description: error.message || "An error occurred while printing",
    variant: "destructive",
  });
  
  // Navigate to error page for cross-origin errors
  if (error.message.includes('cross-origin') || 
      error.message.includes('Permission denied') ||
      error.message.includes('security restriction')) {
    navigationService.navigateToPrintError(error.message);
  }
};
