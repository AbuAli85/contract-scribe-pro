
/**
 * Print Debugger Types
 * 
 * Type definitions for the print debugging system
 */

export interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  engine: string;
}

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface DocumentInfo {
  printElementsCount: number;
  printContainerFound: boolean;
  cssStylesheetsCount: number;
  printMediaStylesheetsCount: number;
  printableElementsVisible: boolean;
  height: string;
  width: string;
}

export interface SystemInfo {
  platform: string;
  cookiesEnabled: boolean;
  language: string;
  timezone: string;
  deviceMemory?: number;
  doNotTrack?: string;
}

export interface FontInfo {
  loaded: boolean;
  usedFontsCount: number;
  usedFontFamilies?: string[];
}

export interface PrintDebugInfo {
  browser: BrowserInfo;
  screen: ScreenInfo;
  document: DocumentInfo;
  system: SystemInfo;
  fonts: FontInfo;
  errors: string[];
}

export interface PrintDebugPanelProps {
  visible?: boolean;
  onClose?: () => void;
}
