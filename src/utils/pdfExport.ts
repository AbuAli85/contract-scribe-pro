
/**
 * PDF Export Utility
 * Handles exporting contract content as a downloadable PDF
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { setupPrintContainer, cleanupPrinting } from './print-container';
import { toast } from '@/hooks/use-toast';
import { createContractPage, createPassportPage } from './pdfPageCreator';

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
}

/**
 * Hide UI elements that should not appear in the PDF
 */
const prepareForExport = (element: HTMLElement) => {
  // Temporarily hide all print:hidden elements
  const hiddenElements = element.querySelectorAll('.print\\:hidden, button, nav, header, .tabs-list');
  hiddenElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.setAttribute('data-original-display', el.style.display);
      el.style.display = 'none';
    }
  });

  // Ensure letterhead covers full page with proper dimensions
  const letterhead = element.querySelector('.letterhead-background') as HTMLElement;
  if (letterhead) {
    letterhead.style.position = 'absolute';
    letterhead.style.top = '0';
    letterhead.style.left = '0';
    letterhead.style.width = '100%';
    letterhead.style.height = '100%';
    letterhead.style.zIndex = '1';
    letterhead.style.opacity = '0.8';
    letterhead.style.objectFit = 'cover';
    letterhead.style.margin = '0';
    letterhead.style.padding = '0';
    letterhead.style.border = 'none';
  }

  // Make sure the contract content is on top of the letterhead
  const content = element.querySelector('.contract-content') as HTMLElement;
  if (content) {
    content.style.position = 'relative';
    content.style.zIndex = '10';
    // Use smaller padding to maximize content area
    content.style.padding = '10mm';
  }

  // Set A4 page dimensions explicitly without margins
  const a4Page = element.querySelector('.a4-page') as HTMLElement;
  if (a4Page) {
    a4Page.style.width = '210mm';
    a4Page.style.height = '297mm';
    a4Page.style.margin = '0';
    a4Page.style.padding = '0';
    a4Page.style.boxShadow = 'none';
    a4Page.style.overflow = 'hidden';
  }

  return hiddenElements;
};

/**
 * Restore the original display properties
 */
const restoreAfterExport = (hiddenElements: NodeListOf<Element>) => {
  hiddenElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const originalDisplay = el.getAttribute('data-original-display');
      if (originalDisplay) {
        el.style.display = originalDisplay;
      } else {
        el.style.display = '';
      }
      el.removeAttribute('data-original-display');
    }
  });
};

/**
 * Convert an HTML element to a canvas for PDF generation
 */
const convertElementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true, // Allow images from other domains
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });
};

/**
 * Create a new PDF document with proper settings
 */
const createPDFDocument = (pageFormat: 'a4' | 'letter'): jsPDF => {
  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pageFormat,
    compress: true
  });
};

/**
 * Add an image to a PDF document with proper A4 sizing
 */
const addImageToPDF = (pdf: jsPDF, imgData: string): void => {
  // Add the image to fill the entire page without margins - exact A4 size
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
};

/**
 * Show a success toast message
 */
const showSuccessToast = (language: 'en' | 'ar'): void => {
  toast({
    title: language === "ar" ? "تم تحميل PDF بنجاح" : "PDF Downloaded",
    description: language === "ar" ? "تم تحميل عقدك كملف PDF" : "Your contract has been downloaded as a PDF",
  });
};

/**
 * Show an error toast message
 */
const showErrorToast = (language: 'en' | 'ar', error: unknown): void => {
  toast({
    title: language === "ar" ? "خطأ في تحميل PDF" : "PDF Export Error",
    description: error instanceof Error ? error.message : "An error occurred during PDF export",
    variant: "destructive",
  });
};

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
    includePassport = true
  } = options;
  
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
    
    // Create PDF with appropriate dimensions
    const pdf = createPDFDocument(pageFormat);
    
    // Add the contract page
    await createContractPage(pdf, element as HTMLElement);
    
    // Add passport document as a second page if requested
    if (includePassport) {
      await createPassportPage(pdf, contractData);
    }
    
    // Save PDF
    pdf.save(filename);
    
    // Restore original element display properties
    restoreAfterExport(hiddenElements);
    
    // Show success message
    showSuccessToast(language);
    
    // Callback if provided
    onSuccess?.();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Show error message
    showErrorToast(language, error);
    
    // Callback if provided
    onError?.(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Clean up after export
    cleanupPrinting();
  }
};
