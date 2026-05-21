
/**
 * PDF Passport Content Creator
 * Creates the content for the passport page
 */

/**
 * Creates content container for passport page
 * @param contractData Contract data containing passport image and details
 * @returns HTML element for the passport page content
 */
export const createPassportContentContainer = (contractData: any): HTMLElement => {
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
  passportImageContainer.style.maxHeight = '50%'; // Limit height to prevent overflow
  
  // Get photo content either from promoterPhoto directly or from ID photo in DOM
  let photoSrc = '';
  if (contractData.promoterPhoto) {
    // Use direct photo URL if available
    photoSrc = contractData.promoterPhoto;
  } else {
    // Clone the passport photo from the DOM as fallback
    const originalPhoto = document.querySelector('.id-photo') as HTMLImageElement;
    if (originalPhoto && originalPhoto.src) {
      photoSrc = originalPhoto.src;
    }
  }
  
  if (photoSrc) {
    const passportImage = document.createElement('img');
    passportImage.src = photoSrc;
    passportImage.alt = 'Passport';
    passportImage.className = 'passport-image';
    passportImage.style.maxWidth = '70%'; // Reduced from 80% to ensure better fit
    passportImage.style.maxHeight = '50%'; // Limit height
    passportImage.style.objectFit = 'contain'; // Ensure image is fully visible
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
export const createPromoterDetailsBlock = (contractData: any): HTMLElement => {
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
