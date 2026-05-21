
/**
 * Stylesheet Checker Utility
 * 
 * Utility for checking print stylesheets
 */

/**
 * Check if print stylesheets are properly loaded
 */
export const checkPrintStylesheets = (): { count: number; found: boolean } => {
  const stylesheets = document.styleSheets;
  let printStylesheetsCount = 0;
  
  try {
    for (let i = 0; i < stylesheets.length; i++) {
      try {
        const sheet = stylesheets[i];
        // Check if it's a print media stylesheet
        if (sheet.media && sheet.media.mediaText && sheet.media.mediaText.includes('print')) {
          printStylesheetsCount++;
        } else if (sheet.href && (
          sheet.href.includes('print-layout.css') || 
          sheet.href.includes('print-components.css') || 
          sheet.href.includes('print-typography.css') || 
          sheet.href.includes('contract-print.css')
        )) {
          printStylesheetsCount++;
        }
      } catch (e) {
        // Accessing some stylesheets may throw security errors if they're from another domain
        console.log('Could not access stylesheet:', e);
      }
    }
  } catch (e) {
    console.error('Error checking stylesheets:', e);
  }
  
  return { 
    count: printStylesheetsCount, 
    found: printStylesheetsCount > 0 
  };
};
