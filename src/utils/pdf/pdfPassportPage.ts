
/**
 * PDF Passport Page Creator
 * Creates the passport document page in PDF format
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Creates a passport page in the PDF
 * @param pdf jsPDF instance
 * @param contractData Contract data containing passport information
 */
export const createPassportPage = async (pdf: jsPDF, contractData: any): Promise<void> => {
  // Create a temporary div for the passport page
  const tempDiv = document.createElement('div');
  tempDiv.className = 'passport-page';
  tempDiv.style.width = '210mm';
  tempDiv.style.height = '297mm';
  tempDiv.style.margin = '0';
  tempDiv.style.padding = '0';
  tempDiv.style.overflow = 'hidden';
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.style.backgroundColor = 'white';
  
  // Add passport content
  tempDiv.innerHTML = `
    <div class="passport-content">
      <div class="passport-header">
        <h2 style="
          font-size: 24px;
          font-weight: bold;
          color: #1a73e8;
          text-align: center;
          margin-bottom: 15mm;
        ">Identification Document</h2>
      </div>
      <div class="passport-image-container">
        <img 
          src="${contractData.promoterPhoto}" 
          alt="Identification Document" 
          class="passport-image"
          style="
            width: 100%;
            height: auto;
            object-fit: contain;
          "
        />
      </div>
      <div style="
        margin-top: 15mm;
        text-align: center;
        font-size: 14px;
        color: #555;
      ">
        <p><strong>Name:</strong> ${contractData.promoterName || 'N/A'}</p>
        <p><strong>Reference Number:</strong> ${contractData.refNumber || 'N/A'}</p>
        <p><strong>Document Type:</strong> Identification</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;
  
  // Add to DOM temporarily
  document.body.appendChild(tempDiv);
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      logging: false,
      width: 796, // A4 width at 96 DPI
      height: 1123 // A4 height at 96 DPI
    });
    
    // Add to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 dimensions in mm
    
    console.log('Passport page added to PDF successfully');
  } catch (error) {
    console.error('Error creating passport page:', error);
    throw error;
  } finally {
    // Remove temp element
    document.body.removeChild(tempDiv);
  }
};
