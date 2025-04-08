
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { contractService } from '@/services/contract.service'

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()

  const handlePrint = useCallback((selector = '.print-container') => {
    setIsPrinting(true)
    
    setTimeout(() => {
      try {
        // Add printing class to body for CSS targeting
        document.body.classList.add('printing')
        
        // Prepare content
        const content = document.querySelector(selector)
        if (!content) {
          throw new Error('Print content not found')
        }
        
        // Check if content is empty
        if (!content.innerHTML || content.innerHTML.trim() === '') {
          throw new Error('Print content is empty')
        }
        
        // Validate and force visibility of critical elements
        contractService.fixPrintVisibility()
        
        // Direct print approach (more reliable than creating a new window)
        console.log("Starting direct print with content length:", content.innerHTML.length)
        
        // Force visibility of all critical elements before printing
        document.querySelectorAll('.contract-preview, .a4-page, .contract-content, .two-column-layout, .contract-column').forEach(el => {
          if (el instanceof HTMLElement) {
            // Apply forced visibility
            const display = el.classList.contains('two-column-layout') ? 'flex' : 'block'
            el.style.display = display
            el.style.visibility = 'visible'
            el.style.opacity = '1'
            
            // When debugging is needed
            console.log(`Forced visibility on ${el.className}`)
          }
        })
        
        // Short delay to ensure visibility changes take effect
        setTimeout(() => {
          // Use the browser's native print function
          window.print()
          
          // Clean up after print dialog closes
          setTimeout(() => {
            document.body.classList.remove('printing')
            setIsPrinting(false)
            console.log("Print operation completed")
          }, 1000)
        }, 500)
      } catch (error) {
        console.error('Print error:', error)
        
        // Navigate to the print error page
        const errorMessage = error instanceof Error ? error.message : 'Unknown printing error occurred'
        navigate('/print-error?error=' + encodeURIComponent(errorMessage))
        
        // Cleanup
        document.body.classList.remove('printing')
        setIsPrinting(false)
      }
    }, 300)
  }, [navigate])

  return { isPrinting, handlePrint }
}
