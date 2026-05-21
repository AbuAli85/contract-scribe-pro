
/**
 * Direct print utility for handling browser-specific print issues
 */

/**
 * Performs direct printing with style injection for maximum compatibility
 */
export const directPrint = (selector = '.print-container') => {
  // First ensure the print container exists
  let printContainer = document.querySelector(selector);
  
  // If not found, try to find any printable content and make it the container
  if (!printContainer) {
    console.warn(`Print container "${selector}" not found, looking for alternatives`);
    const alternatives = [
      '.contract-preview',
      '.a4-page',
      '.contract-content',
      '.contract-container',
      '#print-content',
      '[data-testid="print-container"]'
    ];
    
    for (const alt of alternatives) {
      printContainer = document.querySelector(alt);
      if (printContainer) {
        console.log(`Found alternative print container: ${alt}`);
        printContainer.classList.add('print-container');
        selector = alt;
        break;
      }
    }
    
    // Last resort - use the entire body
    if (!printContainer) {
      console.warn('No print container found, using document.body');
      printContainer = document.body;
      selector = 'body';
    }
  }

  // Create a temporary style element for critical print styles
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      html, body, #root {
        height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      
      ${selector}, ${selector} * {
        display: initial !important;
        visibility: visible !important;
        opacity: 1 !important;
        overflow: visible !important;
      }
      
      .a4-page {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        position: relative !important;
        overflow: visible !important;
        min-height: 297mm !important;
        width: 210mm !important;
        display: block !important;
      }
      
      .letterhead-background {
        display: block !important;
        visibility: visible !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        opacity: 0.8 !important;
      }
      
      .contract-content {
        display: block !important;
        visibility: visible !important;
        position: relative !important;
        z-index: 10 !important;
        padding: 20mm !important;
      }
      
      .two-column-layout {
        display: flex !important;
        visibility: visible !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        gap: 10mm !important;
      }
      
      .contract-column {
        display: block !important;
        visibility: visible !important;
        flex: 1 !important;
      }
      
      .print-hidden, button:not(.signature-block button), .tabs-list, header, nav {
        display: none !important;
        visibility: hidden !important;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `;
  
  // Add style to head
  document.head.appendChild(style);
  
  try {
    // Add printing classes
    document.documentElement.classList.add('is-printing');
    document.body.classList.add('printing');
    
    // Apply last-minute visibility fixes - more aggressive approach
    const elements = document.querySelectorAll('.contract-preview, .a4-page, .contract-content, .two-column-layout, .contract-column, .signature-area, .letterhead-background, .promoter-details, .responsibilities, .contract-title, .id-photo-container');
    
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.visibility = 'visible';
        
        // Set appropriate display based on element type
        if (el.classList.contains('two-column-layout')) {
          el.style.display = 'flex';
        } else {
          el.style.display = 'block';
        }
        
        el.style.opacity = '1';
        
        // Force color for text elements
        if (!el.classList.contains('letterhead-background') &&
            !el.classList.contains('contract-preview') &&
            !el.classList.contains('a4-page')) {
          el.style.color = 'black';
        }
      }
    });
    
    // Short delay to ensure styles are applied
    setTimeout(() => {
      // Call print
      window.print();
      
      // Clean up after printing (with delay to ensure print dialog has time to appear)
      setTimeout(() => {
        // Remove style and classes
        try {
          document.head.removeChild(style);
        } catch (error) {
          console.error('Error removing style:', error);
        }
        document.documentElement.classList.remove('is-printing');
        document.body.classList.remove('printing');
      }, 1000);
    }, 200);
  } catch (error) {
    // Clean up if error occurs
    try {
      document.head.removeChild(style);
    } catch (innerError) {
      console.error('Error removing style:', innerError);
    }
    document.documentElement.classList.remove('is-printing');
    document.body.classList.remove('printing');
    throw error;
  }
};

/**
 * Checks if the browser needs direct print fallback
 */
export const needsDirectPrintFallback = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Safari often has issues with print dialog and cross-origin stylesheets
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  
  // Some older versions of Firefox have print issues
  const isOldFirefox = userAgent.includes('firefox') && 
    parseInt(userAgent.match(/firefox\/(\d+)/)?.[1] || '100', 10) < 80;
  
  // Some mobile browsers have print issues
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
  
  // Chrome can also have issues with certain print configurations
  const isChrome = userAgent.includes('chrome');
  
  // For now, return true for all browsers to use the direct print method
  // This is the most reliable approach until we can identify specific cases
  return true;
};
