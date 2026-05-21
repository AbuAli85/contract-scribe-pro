
/**
 * Window Debugger
 * 
 * Attaches print debugger to the window object
 */

import { logPrintDebugInfo } from './debug-logger';

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
