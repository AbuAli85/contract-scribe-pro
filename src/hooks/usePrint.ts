
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
        
        // Create print window with proper debugging
        console.log("Creating print window with content:", content.outerHTML.substring(0, 200) + "...")
        
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          throw new Error('Could not open print window. Please check your popup blocker settings.')
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
        
        // Add essential print styles
        styles += `
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            width: 100%;
            height: 100%;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-container, .contract-preview, .a4-page, .contract-content, 
          .letterhead-background, .contract-title-area, .reference-section, 
          .id-photo-container, .signature-area, .contract-column, 
          .promoter-details, .responsibilities, .two-column-layout {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background-color: white !important;
          }
          .two-column-layout {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            gap: 10mm !important;
          }
          .contract-column {
            flex: 1 !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
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
          .print-button, .print-hidden {
            display: none !important;
          }
          
          /* Force all text to be visible */
          .contract-text, .promoter-details, .responsibilities, 
          .best-regards, .contract-title, .contract-main-title,
          .reference-number, .info-row, .responsibilities-title,
          .bottom-info, .signature-name, .signature-block, .signature-area,
          .id-photo-container, .id-photo, .contract-title-area {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
          }
        `
        
        // Write complete HTML to the new window with debugging
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
                // Log the content for debugging
                console.log("Print window content loaded:", document.body.innerHTML.substring(0, 200) + "...");
                
                window.onload = function() {
                  // Add visibility check
                  const contractContent = document.querySelector('.contract-content');
                  const twoColumnLayout = document.querySelector('.two-column-layout');
                  
                  console.log("Contract content found:", contractContent ? "Yes" : "No");
                  console.log("Two column layout found:", twoColumnLayout ? "Yes" : "No");
                  
                  // Force all elements to be visible
                  document.querySelectorAll('.contract-text, .promoter-details, .responsibilities, .reference-number, .contract-title, .contract-main-title, .signature-area, .signature-block, .two-column-layout, .contract-column, .id-photo-container, .letterhead-background, .a4-page, .contract-content').forEach(function(el) {
                    el.style.display = el.classList.contains('two-column-layout') ? 'flex' : 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    if (!el.classList.contains('two-column-layout')) {
                      el.style.color = 'black';
                    }
                  });
                  
                  // Fix specific layout containers
                  if (twoColumnLayout) {
                    twoColumnLayout.style.display = 'flex';
                    twoColumnLayout.style.flexDirection = 'row';
                    twoColumnLayout.style.justifyContent = 'space-between';
                    twoColumnLayout.style.gap = '10mm';
                    twoColumnLayout.style.visibility = 'visible';
                    twoColumnLayout.style.opacity = '1';
                  }
                  
                  // Wait for styles to apply before printing
                  setTimeout(function() {
                    console.log("Printing now...");
                    window.print();
                    // Close after printing
                    setTimeout(function() {
                      window.close();
                    }, 1000);
                  }, 1000);
                }
              </script>
            </body>
          </html>
        `)
        
        printWindow.document.close()
      } catch (error) {
        console.error('Print error:', error)
        
        // Navigate to the print error page
        const errorMessage = error instanceof Error ? error.message : 'Unknown printing error occurred';
        navigate('/print-error?error=' + encodeURIComponent(errorMessage));
      } finally {
        // Remove printing class after a delay
        setTimeout(() => {
          document.body.classList.remove('printing')
          setIsPrinting(false)
        }, 2000)
      }
    }, 500)
  }, [navigate])

  return { isPrinting, handlePrint }
}
