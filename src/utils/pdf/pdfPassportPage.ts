
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
  
  // Generate reference number for second page
  const refNumber = contractData.refNumber || 'PAC-20250409-6996';
  
  // Add passport content with improved layout
  tempDiv.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 30mm;
      background-image: url('${contractData.letterhead}');
      background-size: cover;
      background-position: top center;
      opacity: 0.07;
      z-index: 1;
    "></div>
    
    <div style="
      position: absolute;
      top: 35mm;
      left: 20mm;
      font-family: monospace;
      font-size: 12px;
      font-weight: bold;
      color: #444;
      z-index: 10;
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 6px 10px;
      border-left: 3px solid #1a73e8;
    ">
      Reference Number: ${refNumber}
    </div>
    
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 45mm 20mm 20mm;
      height: 100%;
      box-sizing: border-box;
      position: relative;
      z-index: 5;
    ">
      <div style="text-align: center; width: 100%; margin-bottom: 15mm;">
        <h2 style="
          font-size: 28px;
          font-weight: bold;
          color: #1a73e8;
          margin-bottom: 5mm;
          margin-top: 5mm;
        ">Passport Document</h2>
        <p style="
          font-size: 18px;
          color: #555;
          text-align: center;
        ">وثيقة جواز السفر</p>
      </div>
      
      <div style="
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 20mm;
      ">
        <div style="
          width: 80%;
          max-width: 140mm;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: white;
        ">
          <img 
            src="${contractData.promoterPhoto}" 
            alt="Passport Document" 
            style="
              width: 100%;
              height: auto;
              object-fit: contain;
              display: block;
            "
          />
          <div style="
            text-align: center;
            padding: 8px;
            background-color: #f9f9f9;
            color: #555;
            font-size: 12px;
            border-top: 1px solid #eee;
          ">
            Passport / جواز السفر
          </div>
        </div>
      </div>
      
      <div style="
        width: 80%;
        margin: 0 auto;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 15px 20px;
        background-color: #fafafa;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      ">
        <table style="
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        ">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; width: 40%;">Name:</td>
            <td style="padding: 8px 12px;">${contractData.promoter?.name?.en || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">ID Number:</td>
            <td style="padding: 8px 12px;">${contractData.promoter?.id?.en || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Reference Number:</td>
            <td style="padding: 8px 12px;">${refNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 12px;">Passport</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Date:</td>
            <td style="padding: 8px 12px;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
        
        <div style="
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #ddd;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        ">
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">Company Information:</div>
            <div>CR: ${contractData.firstParty?.crn?.en || "1410869"}</div>
            <div>PO Box 762, PC-122 Al Khuwair, Bousher, Oman</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; margin-bottom: 5px;">Contact:</div>
            <div>+968 9194 3449 / +968 9933 6958</div>
            <div>www.falconeyegroup.net</div>
          </div>
        </div>
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
    pdf.addPage();
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
