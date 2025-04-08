
/**
 * Print Debugger Utility
 * 
 * A comprehensive utility to help diagnose printing issues across different browsers,
 * operating systems and devices.
 */

// Re-export all modules
export * from './types';
export * from './browser-detector';
export * from './stylesheet-checker';
export * from './visibility-checker';
export * from './font-checker';
export * from './debug-generator';
export * from './debug-logger';
export * from './window-debugger';

// Default export for convenience
import { generatePrintDebugInfo } from './debug-generator';
import { logPrintDebugInfo } from './debug-logger';
import { attachDebuggerToWindow } from './window-debugger';

export default {
  generatePrintDebugInfo,
  logPrintDebugInfo,
  attachDebuggerToWindow
};
