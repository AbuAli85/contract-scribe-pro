
/**
 * Print Service Index
 * Exports all printing functionality from specialized services
 */

// Re-export all functionality from specialized services
export * from './print-preparation.service';
export * from './print-validation.service';
export * from './print-execution.service';

// Create a unified printService object for backward compatibility
import * as preparation from './print-preparation.service';
import * as validation from './print-validation.service';
import * as execution from './print-execution.service';

export const printService = {
  // Print preparation
  fixVisibility: preparation.fixVisibility,
  cleanupAfterPrinting: preparation.cleanupAfterPrinting,
  
  // Print validation
  validatePrintContent: validation.validatePrintContent,
  
  // Print execution
  print: execution.print,
  printNow: execution.printNow,
  handlePrintError: execution.handlePrintError
};
