
/**
 * PDF Page Creator Utility
 * Contains functions for creating different types of PDF pages
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateUniqueId } from '@/lib/utils';

/**
 * Convert an HTML element to a canvas for PDF generation
 * @param element HTML element to convert
 * @returns Promise resolving to an HTMLCanvasElement
 */
const convertElementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return html2canvas(element, {
    scale: 3, // Higher scale for better quality
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
 * Creates a second page with ID card and passport document
 * @param pdf jsPDF instance
 * @param contractData Contract data containing passport image and details
 * @returns Boolean indicating success
 */
export const createPassportPage = async (pdf: jsPDF, contractData: any): Promise<boolean> => {
  try {
    // Create a temporary container for the passport page
    const passportPageContainer = createOmanIDPageContainer(contractData);
    
    // Convert the passport page to canvas
    const canvas = await convertElementToCanvas(passportPageContainer);
    
    // Add canvas to PDF - full page size
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Clean up - remove temporary elements
    document.body.removeChild(passportPageContainer);
    
    return true;
  } catch (error) {
    console.error('Error creating ID card/passport page:', error);
    return false;
  }
};

/**
 * Creates the temporary container for the Oman ID card page
 * @param contractData Contract data containing passport image and details
 * @returns HTML element containing the passport page
 */
const createOmanIDPageContainer = (contractData: any): HTMLElement => {
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
  const contentContainer = createOmanIDContentContainer(contractData);
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
  letterheadBg.style.opacity = '0.07'; // Lighter for improved readability
  letterheadBg.style.zIndex = '1';
  return letterheadBg;
};

/**
 * Creates content container for Oman ID card and passport details
 * @param contractData Contract data containing passport image and details
 * @returns HTML element for the passport page content
 */
const createOmanIDContentContainer = (contractData: any): HTMLElement => {
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
  
  // Add title styled like Oman government documents
  const title = document.createElement('h1');
  title.textContent = 'Resident Card / بطاقة مقيم';
  title.style.fontSize = '24px';
  title.style.marginBottom = '20mm';
  title.style.textAlign = 'center';
  title.style.width = '100%';
  title.style.color = '#7E69AB'; // Purple color similar to Oman document
  title.style.fontWeight = 'bold';
  contentContainer.appendChild(title);
  
  // Add ID photo card with Oman styling
  const idCardContainer = document.createElement('div');
  idCardContainer.style.width = '100%';
  idCardContainer.style.display = 'flex';
  idCardContainer.style.justifyContent = 'center';
  idCardContainer.style.marginBottom = '20mm';
  idCardContainer.style.maxWidth = '500px';
  idCardContainer.style.margin = '0 auto 30mm auto';
  
  // Clone the ID photo for better quality
  const originalPhoto = document.querySelector('.id-photo') as HTMLImageElement;
  if (originalPhoto && originalPhoto.src) {
    // Create Oman ID card styled container
    const omanIdCard = document.createElement('div');
    omanIdCard.style.width = '100%';
    omanIdCard.style.border = '1px solid #ddd';
    omanIdCard.style.borderRadius = '8px';
    omanIdCard.style.overflow = 'hidden';
    omanIdCard.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    omanIdCard.style.backgroundColor = '#fff';
    
    // Add Oman-style header
    const cardHeader = document.createElement('div');
    cardHeader.style.backgroundColor = '#7E69AB'; // Purple color similar to Oman document
    cardHeader.style.color = 'white';
    cardHeader.style.padding = '10px';
    cardHeader.style.textAlign = 'center';
    cardHeader.style.fontSize = '16px';
    cardHeader.style.fontWeight = 'bold';
    cardHeader.textContent = 'SULTANATE OF OMAN / سلطنة عمان';
    omanIdCard.appendChild(cardHeader);
    
    // Create card content with photo and details
    const cardContent = document.createElement('div');
    cardContent.style.padding = '20px';
    cardContent.style.display = 'flex';
    
    // Add photo on left
    const photoContainer = document.createElement('div');
    photoContainer.style.width = '35%';
    photoContainer.style.marginRight = '15px';
    
    const idPhoto = document.createElement('img');
    idPhoto.src = originalPhoto.src;
    idPhoto.alt = 'Resident ID';
    idPhoto.style.width = '100%';
    idPhoto.style.height = 'auto';
    idPhoto.style.objectFit = 'contain';
    idPhoto.style.border = '1px solid #eee';
    photoContainer.appendChild(idPhoto);
    
    cardContent.appendChild(photoContainer);
    
    // Add details on right
    const detailsContainer = document.createElement('div');
    detailsContainer.style.flex = '1';
    
    // Format promoter details to match Oman ID
    const details = [
      { label: 'Name / الاسم', value: contractData.promoter?.name?.en || 'Farzan Riyaz Munde' },
      { label: 'Civil Number / الرقم المدني', value: contractData.promoter?.id?.en || '126208869' },
      { label: 'Nationality / الجنسية', value: contractData.promoter?.nationality?.en || 'Indian / هندي' },
      { label: 'Date of Birth / تاريخ الميلاد', value: '17/11/1997' },
      { label: 'Expiry Date / تاريخ الانتهاء', value: '24/06/2026' }
    ];
    
    details.forEach(detail => {
      const detailRow = document.createElement('div');
      detailRow.style.marginBottom = '10px';
      detailRow.style.borderBottom = '1px dotted #ddd';
      detailRow.style.paddingBottom = '5px';
      
      const label = document.createElement('span');
      label.textContent = detail.label + ': ';
      label.style.fontWeight = 'bold';
      label.style.color = '#7E69AB'; // Purple color similar to Oman document
      
      const value = document.createElement('span');
      value.textContent = detail.value;
      
      detailRow.appendChild(label);
      detailRow.appendChild(value);
      detailsContainer.appendChild(detailRow);
    });
    
    cardContent.appendChild(detailsContainer);
    omanIdCard.appendChild(cardContent);
    
    // Add signature at bottom
    const signatureSection = document.createElement('div');
    signatureSection.style.borderTop = '1px solid #eee';
    signatureSection.style.padding = '10px';
    signatureSection.style.display = 'flex';
    signatureSection.style.justifyContent = 'space-between';
    
    const signatureLabel = document.createElement('div');
    signatureLabel.textContent = 'Signature / التوقيع';
    signatureLabel.style.fontSize = '12px';
    
    const signature = document.createElement('div');
    signature.textContent = '✓ Digitally Verified';
    signature.style.fontStyle = 'italic';
    signature.style.fontSize = '12px';
    
    signatureSection.appendChild(signatureLabel);
    signatureSection.appendChild(signature);
    omanIdCard.appendChild(signatureSection);
    
    idCardContainer.appendChild(omanIdCard);
  }
  
  contentContainer.appendChild(idCardContainer);
  
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
  
  // Add contract details
  const contractDetailsContainer = document.createElement('div');
  contractDetailsContainer.style.width = '80%';
  contractDetailsContainer.style.marginTop = '20px';
  contractDetailsContainer.style.padding = '15px';
  contractDetailsContainer.style.border = '1px solid #ddd';
  contractDetailsContainer.style.borderRadius = '5px';
  contractDetailsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  
  contractDetailsContainer.innerHTML = `
    <h3 style="font-weight: bold; margin-bottom: 10px; text-align: center; color: #00a99d;">Contract Assignment Information / معلومات تعيين العقد</h3>
    <div style="display: flex; justify-content: space-between;">
      <div style="width: 48%;">
        <p><strong>Contract Reference:</strong> ${contractData.refNumber || 'PRO-20250406-0001'}</p>
        <p><strong>Assignment Period:</strong> ${contractData.startDate?.en || '06/04/2025'} to ${contractData.endDate?.en || '06/07/2025'}</p>
        <p><strong>Location:</strong> ${contractData.location?.en || 'Al Khuwair, Muscat'}</p>
        <p><strong>Product:</strong> ${contractData.product?.en || 'Electronics'}</p>
      </div>
      <div style="width: 48%; text-align: right; direction: rtl;">
        <p><strong>مرجع العقد:</strong> ${contractData.refNumber || 'PRO-20250406-0001'}</p>
        <p><strong>فترة التعيين:</strong> ${contractData.endDate?.ar || '06/07/2025'} إلى ${contractData.startDate?.ar || '06/04/2025'}</p>
        <p><strong>الموقع:</strong> ${contractData.location?.ar || 'الخوير، مسقط'}</p>
        <p><strong>المنتج:</strong> ${contractData.product?.ar || 'الإلكترونيات'}</p>
      </div>
    </div>
  `;
  
  contentContainer.appendChild(contractDetailsContainer);
  
  // Add company footer
  const footerContainer = document.createElement('div');
  footerContainer.style.width = '100%';
  footerContainer.style.marginTop = 'auto';
  footerContainer.style.borderTop = '1px solid #00a99d';
  footerContainer.style.paddingTop = '10px';
  footerContainer.style.display = 'flex';
  footerContainer.style.justifyContent = 'space-around';
  footerContainer.style.color = '#666';
  footerContainer.style.fontSize = '10px';
  
  footerContainer.innerHTML = `
    <div><strong style="color: #00a99d;">CR Number:</strong> 1410869</div>
    <div>PO Box 762, PC-122 Al Khuwair, Sultanate of Oman</div>
    <div>www.falconeyegroup.net</div>
  `;
  
  contentContainer.appendChild(footerContainer);
  
  return contentContainer;
};

