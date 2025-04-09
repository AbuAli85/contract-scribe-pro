
/**
 * PDF Contract Page Creator
 * Creates the main contract page in PDF format
 */
import jsPDF from 'jspdf';
import { convertElementToCanvas } from './pdfPageUtils';

/**
 * Creates the contract page in the PDF
 * @param pdf jsPDF instance
 * @param element HTML element to convert to PDF
 */
export const createContractPage = async (pdf: jsPDF, element: HTMLElement): Promise<void> => {
  // Preparation: Make sure letterhead opacity is properly set for PDF
  const letterhead = element.querySelector('.letterhead-background') as HTMLElement;
  if (letterhead) {
    // Store original opacity to restore later
    const originalOpacity = letterhead.style.opacity;
    // Set better opacity for PDF
    letterhead.style.opacity = '0.05';
    
    // Ensure ID photo is centered
    const idPhotoContainer = element.querySelector('.id-photo-container') as HTMLElement;
    if (idPhotoContainer) {
      idPhotoContainer.style.display = 'flex';
      idPhotoContainer.style.justifyContent = 'center';
      idPhotoContainer.style.width = '100%';
    }
    
    // Convert HTML to canvas
    const canvas = await convertElementToCanvas(element);
    
    // Restore original opacity
    letterhead.style.opacity = originalOpacity;
    
    // Add canvas image to PDF - using exact A4 dimensions with no margins
    const imgData = canvas.toDataURL('image/png');
    
    // Use 0,0 as starting coordinates to eliminate any margin
    // and exact A4 dimensions (210×297 mm)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  } else {
    // If no letterhead, just convert and add
    const canvas = await convertElementToCanvas(element);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  }
};
