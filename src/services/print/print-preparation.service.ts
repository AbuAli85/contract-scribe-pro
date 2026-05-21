
/**
 * Print Preparation Service
 * Handles preparation of elements for printing
 */
import { contractService } from '../contract.service';

/**
 * Apply visibility fixes to ensure content is visible during printing
 */
export const fixVisibility = (selector = '.print-container'): void => {
  try {
    // Add printing class to body for CSS targeting
    document.body.classList.add('printing');
    document.documentElement.classList.add('is-printing');
    
    // Force visibility of all critical elements
    contractService.fixPrintVisibility();
    
    // Add critical inline styles directly to ensure visibility
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body.printing * {
          visibility: visible !important;
        }
        
        body.printing .print-container,
        body.printing .contract-preview,
        body.printing .a4-page,
        body.printing .contract-content,
        body.printing .letterhead-background,
        body.printing .two-column-layout,
        body.printing .contract-column,
        body.printing .contract-text,
        body.printing .signature-area,
        body.printing .signature-block {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        body.printing .two-column-layout {
          display: flex !important;
        }
        
        @page {
          size: A4 portrait;
          margin: 0;
        }
        
        html, body, #root {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Apply direct style changes to contract elements
    const container = document.querySelector(selector);
    if (container) {
      // Critical elements that must be visible
      const criticalSelectors = [
        '.contract-preview',
        '.a4-page',
        '.contract-content',
        '.letterhead-background',
        '.two-column-layout',
        '.contract-column',
        '.signature-area',
        '.reference-section',
        '.contract-title',
        '.id-photo-container'
      ];
      
      criticalSelectors.forEach(criticalSelector => {
        const elements = document.querySelectorAll(criticalSelector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            // Determine correct display style
            const display = criticalSelector === '.two-column-layout' ? 'flex' : 'block';
            el.style.display = display;
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            
            // Ensure proper z-index for layering
            if (criticalSelector === '.contract-content') {
              el.style.position = 'relative';
              el.style.zIndex = '10';
            } else if (criticalSelector === '.letterhead-background') {
              el.style.position = 'absolute';
              el.style.zIndex = '1';
            }
          }
        });
      });
    }
    
    // Log visibility state for debugging
    console.log(`Print visibility fixes applied to ${selector}`);
    
    // Remove the style after a short delay (it's only needed for the initial fix)
    setTimeout(() => {
      try {
        document.head.removeChild(style);
      } catch (e) {
        // Ignore errors if the element was already removed
      }
    }, 5000);
  } catch (error) {
    console.error('Error fixing print visibility:', error);
  }
};

/**
 * Clean up after printing is complete
 */
export const cleanupAfterPrinting = (): void => {
  // Remove printing classes
  document.body.classList.remove('printing');
  document.documentElement.classList.remove('is-printing');
  console.log('Print cleanup completed');
};
