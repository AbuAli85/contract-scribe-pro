
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
        `
        
        // Check if we have content before proceeding
        if (!content.innerHTML || content.innerHTML.trim() === '') {
          // Show error page instead
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Contract Print Preview</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background-color: #f5f5f5;
                }
                
                .container {
                  max-width: 800px;
                  background: white;
                  padding: 40px;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                }
                
                h1 {
                  text-align: center;
                  color: #333;
                }
                
                p {
                  line-height: 1.6;
                  color: #555;
                }
                
                .error {
                  color: #e53e3e;
                  font-weight: bold;
                }
                
                .button {
                  display: inline-block;
                  background-color: #4299e1;
                  color: white;
                  padding: 10px 20px;
                  border-radius: 4px;
                  text-decoration: none;
                  margin-top: 20px;
                  cursor: pointer;
                }
                
                .button:hover {
                  background-color: #3182ce;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Contract Print System</h1>
                <p>This page has been replaced with a more reliable printing method.</p>
                <p>Please use the Print button on the contract page to print your contract.</p>
                <p>If you're seeing this page, it means you're using an outdated link or there was an error in the printing process.</p>
                <button onclick="window.close();" class="button">Close Window</button>
              </div>
            </body>
            </html>
          `)
          printWindow.document.close()
          setIsPrinting(false)
          document.body.classList.remove('printing')
          return
        }
        
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
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 100);
                  }, 500);
                }
              </script>
            </body>
          </html>
        `)
        
        printWindow.document.close()
      } catch (error) {
        console.error('Print error:', error)
        
        // Open error page
        const errorWindow = window.open('', '_blank')
        if (errorWindow) {
          errorWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Contract Print Error</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background-color: #f5f5f5;
                }
                
                .container {
                  max-width: 800px;
                  background: white;
                  padding: 40px;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                }
                
                h1 {
                  text-align: center;
                  color: #333;
                }
                
                p {
                  line-height: 1.6;
                  color: #555;
                }
                
                .error {
                  color: #e53e3e;
                  font-weight: bold;
                }
                
                .button {
                  display: inline-block;
                  background-color: #4299e1;
                  color: white;
                  padding: 10px 20px;
                  border-radius: 4px;
                  text-decoration: none;
                  margin-top: 20px;
                  cursor: pointer;
                }
                
                .button:hover {
                  background-color: #3182ce;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Contract Print Error</h1>
                <p class="error">An error occurred during the print preparation:</p>
                <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
                <p>Please try again or use a different browser.</p>
                <button onclick="window.close();" class="button">Close Window</button>
              </div>
            </body>
            </html>
          `)
          errorWindow.document.close()
        }
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
