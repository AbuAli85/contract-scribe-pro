
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { printService } from '@/services/print.service'

export type UsePrintOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  selector?: string
}

export function usePrint(options: UsePrintOptions = {}) {
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()
  
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
        
        // Navigate to the print error page
        const errorMessage = error instanceof Error ? error.message : 'Unknown printing error occurred'
        navigate('/print-error?error=' + encodeURIComponent(errorMessage))
        
        setIsPrinting(false)
        options.onError?.(error)
      }
    }).catch(error => {
      // This catch is just a fallback; errors should be handled by onError
      console.error('Unhandled print error:', error)
      setIsPrinting(false)
    })
  }, [navigate, isPrinting, options])

  return { isPrinting, handlePrint }
}
