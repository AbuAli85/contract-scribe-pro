
import { generatePrintDebugInfo, PrintDebugInfo } from './print-debug';

/**
 * Advanced print diagnostics utility
 * Helps identify and resolve printing issues
 */
export const printDiagnostics = {
  /**
   * Perform a comprehensive print system check
   */
  runDiagnostics: (): PrintDebugInfo => {
    try {
      const info = generatePrintDebugInfo();
      console.log('Print diagnostics completed:', info);
      return info;
    } catch (error) {
      console.error('Error running print diagnostics:', error);
      throw error;
    }
  },
  
  /**
   * Check for common printing issues
   */
  checkForIssues: (): { hasIssues: boolean; issues: string[] } => {
    const issues: string[] = [];
    const info = generatePrintDebugInfo();
    
    // Check for print container
    if (!info.document.printContainerFound) {
      issues.push('No print container found in document. Add a div with class="print-container".');
    }
    
    // Check for print stylesheets
    if (info.document.printMediaStylesheetsCount === 0) {
      issues.push('No print-specific stylesheets detected. Add @media print {} rules to your CSS.');
    }
    
    // Check for element visibility
    if (!info.document.printableElementsVisible) {
      issues.push('Some print elements are not visible. Check display, visibility, and opacity styles.');
    }
    
    // Check for elements that should be hidden during printing
    const nonPrintableElements = document.querySelectorAll(
      'button:not(.print-hidden), nav:not(.print-hidden), header:not(.print-hidden)'
    );
    if (nonPrintableElements.length > 0) {
      issues.push(`${nonPrintableElements.length} UI elements found that should be hidden during printing.`);
    }
    
    // Check for Firefox-specific issues
    if (info.browser.name === 'Firefox') {
      issues.push('Using Firefox - ensure you have color-adjust: exact !important in your print styles.');
    }
    
    // Check for Safari-specific issues
    if (info.browser.engine === 'WebKit') {
      issues.push('Using WebKit (Safari) - add -webkit-print-color-adjust: exact !important to print styles.');
    }
    
    return {
      hasIssues: issues.length > 0,
      issues
    };
  },
  
  /**
   * Apply automatic fixes for common print issues
   */
  applyQuickFixes: (): void => {
    // 1. Add print class to body
    document.body.classList.add('printing');
    
    // 2. Force critical elements to be visible
    const criticalSelectors = [
      '.print-container',
      '.contract-preview',
      '.a4-page',
      '.contract-content',
      '.letterhead-background',
      '.reference-section',
      '.contract-title-area',
      '.two-column-layout',
      '.contract-column',
      '.contract-text',
      '.promoter-details',
      '.responsibilities',
      '.signature-area',
      '.signature-block',
      '.contract-title',
      '.contract-main-title',
      '.best-regards',
      '.id-photo-container'
    ];
    
    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = selector === '.two-column-layout' ? 'flex' : 'block';
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });
    });
    
    // 3. Hide UI elements
    const uiElements = document.querySelectorAll('button, nav, header, .tabs-list');
    uiElements.forEach(el => {
      if (el instanceof HTMLElement && !el.closest('.print-container')) {
        el.style.display = 'none';
      }
    });
    
    console.log('Quick fixes applied for printing');
  },
  
  /**
   * Get browser-specific print troubleshooting information
   */
  getBrowserSpecificInfo: (): { browserName: string; tips: string[] } => {
    const info = generatePrintDebugInfo();
    const browserName = info.browser.name;
    const tips: string[] = [];
    
    switch (browserName) {
      case 'Chrome':
        tips.push('Add -webkit-print-color-adjust: exact !important to your print styles');
        tips.push('Try using print-color-adjust: exact !important as well');
        tips.push('Check "Background graphics" in the print dialog');
        break;
      case 'Firefox':
        tips.push('Add color-adjust: exact !important to your print styles');
        tips.push('Check "Print Background Colors" and "Print Background Images" in the print dialog');
        break;
      case 'Safari':
        tips.push('Add -webkit-print-color-adjust: exact !important to your print styles');
        tips.push('Enable printing background images in Safari preferences');
        break;
      case 'Edge':
        tips.push('Add -webkit-print-color-adjust: exact !important to your print styles');
        tips.push('Check "Background graphics" in the print dialog');
        break;
      default:
        tips.push('Ensure print styles include display: block !important for all elements');
        tips.push('Make sure all critical content has visibility: visible !important');
    }
    
    return {
      browserName,
      tips
    };
  }
};
