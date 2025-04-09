
/**
 * PDF Passport Page Creator
 * Creates the passport page in PDF format
 */
import jsPDF from 'jspdf';
import { convertElementToCanvas } from './pdfPageUtils';
import { createPassportContentContainer } from './pdfPassportContent';

/**
 * Creates a second page with passport document
 * @param pdf jsPDF instance
 * @param contractData Contract data containing passport image and details
 * @returns Boolean indicating success
 */
export const createPassportPage = async (pdf: jsPDF, contractData: any): Promise<boolean> => {
  try {
    // Create a temporary container for the passport page
    const passportPageContainer = createPassportPageContainer(contractData);
    
    // Convert the passport page to canvas
    const canvas = await convertElementToCanvas(passportPageContainer);
    
    // Add canvas to PDF - full page size
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Clean up - remove temporary elements
    document.body.removeChild(passportPageContainer);
    
    return true;
  } catch (error) {
    console.error('Error creating passport page:', error);
    return false;
  }
};

/**
 * Creates the temporary container for the passport page
 * @param contractData Contract data containing passport image and details
 * @returns HTML element containing the passport page
 */
const createPassportPageContainer = (contractData: any): HTMLElement => {
  // Create a temporary container for the passport page
  const passportPageContainer = document.createElement('div');
  passportPageContainer.className = 'a4-page passport-page';
  passportPageContainer.style.width = '210mm';
  passportPageContainer.style.height = '297mm';
  passportPageContainer.style.position = 'relative';
  passportPageContainer.style.overflow = 'hidden';
  passportPageContainer.style.backgroundColor = 'white';
  
  // Add letterhead background if available
  if (contractData && contractData.letterhead) {
    const letterheadBg = createLetterheadBackground(contractData.letterhead);
    passportPageContainer.appendChild(letterheadBg);
  }
  
  // Create content container
  const contentContainer = createPassportContentContainer(contractData);
  passportPageContainer.appendChild(contentContainer);
  
  // Temporarily add to document but hide it
  passportPageContainer.style.position = 'absolute';
  passportPageContainer.style.left = '-9999px';
  document.body.appendChild(passportPageContainer);
  
  return passportPageContainer;
};

/**
 * Creates letterhead background element with full coverage
 * @param letterheadSrc Source URL of the letterhead image
 * @returns HTML element for the letterhead background
 */
const createLetterheadBackground = (letterheadSrc: string): HTMLElement => {
  const letterheadBg = document.createElement('div');
  letterheadBg.className = 'letterhead-background';
  letterheadBg.style.position = 'absolute';
  letterheadBg.style.top = '0';
  letterheadBg.style.left = '0';
  letterheadBg.style.width = '100%';
  letterheadBg.style.height = '100%';
  letterheadBg.style.backgroundImage = `url('${letterheadSrc}')`;
  letterheadBg.style.backgroundSize = 'cover';
  letterheadBg.style.backgroundPosition = 'center';
  letterheadBg.style.opacity = '0.05';
  letterheadBg.style.zIndex = '1';
  return letterheadBg;
};
