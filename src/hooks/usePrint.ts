
import { useState } from 'react'

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = (selector = '.print-container') => {
    setIsPrinting(true)
    
    setTimeout(() => {
      try {
        // Prepare content
        const content = document.querySelector(selector)
        if (!content) {
          throw new Error('Print content not found')
        }
        
        // Create print window
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          throw new Error('Could not open print window')
        }
        
        // Get all stylesheets from the current page
        const styleSheets = Array.from(document.styleSheets)
        let styles = ''
        
        // Extract styles from current page
        styleSheets.forEach(sheet => {
          try {
            if (sheet.cssRules) {
              const cssRules = Array.from(sheet.cssRules)
              styles += cssRules.map(rule => rule.cssText).join('\n')
            }
          } catch (e) {
            console.warn('Could not access stylesheet', e)
          }
        })
        
        // Add custom print styles
        styles += `
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          @media print {
            .print-button, .print-hidden {
              display: none !important;
            }
          }
        `
        
        // Write the HTML to the new window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Contract</title>
              <meta charset="utf-8">
              <style>${styles}</style>
            </head>
            <body>
              ${content.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                }
              </script>
            </body>
          </html>
        `)
        
        printWindow.document.close()
      } catch (error) {
        console.error('Print error:', error)
      } finally {
        setIsPrinting(false)
      }
    }, 300)
  }

  return { isPrinting, handlePrint }
}
