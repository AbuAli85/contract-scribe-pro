
/**
 * PDF Export Utility
 * Handles exporting contract content as a downloadable PDF
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { setupPrintContainer, cleanupPrinting } from './print-container';
import { toast } from '@/hooks/use-toast';

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
