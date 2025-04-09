
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
  // Convert HTML to canvas
  const canvas = await convertElementToCanvas(element);
  
  // Add canvas image to PDF - using exact A4 dimensions with no margins
  const imgData = canvas.toDataURL('image/png');
  
  // Use 0,0 as starting coordinates to eliminate any margin
  // and exact A4 dimensions (210×297 mm)
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
};
