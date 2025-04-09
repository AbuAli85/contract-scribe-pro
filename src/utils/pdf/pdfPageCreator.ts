
/**
 * PDF Page Creator Utility
 * Contains functions for creating different types of PDF pages
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Convert an HTML element to a canvas for PDF generation
 * @param element HTML element to convert
 * @returns Promise resolving to an HTMLCanvasElement
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
 * Creates the contract page in the PDF
 * @param pdf jsPDF instance
 * @param element HTML element to convert to PDF
 */
export const createContractPage = async (pdf: jsPDF, element: HTMLElement): Promise<void> => {
  // Convert HTML to canvas
  const canvas = await convertElementToCanvas(element);
  
  // Add canvas image to PDF - using exact A4 dimensions with no margins
  const imgData = canvas.toDataURL('image/png');
  
  // Add the image to fill the entire page without margins - exact A4 size
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
};

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
  letterheadBg.style.opacity = '0.8';
  letterheadBg.style.zIndex = '1';
  return letterheadBg;
};

/**
 * Creates content container for passport page
 * @param contractData Contract data containing passport image and details
 * @returns HTML element for the passport page content
 */
const createPassportContentContainer = (contractData: any): HTMLElement => {
  const contentContainer = document.createElement('div');
  contentContainer.className = 'passport-content';
  contentContainer.style.position = 'relative';
  contentContainer.style.zIndex = '10';
  contentContainer.style.padding = '20mm';
  contentContainer.style.height = '100%';
  contentContainer.style.boxSizing = 'border-box';
  contentContainer.style.display = 'flex';
  contentContainer.style.flexDirection = 'column';
  contentContainer.style.alignItems = 'center';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = 'Passport / جواز السفر';
  title.style.fontSize = '24px';
  title.style.marginBottom = '20mm';
  title.style.textAlign = 'center';
  title.style.width = '100%';
  contentContainer.appendChild(title);
  
  // Add passport image
  const passportImageContainer = document.createElement('div');
  passportImageContainer.style.width = '100%';
  passportImageContainer.style.display = 'flex';
  passportImageContainer.style.justifyContent = 'center';
  passportImageContainer.style.marginBottom = '20mm';
  
  // Clone the passport photo for better quality
  const originalPhoto = document.querySelector('.id-photo') as HTMLImageElement;
  if (originalPhoto && originalPhoto.src) {
    const passportImage = document.createElement('img');
    passportImage.src = originalPhoto.src;
    passportImage.alt = 'Passport';
    passportImage.style.maxWidth = '80%';
    passportImage.style.maxHeight = '60%';
    passportImage.style.objectFit = 'contain';
    passportImage.style.border = '1px solid #ddd';
    passportImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    passportImageContainer.appendChild(passportImage);
  }
  
  contentContainer.appendChild(passportImageContainer);
  
  // Add reference number if available
  if (contractData && contractData.refNumber) {
    const refNumberElement = document.createElement('div');
    refNumberElement.className = 'reference-number';
    refNumberElement.textContent = `Ref: ${contractData.refNumber}`;
    refNumberElement.style.fontSize = '14px';
    refNumberElement.style.marginBottom = '10mm';
    refNumberElement.style.position = 'absolute';
    refNumberElement.style.top = '10mm';
    refNumberElement.style.left = '20mm';
    contentContainer.appendChild(refNumberElement);
  }
  
  // Add promoter details if available
  if (contractData && contractData.promoter) {
    const detailsContainer = createPromoterDetailsBlock(contractData);
    contentContainer.appendChild(detailsContainer);
  }
  
  return contentContainer;
};

/**
 * Creates promoter details container
 * @param contractData Contract data containing promoter details
 * @returns HTML element for the promoter details
 */
const createPromoterDetailsBlock = (contractData: any): HTMLElement => {
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'passport-details';
  detailsContainer.style.width = '80%';
  detailsContainer.style.marginTop = 'auto';
  detailsContainer.style.marginBottom = '20mm';
  detailsContainer.style.padding = '15px';
  detailsContainer.style.border = '1px solid #ddd';
  detailsContainer.style.borderRadius = '5px';
  detailsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  
  // Format dates
  const startDate = contractData.startDate?.en || contractData.startDate || '';
  const endDate = contractData.endDate?.en || contractData.endDate || '';
  
  // Extract promoter name and ID
  const promoterName = contractData.promoter?.name?.en || contractData.promoter?.name || 'N/A';
  const promoterNameAr = contractData.promoter?.name?.ar || '';
  const promoterId = contractData.promoter?.id?.en || contractData.promoter?.id || 'N/A';
  const promoterIdAr = contractData.promoter?.id?.ar || '';
  
  // Create promoter info in English and Arabic
  detailsContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between;">
      <div style="width: 48%;">
        <p><strong>Promoter Name:</strong> ${promoterName}</p>
        <p><strong>ID Number:</strong> ${promoterId}</p>
        <p><strong>From:</strong> ${startDate}</p>
        <p><strong>To:</strong> ${endDate}</p>
      </div>
      <div style="width: 48%; text-align: right; direction: rtl;">
        <p><strong>اسم المروج:</strong> ${promoterNameAr || promoterName}</p>
        <p><strong>رقم الهوية:</strong> ${promoterIdAr || promoterId}</p>
        <p><strong>من:</strong> ${contractData.startDate?.ar || startDate}</p>
        <p><strong>إلى:</strong> ${contractData.endDate?.ar || endDate}</p>
      </div>
    </div>
  `;
  
  return detailsContainer;
};
