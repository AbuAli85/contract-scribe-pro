
import { contractService } from './contract.service'
import { toast } from '@/components/ui/use-toast'
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
    // Remove printing class from body
    document.body.classList.remove('printing')
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
   * Print content using optimized approach for most browser support
   */
  print: (options: PrintOptions = {}): Promise<void> => {
    const { 
      selector = '.print-container', 
      timeout = 300,
      onSuccess,
      onError
    } = options
    
    return new Promise((resolve, reject) => {
      // Add printing class immediately
      document.body.classList.add('printing')
      
      setTimeout(() => {
        try {
          // Validate print content
          if (!printService.validatePrintContent(selector)) {
            const error = new Error('Print content validation failed')
            reject(error)
            onError?.(error)
            return
          }
          
          // Apply visibility fixes
          printService.fixVisibility(selector)
          
          // Short delay to ensure visibility changes take effect
          setTimeout(() => {
            console.log('Executing print command...')
            
            try {
              // SAFER APPROACH: Use direct window.print method only
              // Avoid cross-origin issues by not trying to access window.parent or other contexts
              if (typeof window !== 'undefined' && window.self) {
                // Direct approach - no framebusting or cross-origin attempts
                window.print();
                console.log('Print function called successfully directly on window');
              } else {
                throw new Error('Window object not available');
              }
              
              // Clean up after print dialog closes
              setTimeout(() => {
                printService.cleanupAfterPrinting()
                console.log('Print operation completed')
                onSuccess?.()
                resolve()
              }, 1000)
            } catch (printError) {
              console.error('Print system error:', printError)
              reject(new Error('Print system error: ' + (printError instanceof Error ? printError.message : String(printError))))
              onError?.(new Error('Print system error: ' + (printError instanceof Error ? printError.message : String(printError))))
              printService.cleanupAfterPrinting()
            }
          }, 500)
        } catch (error) {
          const printError = error instanceof Error ? error : new Error('Unknown printing error')
          console.error('Print error:', printError)
          
          // Clean up after error
          printService.cleanupAfterPrinting()
          
          // Handle error callback
          onError?.(printError)
          reject(printError)
        }
      }, timeout)
    })
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
    
    // Navigate to error page
    navigationService.navigateToPrintError(error.message)
  }
}
