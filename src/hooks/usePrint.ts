
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { printService } from '@/services/print.service'
import { useToast } from '@/hooks/use-toast'

export type UsePrintOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  selector?: string
}

export function usePrint(options: UsePrintOptions = {}) {
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const handlePrint = useCallback((selector = '.print-container') => {
    if (isPrinting) return
    
    setIsPrinting(true)
    
    try {
      // Directly use window.print for maximum compatibility
      // This is the most reliable way to print across all browsers
      // and avoids cross-origin issues entirely
      
      // Apply visibility fixes first
      printService.fixVisibility(selector)
      
      // Short timeout to ensure styles are applied
      setTimeout(() => {
        // Call window.print directly
        window.print()
        
        // Handle success
        setTimeout(() => {
          setIsPrinting(false)
          options.onSuccess?.()
        }, 1000)
      }, 100)
    } catch (error) {
      console.error('Print error:', error)
      
      // Show error toast
      toast({
        title: "Print Error",
        description: error instanceof Error ? error.message : "An error occurred while printing",
        variant: "destructive",
      })
      
      // Navigate to the print error page for serious errors
      if (error instanceof Error && (
          error.message.includes('cross-origin') || 
          error.message.includes('Permission denied'))) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown printing error occurred'
        navigate('/print-error?error=' + encodeURIComponent(errorMessage))
      }
      
      setIsPrinting(false)
      options.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [navigate, isPrinting, options, toast])

  return { isPrinting, handlePrint }
}
