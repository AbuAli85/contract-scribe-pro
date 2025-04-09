
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
  
  // Add passport content with improved layout
  tempDiv.innerHTML = `
    <div class="passport-content" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 30mm 20mm;
      height: 100%;
      box-sizing: border-box;
      position: relative;
    ">
      <div style="text-align: center; width: 100%; margin-bottom: 20mm;">
        <h2 style="
          font-size: 28px;
          font-weight: bold;
          color: #1a73e8;
          margin-bottom: 5mm;
        ">Identification Document</h2>
        <p style="
          font-size: 14px;
          color: #555;
        ">وثيقة الهوية</p>
      </div>
      
      <div style="
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 20mm;
      ">
        <div style="
          width: 80%;
          max-width: 500px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <img 
            src="${contractData.promoterPhoto}" 
            alt="Identification Document" 
            style="
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
            "
          />
        </div>
      </div>
      
      <div style="
        width: 80%;
        margin: 0 auto;
        border-top: 1px solid #eee;
        padding-top: 15mm;
      ">
        <table style="
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        ">
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; text-align: right; width: 40%;">Name:</td>
            <td style="padding: 6px 12px;">${contractData.promoter?.name?.en || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; text-align: right;">ID Number:</td>
            <td style="padding: 6px 12px;">${contractData.promoter?.id?.en || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; text-align: right;">Reference Number:</td>
            <td style="padding: 6px 12px;">${contractData.refNumber || 'PAC-20250409-9597'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; text-align: right;">Document Type:</td>
            <td style="padding: 6px 12px;">Identification</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; text-align: right;">Date:</td>
            <td style="padding: 6px 12px;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>
      
      <!-- Reference number on the top corner -->
      <div style="
        position: absolute;
        top: 15mm;
        left: 15mm;
        font-size: 12px;
        font-family: monospace;
        color: #555;
      ">
        Ref: ${contractData.refNumber || 'PAC-20250409-9597'}
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
