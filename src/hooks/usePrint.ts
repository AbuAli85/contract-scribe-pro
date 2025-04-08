
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { printService } from '@/services/print.service'
import { useToast } from '@/hooks/use-toast'

export type UsePrintOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  selector?: string
  language?: 'en' | 'ar'
}

export function usePrint(options: UsePrintOptions = {}) {
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const handlePrint = useCallback((selector = '.print-container') => {
    if (isPrinting) return
    
    setIsPrinting(true)
    
    try {
      // Apply visibility fixes first
      printService.fixVisibility(selector)
      
      // Add critical printing class to html/body
      document.documentElement.classList.add('is-printing')
      document.body.classList.add('printing')
      
      // Short timeout to ensure styles are applied
      setTimeout(() => {
        try {
          // Call window.print directly for maximum compatibility
          window.print()
          
          // Handle success
          setTimeout(() => {
            // Remove printing classes
            document.documentElement.classList.remove('is-printing')
            document.body.classList.remove('printing')
            
            setIsPrinting(false)
            options.onSuccess?.()
            
            // Show success toast
            toast({
              title: options.language === "ar" ? "تمت الطباعة بنجاح" : "Print Successful",
              description: options.language === "ar" ? "تم إرسال المستند إلى الطابعة" : "Document has been sent to the printer",
            })
          }, 1000)
        } catch (error) {
          console.error('Print error:', error)
          
          // Clean up printing classes
          document.documentElement.classList.remove('is-printing')
          document.body.classList.remove('printing')
          
          // Show error toast
          toast({
            title: options.language === "ar" ? "خطأ في الطباعة" : "Print Error",
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
      }, 100)
    } catch (error) {
      console.error('Print setup error:', error)
      
      // Clean up printing classes
      document.documentElement.classList.remove('is-printing')
      document.body.classList.remove('printing')
      
      // Show error toast
      toast({
        title: options.language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : "An error occurred while printing",
        variant: "destructive",
      })
      
      setIsPrinting(false)
      options.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [navigate, isPrinting, options, toast])

  return { isPrinting, handlePrint }
}
