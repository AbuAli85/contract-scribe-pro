
/**
 * Print Debugger Utility
 * 
 * A comprehensive utility to help diagnose printing issues across different browsers,
 * operating systems and devices.
 */

type PrintDebugInfo = {
  browser: {
    name: string;
    version: string;
    userAgent: string;
    engine: string;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelRatio: number;
  };
  document: {
    printElementsCount: number;
    printContainerFound: boolean;
    cssStylesheetsCount: number;
    printMediaStylesheetsCount: number;
    printableElementsVisible: boolean;
    height: string;
    width: string;
  };
  system: {
    platform: string;
    deviceMemory?: number;
    cookiesEnabled: boolean;
    language: string;
    timezone: string;
    doNotTrack?: string | null;
  };
  fonts: {
    loaded: boolean;
    usedFontsCount: number;
  };
  errors: string[];
}

/**
 * Detects the browser and its version
 */
const detectBrowser = (): { name: string; version: string; engine: string } => {
  const userAgent = navigator.userAgent;
  let name = "Unknown";
  let version = "Unknown";
  let engine = "Unknown";
  
  // Extract browser information
  if (userAgent.indexOf("Firefox") > -1) {
    name = "Firefox";
    engine = "Gecko";
    const match = userAgent.match(/Firefox\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Edg") > -1) {
    name = "Edge";
    engine = "Blink";
    const match = userAgent.match(/Edg\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Chrome") > -1) {
    name = "Chrome";
    engine = "Blink";
    const match = userAgent.match(/Chrome\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Safari") > -1) {
    name = "Safari";
    engine = "WebKit";
    const match = userAgent.match(/Version\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    name = "Internet Explorer";
    engine = "Trident";
    const match = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Opera") > -1) {
    name = "Opera";
    engine = "Presto";
    const match = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/);
    if (match) version = match[1];
  }
  
  return { name, version, engine };
};

/**
 * Check if print stylesheets are properly loaded
 */
const checkPrintStylesheets = (): { count: number; found: boolean } => {
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

/**
 * Check the visibility of print elements
 */
const checkPrintElementsVisibility = (): boolean => {
  // Check for .print-container first
  const printContainer = document.querySelector('.print-container');
  if (!printContainer) return false;
  
  // Check key elements for printing
  const criticalElements = [
    '.contract-preview', 
    '.contract-content', 
    '.contract-column',
    '.signature-area'
  ];
  
  // All critical elements must be present and visible
  return criticalElements.every(selector => {
    const element = document.querySelector(selector);
    if (!element) return false;
    
    if (element instanceof HTMLElement) {
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    }
    
    return true;
  });
};

/**
 * Check for used fonts in the document
 */
const checkFonts = (): { loaded: boolean; usedFontsCount: number } => {
  try {
    // @ts-ignore - document.fonts is a modern API not in all TypeScript definitions
    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      // Count the number of unique font families being used
      const fontSet = new Set<string>();
      document.querySelectorAll('*').forEach(element => {
        const fontFamily = window.getComputedStyle(element).fontFamily;
        if (fontFamily && fontFamily !== 'inherit') {
          fontSet.add(fontFamily);
        }
      });
      
      return {
        loaded: document.fonts.status === 'loaded',
        usedFontsCount: fontSet.size
      };
    }
  } catch (e) {
    console.error('Error checking fonts:', e);
  }
  
  return {
    loaded: true, // Assume loaded if we can't check
    usedFontsCount: 0
  };
};

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

/**
 * Print debug panel component properties
 */
export interface PrintDebugPanelProps {
  visible?: boolean;
  onClose?: () => void;
}

/**
 * Exports a small debug function that can be attached to the window for accessibility
 */
export const attachDebuggerToWindow = (): void => {
  // @ts-ignore - Adding to window object
  window.printDebug = () => {
    logPrintDebugInfo();
    return "Print debug information logged to console. Check the console for details.";
  };
  
  console.info('Print debugger attached to window. Type "printDebug()" in console to run diagnostics.');
};

export default {
  generatePrintDebugInfo,
  logPrintDebugInfo,
  attachDebuggerToWindow
};
