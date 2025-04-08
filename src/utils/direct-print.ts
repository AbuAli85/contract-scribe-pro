
/**
 * Direct print utility for handling browser-specific print issues
 */

/**
 * Performs direct printing with style injection for maximum compatibility
 */
export const directPrint = (selector = '.print-container') => {
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
      }
      
      .letterhead-background {
        display: block !important;
        visibility: visible !important;
      }
      
      .contract-content {
        display: block !important;
        visibility: visible !important;
      }
      
      .two-column-layout {
        display: flex !important;
        visibility: visible !important;
      }
      
      .contract-column {
        display: block !important;
        visibility: visible !important;
      }
      
      .print-hidden, button:not(.signature-block button), .tabs-list, header, nav {
        display: none !important;
        visibility: hidden !important;
      }
    }
  `;
  
  // Add style to head
  document.head.appendChild(style);
  
  try {
    // Add printing classes
    document.documentElement.classList.add('is-printing');
    document.body.classList.add('printing');
    
    // Short delay to ensure styles are applied
    setTimeout(() => {
      // Call print
      window.print();
      
      // Clean up after printing (with delay to ensure print dialog has time to appear)
      setTimeout(() => {
        // Remove style and classes
        document.head.removeChild(style);
        document.documentElement.classList.remove('is-printing');
        document.body.classList.remove('printing');
      }, 1000);
    }, 100);
  } catch (error) {
    // Clean up if error occurs
    document.head.removeChild(style);
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
  
  return isSafari || isOldFirefox || isMobile;
};
