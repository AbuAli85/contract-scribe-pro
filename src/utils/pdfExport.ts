
/**
 * PDF Export Utility
 * Handles exporting contract content as a downloadable PDF
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { setupPrintContainer, cleanupPrinting } from './print-container';
import { toast } from '@/hooks/use-toast';

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

  // Ensure letterhead covers full page
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
  }

  // Make sure the contract content is on top of the letterhead
  const content = element.querySelector('.contract-content') as HTMLElement;
  if (content) {
    content.style.position = 'relative';
    content.style.zIndex = '10';
  }

  // Ensure the reference number is visible
  const refNumber = element.querySelector('.reference-number') as HTMLElement;
  if (refNumber) {
    refNumber.style.display = 'block';
    refNumber.style.visibility = 'visible';
  }

  // Ensure ID photo is properly displayed
  const idPhoto = element.querySelector('.id-photo-container') as HTMLElement;
  if (idPhoto) {
    idPhoto.style.display = 'flex';
    idPhoto.style.justifyContent = 'center';
    idPhoto.style.width = '100%';
    idPhoto.style.marginBottom = '20px';
  }

  // Ensure signature area is visible
  const signatureArea = element.querySelector('.signature-area') as HTMLElement;
  if (signatureArea) {
    signatureArea.style.display = 'flex';
    signatureArea.style.visibility = 'visible';
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
 * Export contract content as PDF
 * @param options Configuration options for PDF export
 */
export const exportToPDF = async (options: {
  selector?: string;
  filename?: string;
  pageFormat?: 'a4' | 'letter';
  language?: 'en' | 'ar';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const {
    selector = '.print-container',
    filename = 'contract.pdf',
    pageFormat = 'a4',
    language = 'en',
    onSuccess,
    onError
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
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat
    });
    
    // Convert HTML to canvas
    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save PDF
    pdf.save(filename);
    
    // Restore original element display properties
    restoreAfterExport(hiddenElements);
    
    // Show success message
    toast({
      title: language === "ar" ? "تم تحميل PDF بنجاح" : "PDF Downloaded",
      description: language === "ar" ? "تم تحميل عقدك كملف PDF" : "Your contract has been downloaded as a PDF",
    });
    
    // Callback if provided
    onSuccess?.();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Show error message
    toast({
      title: language === "ar" ? "خطأ في تحميل PDF" : "PDF Export Error",
      description: error instanceof Error ? error.message : "An error occurred during PDF export",
      variant: "destructive",
    });
    
    // Callback if provided
    onError?.(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Clean up after export
    cleanupPrinting();
  }
};
