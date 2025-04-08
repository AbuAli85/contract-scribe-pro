
import { useState } from 'react'

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = (selector = '.print-container') => {
    setIsPrinting(true)
    
    setTimeout(() => {
      try {
        // Add printing class to body
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
            width: 100%;
            height: 100%;
            overflow: visible !important;
          }
          .print-container, .contract-preview, .a4-page, .contract-content, .letterhead-background,
          .contract-title-area, .reference-section, .id-photo-container, .signature-area,
          .contract-column, .promoter-details, .responsibilities, .two-column-layout {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .letterhead-background {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important;
            opacity: 0.8 !important;
          }
          .contract-content {
            position: relative !important;
            z-index: 10 !important;
            padding: 20mm !important;
          }
          .two-column-layout {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            gap: 10mm !important;
            margin-bottom: 15mm !important;
          }
          .contract-column {
            flex: 1 !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
          }
          .print-button, .print-hidden {
            display: none !important;
          }
          
          /* These styles ensure text is visible */
          .contract-text, .promoter-details, .responsibilities, 
          .best-regards, .contract-title, .contract-main-title,
          .reference-number, .info-row, .responsibilities-title,
          .bottom-info, .signature-name {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
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
            <body class="printing">
              ${content.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    document.querySelectorAll('.contract-text, .promoter-details, .responsibilities, .reference-number, .contract-title, .contract-main-title').forEach(function(el) {
                      el.style.display = 'block';
                      el.style.visibility = 'visible';
                      el.style.opacity = '1';
                      el.style.color = 'black';
                    });
                    
                    // Wait a bit for styles to apply before printing
                    setTimeout(function() {
                      window.print();
                      // Close after printing
                      setTimeout(function() {
                        window.close();
                      }, 500);
                    }, 500);
                  }, 500);
                }
              </script>
            </body>
          </html>
        `)
        
        printWindow.document.close()
      } catch (error) {
        console.error('Print error:', error)
        
        // Navigate to the print error page instead of opening a new window
        window.location.href = '/print-error';
      } finally {
        // Remove printing class after a delay
        setTimeout(() => {
          document.body.classList.remove('printing')
          setIsPrinting(false)
        }, 1000)
      }
    }, 300)
  }

  return { isPrinting, handlePrint }
}
