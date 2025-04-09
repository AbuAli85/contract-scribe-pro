
/**
 * PDF Export Core Functionality
 * Handles exporting contract content as a downloadable PDF
 */
import { toast } from '@/hooks/use-toast';
import { setupPrintContainer, cleanupPrinting } from '../print-container';
import { createContractPage, createPassportPage } from './pdfPageCreator';
import { prepareForExport, restoreAfterExport } from './pdfPrepare';
import { displayToasts } from './pdfToasts';
import { pdfDebugger } from './pdfDebugger';
import jsPDF from 'jspdf';

// Types for PDF export options
export interface PDFExportOptions {
  selector?: string;
  filename?: string;
  pageFormat?: 'a4' | 'letter';
  language?: 'en' | 'ar';
  contractData?: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  includePassport?: boolean;
  debug?: boolean;
}

/**
 * Export contract content as PDF
 * @param options Configuration options for PDF export
 */
export const exportToPDF = async (options: PDFExportOptions) => {
  const {
    selector = '.print-container',
    filename = 'contract.pdf',
    pageFormat = 'a4',
    language = 'en',
    contractData,
    onSuccess,
    onError,
    includePassport = true,
    debug = process.env.NODE_ENV === 'development'
  } = options;
  
  // Run diagnostics in debug mode
  if (debug) {
    console.log('Running PDF export diagnostics...');
    await pdfDebugger.diagnose({ selector, showToasts: false });
  }
  
  try {
    // Set up print container
    setupPrintContainer();
    
    // Find the element to export
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error('Element not found: ' + selector);
    }
    
    // Hide UI elements and prepare for export
    const hiddenElements = prepareForExport(element as HTMLElement);
    
    // Create PDF with appropriate dimensions - using precise A4 dimensions (210×297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat,
      compress: true,
      hotfixes: ['px_scaling'], // Fix scaling issues
    });
    
    // Add the contract page - ensure we use exact dimensions
    await createContractPage(pdf, element as HTMLElement);
    
    // Add passport document as a second page if requested
    if (includePassport && contractData && contractData.promoterPhoto) {
      pdf.addPage();
      await createPassportPage(pdf, contractData);
    }
    
    // Save PDF
    pdf.save(filename);
    
    // Restore original element display properties
    restoreAfterExport(hiddenElements);
    
    // Show success message
    displayToasts.success(language);
    
    // Callback if provided
    onSuccess?.();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Show error message
    displayToasts.error(language, error);
    
    // In debug mode, run diagnostics after error to help identify issues
    if (debug) {
      console.log('Running post-error diagnostics...');
      await pdfDebugger.diagnose({ selector, showToasts: true });
    }
    
    // Callback if provided
    onError?.(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Clean up after export
    cleanupPrinting();
  }
};
