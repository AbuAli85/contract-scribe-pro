
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { printService } from '@/services/print.service'
import { useToast } from '@/hooks/use-toast'

export type UsePrintOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
  selector?: string
  language?: 'en' | 'ar'
  forceDirectPrint?: boolean
}

export function usePrint(options: UsePrintOptions = {}) {
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Clean up printing classes when component unmounts
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('is-printing')
      document.body.classList.remove('printing')
    }
  }, [])
  
  const handlePrint = useCallback((selector = '.print-container') => {
    if (isPrinting) return
    
    setIsPrinting(true)
    console.log('Print function called - adding printing classes')
    
    try {
      // Add critical printing class to html/body
      document.documentElement.classList.add('is-printing')
      document.body.classList.add('printing')
      
      // Force apply visibility fixes
      printService.fixVisibility(selector)
      
      // Use direct printing method for maximum compatibility
      if (options.forceDirectPrint) {
        // Directly call window.print() for maximum browser compatibility
        window.print()
        
        // Clean up after printing
        setTimeout(() => {
          document.documentElement.classList.remove('is-printing')
          document.body.classList.remove('printing')
          setIsPrinting(false)
          console.log('Print finished - removing printing classes')
          
          // Show success toast
          toast({
            title: options.language === "ar" ? "تمت الطباعة" : "Print Sent",
            description: options.language === "ar" 
              ? "تم إرسال المستند إلى الطابعة" 
              : "Document was sent to printer",
          })
          
          options.onSuccess?.()
        }, 1000)
        return
      }
      
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
            
            console.log('Print finished - removing printing classes')
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
          
          // Determine if it's a cross-origin or security error
          const isCrossOriginError = error instanceof Error && (
            error.message.includes('cross-origin') || 
            error.message.includes('Permission denied') ||
            error.message.includes('SecurityError')
          );
          
          // For security errors, still consider print successful
          // These errors often occur but don't actually prevent printing
          if (isCrossOriginError) {
            console.log('Security error detected but print likely succeeded');
            
            // Show success toast as the print dialog likely appeared
            toast({
              title: options.language === "ar" ? "تمت الطباعة" : "Print Sent",
              description: options.language === "ar" 
                ? "تم إرسال المستند إلى الطابعة رغم تحذيرات الأمان" 
                : "Document was sent to printer despite security warnings",
            })
            
            setIsPrinting(false);
            options.onSuccess?.();
            return;
          }
          
          // Show error toast for non-security errors
          toast({
            title: options.language === "ar" ? "خطأ في الطباعة" : "Print Error",
            description: error instanceof Error ? error.message : "An error occurred while printing",
            variant: "destructive",
          })
          
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
