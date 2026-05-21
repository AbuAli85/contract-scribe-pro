
/**
 * Print Debug Logger
 * 
 * Logs debug information to console
 */

import { generatePrintDebugInfo } from './debug-generator';
import { PrintDebugInfo } from './types';

/**
 * Formats debug information for console output
 */
export const logPrintDebugInfo = (): PrintDebugInfo => {
  const debugInfo = generatePrintDebugInfo();
  
  console.group('🖨️ Print Debug Information');
  
  console.group('🌐 Browser Information');
  console.log(`Browser: ${debugInfo.browser.name} ${debugInfo.browser.version}`);
  console.log(`Engine: ${debugInfo.browser.engine}`);
  console.log(`User Agent: ${debugInfo.browser.userAgent}`);
  console.groupEnd();
  
  console.group('📱 Screen Information');
  console.log(`Window Size: ${debugInfo.screen.width} x ${debugInfo.screen.height}`);
  console.log(`Screen Size: ${debugInfo.screen.availWidth} x ${debugInfo.screen.availHeight}`);
  console.log(`Pixel Ratio: ${debugInfo.screen.pixelRatio}`);
  console.log(`Color Depth: ${debugInfo.screen.colorDepth}`);
  console.groupEnd();
  
  console.group('📄 Document Information');
  console.log(`Print Container Found: ${debugInfo.document.printContainerFound ? 'Yes' : 'No'}`);
  console.log(`Printable Elements Count: ${debugInfo.document.printElementsCount}`);
  console.log(`Printable Elements Visible: ${debugInfo.document.printableElementsVisible ? 'Yes' : 'No'}`);
  console.log(`Document Size: ${debugInfo.document.width} x ${debugInfo.document.height}`);
  console.log(`Stylesheets Count: ${debugInfo.document.cssStylesheetsCount}`);
  console.log(`Print Stylesheets Count: ${debugInfo.document.printMediaStylesheetsCount}`);
  console.groupEnd();
  
  console.group('🖥️ System Information');
  console.log(`Platform: ${debugInfo.system.platform}`);
  console.log(`Language: ${debugInfo.system.language}`);
  console.log(`Timezone: ${debugInfo.system.timezone}`);
  console.log(`Cookies Enabled: ${debugInfo.system.cookiesEnabled ? 'Yes' : 'No'}`);
  if (debugInfo.system.deviceMemory) {
    console.log(`Device Memory: ${debugInfo.system.deviceMemory}GB`);
  }
  console.groupEnd();
  
  console.group('🔤 Font Information');
  console.log(`Fonts Loaded: ${debugInfo.fonts.loaded ? 'Yes' : 'No'}`);
  console.log(`Unique Font Families: ${debugInfo.fonts.usedFontsCount}`);
  console.groupEnd();
  
  if (debugInfo.errors.length > 0) {
    console.group('❌ Errors');
    debugInfo.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return debugInfo;
};
