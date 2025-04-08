
import { contractService } from './contract.service'
import { toast } from '@/hooks/use-toast'
import { navigationService } from './navigation.service'
import { directPrint, needsDirectPrintFallback } from '@/utils/direct-print'

export type PrintElement = {
  selector: string
  display?: 'block' | 'flex' | 'grid'
}

export type PrintOptions = {
  selector?: string
  timeout?: number
  elements?: PrintElement[]
  onSuccess?: () => void
  onError?: (error: Error) => void
  forceDirectPrint?: boolean
}

/**
 * Centralized print service that handles all print-related functionality
 */
export const printService = {
  /**
   * Apply visibility fixes to ensure content is visible during printing
   */
  fixVisibility: (selector = '.print-container'): void => {
    try {
      // Add printing class to body for CSS targeting
      document.body.classList.add('printing')
      document.documentElement.classList.add('is-printing')
      
      // Force visibility of all critical elements
      contractService.fixPrintVisibility()
      
      // Add critical inline styles directly to ensure visibility
      const style = document.createElement('style')
      style.innerHTML = `
        @media print {
          body.printing * {
            visibility: visible !important;
          }
          
          body.printing .print-container,
          body.printing .contract-preview,
          body.printing .a4-page,
          body.printing .contract-content,
          body.printing .letterhead-background,
          body.printing .two-column-layout,
          body.printing .contract-column,
          body.printing .contract-text,
          body.printing .signature-area,
          body.printing .signature-block {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          body.printing .two-column-layout {
            display: flex !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          html, body, #root {
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
        }
      `
      document.head.appendChild(style)
      
      // Apply direct style changes to contract elements
      const container = document.querySelector(selector);
      if (container) {
        // Critical elements that must be visible
        const criticalSelectors = [
          '.contract-preview',
          '.a4-page',
          '.contract-content',
          '.letterhead-background',
          '.two-column-layout',
          '.contract-column',
          '.signature-area',
          '.reference-section',
          '.contract-title',
          '.id-photo-container'
        ];
        
        criticalSelectors.forEach(criticalSelector => {
          const elements = document.querySelectorAll(criticalSelector);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              
              // Determine display based on selector
              if (criticalSelector === '.two-column-layout') {
                el.style.display = 'flex';
              } else {
                el.style.display = 'block';
              }
              
              // Ensure proper z-index for layering
              if (criticalSelector === '.contract-content') {
                el.style.position = 'relative';
                el.style.zIndex = '10';
              } else if (criticalSelector === '.letterhead-background') {
                el.style.position = 'absolute';
                el.style.zIndex = '1';
              }
            }
          });
        });
      }
      
      // Log visibility state for debugging
      console.log(`Print visibility fixes applied to ${selector}`)
      
      // Remove the style after a short delay (it's only needed for the initial fix)
      setTimeout(() => {
        try {
          document.head.removeChild(style)
        } catch (e) {
          // Ignore errors if the element was already removed
        }
      }, 5000)
    } catch (error) {
      console.error('Error fixing print visibility:', error)
    }
  },
  
  /**
   * Clean up after printing is complete
   */
  cleanupAfterPrinting: (): void => {
    // Remove printing classes
    document.body.classList.remove('printing')
    document.documentElement.classList.remove('is-printing')
    console.log('Print cleanup completed')
  },
  
  /**
   * Validate that the print content exists and is visible
   */
  validatePrintContent: (selector = '.print-container'): boolean => {
    try {
      // Check if content exists
      const content = document.querySelector(selector)
      if (!content) {
        console.error('Print content not found:', selector)
        return false
      }
      
      // Check if content is empty
      if (!content.innerHTML || content.innerHTML.trim() === '') {
        console.error('Print content is empty')
        return false
      }
      
      // Check key elements exist using contractService
      const isPrintable = contractService.validatePrintability()
      console.log('Contract printability check:', isPrintable)
      
      return isPrintable
    } catch (error) {
      console.error('Error validating print content:', error)
      return false
    }
  },
  
  /**
   * Print content using direct window.print approach for maximum compatibility
   * This method avoids cross-origin issues by using the native window.print() directly
   */
  print: (options: PrintOptions = {}): Promise<void> => {
    const { 
      selector = '.print-container', 
      timeout = 300,
      onSuccess,
      onError,
      forceDirectPrint = true // Default to direct print for maximum compatibility
    } = options
    
    return new Promise((resolve, reject) => {
      try {
        // Add printing classes immediately
        document.body.classList.add('printing')
        document.documentElement.classList.add('is-printing')
        
        // Apply visibility fixes first
        printService.fixVisibility(selector)
        
        // Always use direct print method for better browser compatibility
        console.log('Using direct print method for better compatibility')
        
        try {
          // Use direct print utility
          directPrint(selector)
          
          // Handle success after print dialog closes
          setTimeout(() => {
            printService.cleanupAfterPrinting()
            console.log('Print operation completed')
            onSuccess?.()
            resolve()
          }, 1000)
        } catch (error) {
          const printError = error instanceof Error 
            ? error 
            : new Error('Direct print failed')
          console.error('Direct print error:', printError)
          onError?.(printError)
          reject(printError)
        }
      } catch (error) {
        // Handle any setup errors
        const printError = error instanceof Error ? error : new Error('Print setup error')
        console.error('Print setup error:', printError)
        
        // Clean up
        printService.cleanupAfterPrinting()
        
        // Handle error
        onError?.(printError)
        reject(printError)
      }
    })
  },
  
  /**
   * Safe window.print wrapper - avoids cross-origin issues
   * This is a synchronous function that can be called directly
   */
  printNow: (selector = '.print-container'): void => {
    try {
      // Direct print is the most reliable method
      directPrint(selector);
    } catch (error) {
      console.error('Direct print error:', error)
      document.body.classList.remove('printing')
      document.documentElement.classList.remove('is-printing')
    }
  },
  
  /**
   * Handle print errors and navigation to error page
   */
  handlePrintError: (error: Error): void => {
    console.error('Print error handling:', error)
    
    // Clean up
    printService.cleanupAfterPrinting()
    
    // Show toast notification
    toast({
      title: "Print Error",
      description: error.message || "An error occurred while printing",
      variant: "destructive",
    })
    
    // Navigate to error page for cross-origin errors
    if (error.message.includes('cross-origin') || 
        error.message.includes('Permission denied') ||
        error.message.includes('security restriction')) {
      navigationService.navigateToPrintError(error.message)
    }
  }
}
