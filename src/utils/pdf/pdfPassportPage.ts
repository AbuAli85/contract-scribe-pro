
/**
 * PDF Passport Page Creator
 * Creates a passport/ID document page in PDF format
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Creates a passport or ID document page in the PDF
 * @param pdf jsPDF instance
 * @param contractData Contract data containing promoter info
 */
export const createPassportPage = async (pdf: jsPDF, contractData: any): Promise<void> => {
  // Create a temporary container for the passport page
  const tempContainer = document.createElement('div');
  tempContainer.className = 'passport-page';
  tempContainer.style.width = '210mm';
  tempContainer.style.height = '297mm';
  tempContainer.style.padding = '20mm';
  tempContainer.style.boxSizing = 'border-box';
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.zIndex = '-1';
  tempContainer.style.backgroundColor = 'white';
  document.body.appendChild(tempContainer);

  // Check if we should create Oman ID card style or regular passport page
  const useOmanStyle = true; // Set to true to use Oman ID style

  if (useOmanStyle) {
    // Create Oman ID card style
    tempContainer.innerHTML = `
      <div class="passport-content">
        <div class="official-header">Sultanate of Oman - Royal Oman Police</div>
        
        <div class="oman-id-card">
          <div class="oman-id-header">Resident Identity Card</div>
          
          <div class="oman-id-content">
            <img 
              src="${contractData.promoterPhoto || 'placeholder-image.png'}" 
              alt="Promoter ID" 
              class="oman-id-photo"
            />
            
            <div class="oman-id-details">
              <div class="oman-id-field">
                <span class="oman-id-field-label">Name:</span>
                <span class="oman-id-field-value">${contractData.promoter?.nameEn || 'Farzan Riyaz Munde'}</span>
              </div>
              
              <div class="oman-id-field">
                <span class="oman-id-field-label">ID No:</span>
                <span class="oman-id-field-value">${contractData.promoter?.id || '126208869'}</span>
              </div>
              
              <div class="oman-id-field">
                <span class="oman-id-field-label">Nationality:</span>
                <span class="oman-id-field-value">${contractData.promoter?.nationality?.en || 'Indian'}</span>
              </div>
            </div>
          </div>
          
          <div class="oman-id-footer">
            Civil ID • رقم البطاقة المدنية
          </div>
        </div>
        
        <div class="passport-details">
          <p style="text-align: center; font-weight: bold;">
            This is an official copy of the promoter's identification document.
          </p>
          <p style="text-align: center;">
            Contract Reference: ${contractData.referenceNumber || 'N/A'}
          </p>
        </div>
      </div>
    `;
  } else {
    // Create standard passport page
    tempContainer.innerHTML = `
      <div class="passport-content">
        <h1 class="passport-header">Promoter Identification Document</h1>
        <img src="${contractData.promoterPhoto || 'placeholder-image.png'}" alt="Promoter ID" class="passport-image" />
        <div class="passport-details">
          <p><strong>Name:</strong> ${contractData.promoter?.nameEn || 'N/A'}</p>
          <p><strong>ID Number:</strong> ${contractData.promoter?.id || 'N/A'}</p>
          <p><strong>Contract Reference:</strong> ${contractData.referenceNumber || 'N/A'}</p>
        </div>
      </div>
    `;
  }

  // Apply styles for printing
  const style = document.createElement('style');
  style.textContent = `
    .passport-page {
      width: 210mm;
      height: 297mm;
      background: white;
      box-sizing: border-box;
      padding: 20mm;
    }
    .passport-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .passport-header {
      margin-bottom: 20mm;
      font-size: 24px;
      text-align: center;
    }
    .passport-image {
      max-width: 70%;
      max-height: 50%;
      object-fit: contain;
      margin-bottom: 20mm;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .passport-details {
      width: 80%;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .official-header {
      width: 100%;
      text-align: center;
      margin-bottom: 20mm;
      font-size: 16px;
      font-weight: bold;
      color: #7E69AB;
    }
    .oman-id-card {
      width: 100%;
      max-width: 400px;
      margin: 0 auto 20mm;
      border-radius: 8px;
      border: 1px solid #ddd;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .oman-id-header {
      background-color: #7E69AB;
      color: white;
      padding: 8px 15px;
      font-weight: bold;
      text-align: center;
    }
    .oman-id-content {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .oman-id-photo {
      width: 100%;
      height: auto;
      max-height: 200px;
      object-fit: contain;
      border: 1px solid #eee;
    }
    .oman-id-details {
      display: grid;
      gap: 8px;
    }
    .oman-id-field {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #eee;
      padding: 4px 0;
    }
    .oman-id-field-label {
      font-weight: bold;
      color: #7E69AB;
    }
    .oman-id-footer {
      background-color: #f9f9f9;
      text-align: center;
      padding: 8px;
      font-size: 0.9em;
      color: #666;
      border-top: 1px solid #eee;
    }
  `;
  tempContainer.appendChild(style);

  try {
    // Convert to canvas and add to PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: 'white'
    });
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  } catch (error) {
    console.error('Error creating passport page:', error);
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
};
