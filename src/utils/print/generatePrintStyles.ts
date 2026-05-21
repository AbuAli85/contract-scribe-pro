
/**
 * Generates the CSS styles for the print view
 */
export function generatePrintStyles(): string {
  return `
    @page {
      size: A4;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: white;
      color: #000;
    }

    .a4-page {
      width: 210mm;
      height: 297mm;
      position: relative;
      background-color: white;
      overflow: hidden;
      page-break-after: always;
      padding: 20mm;
      box-sizing: border-box;
    }

    /* Letterhead Background - Covers the entire page */
    .letterhead-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0.7;
      z-index: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .contract-content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: rgba(255, 255, 255, 0.3);
    }

    /* Reference Number */
    .ref-number-container {
      margin-bottom: 15px;
    }

    .ref-number {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }

    /* ID Photo Container - Positioned prominently */
    .id-photo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
      width: 100%;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .id-photo {
      width: 400px; /* Large size as requested */
      height: auto;
      object-fit: contain;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 5px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .id-photo-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    /* Contract Body */
    .contract-body {
      flex: 1;
    }

    /* Party Sections */
    .party-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .party-en {
      width: 48%;
      text-align: left;
      font-size: 12px;
      line-height: 1.5;
    }

    .party-ar {
      width: 48%;
      text-align: right;
      direction: rtl;
      font-size: 12px;
      line-height: 1.5;
    }

    .party-crn {
      color: #555;
      margin-top: 2px;
    }

    .second-party {
      margin-bottom: 15px;
    }

    .second-party h3 {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 5px;
    }

    /* Agreement Section */
    .agreement-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .agreement-en {
      width: 48%;
      text-align: left;
      font-size: 12px;
      line-height: 1.5;
    }

    .agreement-ar {
      width: 48%;
      text-align: right;
      direction: rtl;
      font-size: 12px;
      line-height: 1.5;
    }

    /* Promoter Details Section */
    .promoter-details-section {
      margin-bottom: 20px;
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.9);
    }

    .promoter-details-header {
      display: flex;
      justify-content: space-between;
      background-color: #f9f9f9;
      padding: 8px 15px;
      border-bottom: 1px solid #eee;
    }

    .promoter-title-en {
      font-weight: bold;
      font-size: 12px;
    }

    .promoter-title-ar {
      font-weight: bold;
      font-size: 12px;
      text-align: right;
    }

    .promoter-content {
      display: flex;
      justify-content: space-between;
      padding: 15px;
    }

    .promoter-info-en {
      width: 48%;
      font-size: 12px;
    }

    .promoter-info-ar {
      width: 48%;
      text-align: right;
      direction: rtl;
      font-size: 12px;
    }

    .promoter-field {
      margin-bottom: 8px;
    }

    .field-label {
      font-weight: bold;
      display: inline-block;
      min-width: 60px;
    }

    /* Responsibilities Section */
    .responsibilities-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .responsibilities-en {
      width: 48%;
      font-size: 12px;
      line-height: 1.5;
    }

    .responsibilities-ar {
      width: 48%;
      text-align: right;
      direction: rtl;
      font-size: 12px;
      line-height: 1.5;
    }

    .section-title {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 12px;
    }

    /* Regards Section */
    .regards-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .regards-en {
      width: 48%;
      font-style: italic;
      font-size: 12px;
    }

    .regards-ar {
      width: 48%;
      text-align: right;
      direction: rtl;
      font-style: italic;
      font-size: 12px;
    }

    /* Signatures Section */
    .signatures-section {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
    }

    .signature-column {
      width: 45%;
      text-align: center;
      font-size: 12px;
    }

    .signature-label {
      margin-bottom: 5px;
    }

    .signature-line {
      margin: 40px 0 10px;
      border-bottom: 1px solid #000;
    }

    /* New signature styles */
    .signature-image-container {
      margin: 10px 0;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .signature-with-name {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
      position: relative;
      width: 100%;
    }

    .signature-image {
      max-width: 100%;
      max-height: 60px;
      object-fit: contain;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .stamp-image {
      max-width: 80px;
      max-height: 80px;
      object-fit: contain;
      position: absolute;
      right: 0;
      bottom: 0;
      opacity: 0.7;
      transform: rotate(-15deg);
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .signature-name {
      font-size: 10px;
      margin-top: 5px;
    }

    /* Document Page Styles */
    .document-page-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      flex: 1;
    }

    .document-title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      width: 100%;
    }

    .document-name {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 5px;
    }

    .document-description {
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
      color: #666;
    }

    .document-display {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }

    .document-image {
      max-width: 80%;
      max-height: 500px;
      object-fit: contain;
      border: 2px solid #ddd;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .document-placeholder {
      width: 80%;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #ddd;
      color: #999;
      font-size: 16px;
    }

    .document-details {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .document-info, .document-info-ar {
      width: 48%;
    }

    .document-field {
      margin-bottom: 10px;
      font-size: 14px;
    }

    .document-verification {
      width: 100%;
      margin-top: 20px;
      text-align: center;
    }

    .verification-text {
      font-size: 14px;
      line-height: 1.6;
    }

    .verification-text p {
      margin-bottom: 10px;
    }

    /* Ensure backgrounds and images print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Page break for second page */
    .page-break {
      page-break-before: always;
      break-before: page;
    }
  `;
}
