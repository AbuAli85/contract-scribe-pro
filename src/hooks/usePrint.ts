
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
    
    printService.print({
      selector,
      onSuccess: () => {
        setIsPrinting(false)
        options.onSuccess?.()
      },
      onError: (error) => {
        console.error('Print error:', error)
        
        // Show error toast
        toast({
          title: "Print Error",
          description: error instanceof Error ? error.message : "An error occurred while printing",
          variant: "destructive",
        })
        
        // Navigate to the print error page for serious errors
        if (error.message.includes('content validation failed') || 
            error.message.includes('Print function not available')) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown printing error occurred'
          navigate('/print-error?error=' + encodeURIComponent(errorMessage))
        }
        
        setIsPrinting(false)
        options.onError?.(error)
      }
    }).catch(error => {
      // This catch is just a fallback; errors should be handled by onError
      console.error('Unhandled print error:', error)
      setIsPrinting(false)
      
      toast({
        title: "Print Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    })
  }, [navigate, isPrinting, options, toast])

  return { isPrinting, handlePrint }
}
