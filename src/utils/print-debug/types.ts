
/**
 * Print Debugger Types
 * 
 * Type definitions for the print debugging system
 */

export type PrintDebugInfo = {
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
 * Print debug panel component properties
 */
export interface PrintDebugPanelProps {
  visible?: boolean;
  onClose?: () => void;
}
