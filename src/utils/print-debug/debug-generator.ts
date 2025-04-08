
/**
 * Print Debug Generator
 * 
 * Generates debug information about printing environment
 */

import { detectBrowser } from './browser-detector';
import { checkPrintStylesheets } from './stylesheet-checker';
import { checkPrintElementsVisibility } from './visibility-checker';
import { checkFonts } from './font-checker';
import { PrintDebugInfo } from './types';

/**
 * Generate comprehensive debug information about the current environment
 */
export const generatePrintDebugInfo = (): PrintDebugInfo => {
  const errors: string[] = [];
  
  try {
    const browserInfo = detectBrowser();
    const printStylesheetsInfo = checkPrintStylesheets();
    const printElementsVisible = checkPrintElementsVisibility();
    const fontInfo = checkFonts();
    
    // Check for print containers
    const printContainer = document.querySelector('.print-container');
    if (!printContainer) {
      errors.push('Print container (.print-container) not found in document');
    }
    
    // Count print-related elements
    const printElements = document.querySelectorAll(
      '.print-container, .contract-preview, .contract-content, .contract-column, .signature-area, .two-column-layout'
    ).length;
    
    if (printElements === 0) {
      errors.push('No printable elements found in document');
    }
    
    // Check document dimensions
    const documentElement = document.documentElement;
    if (documentElement.scrollHeight === 0 || documentElement.scrollWidth === 0) {
      errors.push('Document has zero height or width');
    }
    
    // Memory might not be available in all browsers
    let deviceMemory: number | undefined = undefined;
    // @ts-ignore - navigator.deviceMemory is a newer API
    if (navigator.deviceMemory) {
      // @ts-ignore
      deviceMemory = navigator.deviceMemory;
    }
    
    return {
      browser: {
        name: browserInfo.name,
        version: browserInfo.version,
        userAgent: navigator.userAgent,
        engine: browserInfo.engine
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
      },
      document: {
        printElementsCount: printElements,
        printContainerFound: !!printContainer,
        cssStylesheetsCount: document.styleSheets.length,
        printMediaStylesheetsCount: printStylesheetsInfo.count,
        printableElementsVisible: printElementsVisible,
        height: `${documentElement.scrollHeight}px`,
        width: `${documentElement.scrollWidth}px`
      },
      system: {
        platform: navigator.platform,
        deviceMemory,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        doNotTrack: navigator.doNotTrack
      },
      fonts: fontInfo,
      errors
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return {
      browser: { name: 'Error', version: 'Error', userAgent: 'Error', engine: 'Error' },
      screen: { width: 0, height: 0, availWidth: 0, availHeight: 0, colorDepth: 0, pixelRatio: 0 },
      document: {
        printElementsCount: 0,
        printContainerFound: false,
        cssStylesheetsCount: 0,
        printMediaStylesheetsCount: 0,
        printableElementsVisible: false,
        height: '0',
        width: '0'
      },
      system: {
        platform: 'Error',
        cookiesEnabled: false,
        language: 'Error',
        timezone: 'Error'
      },
      fonts: { loaded: false, usedFontsCount: 0 },
      errors: ['Failed to generate debug info: ' + errorMessage]
    };
  }
};
