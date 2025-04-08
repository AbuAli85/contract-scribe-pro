
import { contractService } from './contract.service'
import { toast } from '@/hooks/use-toast'
import { navigationService } from './navigation.service'

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
      
      // Log visibility state for debugging
      console.log(`Print visibility fixes applied to ${selector}`)
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
      onError
    } = options
    
    return new Promise((resolve, reject) => {
      try {
        // Safety check - only proceed if we're in the same origin
        if (window !== window.top) {
          const error = new Error('Cannot print from inside an iframe - security restriction')
          console.error(error)
          onError?.(error)
          reject(error)
          return
        }
        
        // Add printing classes immediately
        document.body.classList.add('printing')
        document.documentElement.classList.add('is-printing')
        
        // Apply visibility fixes first
        printService.fixVisibility(selector)
        
        // Short delay to ensure styles are applied
        setTimeout(() => {
          try {
            // Execute print using native window.print()
            if (typeof window !== 'undefined' && typeof window.print === 'function') {
              // Call the native print function directly
              window.print()
              
              // Handle success after print dialog closes
              setTimeout(() => {
                printService.cleanupAfterPrinting()
                console.log('Print operation completed')
                onSuccess?.()
                resolve()
              }, 1000)
            } else {
              throw new Error('Print function not available in this environment')
            }
          } catch (error) {
            // Handle any errors during the print call
            const printError = error instanceof Error ? error : new Error('Unknown printing error')
            console.error('Print execution error:', printError)
            
            // Clean up
            printService.cleanupAfterPrinting()
            
            // Handle error
            onError?.(printError)
            reject(printError)
          }
        }, 100)
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
  printNow: (): void => {
    try {
      // Safety check
      if (window !== window.top) {
        console.error('Cannot print from inside an iframe - security restriction')
        return
      }
      
      // Add printing classes
      document.body.classList.add('printing')
      document.documentElement.classList.add('is-printing')
      
      // Call the native print function directly
      window.print()
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.classList.remove('printing')
        document.documentElement.classList.remove('is-printing')
      }, 1000)
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
