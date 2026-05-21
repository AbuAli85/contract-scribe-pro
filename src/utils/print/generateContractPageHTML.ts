
/**
 * Generates the HTML for the contract page in the print view
 */
export function generateContractPageHTML(printData: any, signatures: any[]): string {
  // Generate signatures HTML
  const firstPartySignatureHTML = generateSignatureHTML(
    signatures.filter((s) => s.role.toLowerCase().includes("first party"))
  )
  
  const secondPartySignatureHTML = generateSignatureHTML(
    signatures.filter((s) => s.role.toLowerCase().includes("second party"))
  )

  // Create letterhead background HTML
  const letterheadHTML = printData.letterhead
    ? `<div class="letterhead-background" style="background-image: url('${printData.letterhead}');"></div>`
    : ""

  // Create ID photo HTML with formatting matching the Oman ID card
  const idPhotoHTML = printData.promoterPhoto
    ? `
   <div class="id-photo-container" style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
     <div class="id-photo-wrapper" style="border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
       <img src="${printData.promoterPhoto}" alt="ID Photo" class="id-photo" crossorigin="anonymous">
     </div>
     <div class="id-photo-label" style="font-size: 12px; margin-top: 5px; text-align: center;">
       RESIDENT CARD / بطاقة مقيم - ID: ${printData.promoter?.id?.en || "126208869"}
     </div>
   </div>
    `
    : ""

  return `
  <!-- Contract Page -->
  <div class="a4-page">
   <!-- Letterhead as full page background - Ensure correct styling -->
    ${letterheadHTML}

    <div class="contract-content">
      <!-- Reference Number - Top Right -->
      <div class="ref-number-container">
        <div class="ref-number">Ref: ${printData.refNumber}</div>
      </div>

     <!-- ID Photo - Positioned prominently - With Oman ID styling -->
      ${idPhotoHTML}

      <!-- Contract Body -->
      <div class="contract-body">
        <!-- First Party -->
        <div class="party-section">
          <div class="party-en">
           <p>This contract is between <strong>${printData.firstParty?.name?.en || "Falcon EYE Management and Business SPC"}</strong></p>
           <p class="party-crn">C.R. No.: ${printData.firstParty?.crn?.en || "1410869"}</p>
          </div>
          <div class="party-ar">
           <p>هذا العقد بين <strong>${printData.firstParty?.name?.ar || "عين الصقر للإدارة و الأعمال ش.م.و"}</strong></p>
           <p class="party-crn">رقم السجل التجاري: ${printData.firstParty?.crn?.ar || "1410869"}</p>
          </div>
        </div>

        <!-- Second Party -->
        <div class="party-section second-party">
          <div class="party-en">
            <h3>Second Party:</h3>
           <p><strong>${printData.secondParty?.name?.en || "Al Madar Trading LLC"}</strong></p>
           <p class="party-crn">C.R. No.: ${printData.secondParty?.crn?.en || "1234567"}</p>
          </div>
          <div class="party-ar">
            <h3>طرف ثاني:</h3>
           <p><strong>${printData.secondParty?.name?.ar || "المدار للتجارة ش.م.م"}</strong></p>
           <p class="party-crn">رقم السجل التجاري: ${printData.secondParty?.crn?.ar || "1234567"}</p>
          </div>
        </div>

        <!-- Agreement -->
        <div class="agreement-section">
          <div class="agreement-en">
            <p>
             The Second Party agrees to provide The First Party with a qualified promoter to sell (" <strong>${printData.product?.en || "Electronics"}</strong>
             ") products at <strong>${printData.location?.en || "Al Khuwair, Muscat"}</strong>.
            </p>
          </div>
          <div class="agreement-ar">
            <p>
              يوافق الطرف الثاني على تزويد الطرف الأول بمروج مؤهل لبيع منتجات "
             <strong>${printData.product?.ar || "الإلكترونيات"}</strong>" في <strong>${printData.location?.ar || "الخوير، مسقط"}</strong>.
            </p>
          </div>
        </div>

        <!-- Promoter Details - Styled to match Oman ID card format -->
        <div class="promoter-details-section">
          <div class="promoter-details-header">
            <div class="promoter-title-en">Promoter Details:</div>
            <div class="promoter-title-ar">بيانات المروج:</div>
          </div>

          <div class="promoter-content">
            <div class="promoter-info-en">
              <div class="promoter-field">
                <span class="field-label">Name:</span> <span class="field-value">${printData.promoter?.name?.en || "Farzan Riyaz Munde"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">ID NO:</span> <span class="field-value">${printData.promoter?.id?.en || "126208869"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">Nationality:</span> <span class="field-value">${printData.promoter?.nationality?.en || "Indian"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">From:</span> <span class="field-value">${printData.startDate?.en || "06/04/2025"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">To:</span> <span class="field-value">${printData.endDate?.en || "06/07/2025"}</span>
              </div>
            </div>

            <div class="promoter-info-ar">
              <div class="promoter-field">
                <span class="field-label">الاسم:</span>
                <span class="field-value">${printData.promoter?.name?.ar || "فرزان رياض موندي"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">رقم الهوية:</span>
                <span class="field-value">${printData.promoter?.id?.ar || "126208869"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">الجنسية:</span>
                <span class="field-value">${printData.promoter?.nationality?.ar || "هندي"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">من:</span>
                <span class="field-value">${printData.startDate?.ar || "06/04/2025"}</span>
              </div>
              <div class="promoter-field">
                <span class="field-label">إلى:</span>
                <span class="field-value">${printData.endDate?.ar || "06/07/2025"}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsibilities -->
        <div class="responsibilities-section">
          <div class="responsibilities-en">
            <h3 class="section-title">Financial and Administrative Responsibilities</h3>
            <p>
              The Second Party will bear the entire financial and administrative responsibilities towards this
              promoter.
            </p>
          </div>
          <div class="responsibilities-ar">
            <h3 class="section-title">المسؤوليات المالية والإدارية</h3>
            <p>يتحمل الطرف الثاني كامل المسؤوليات المالية والإدارية تجاه هذا المروج.</p>
          </div>
        </div>

        <!-- Regards -->
        <div class="regards-section">
          <div class="regards-en">Best Regards,</div>
          <div class="regards-ar">و تفضلوا بقبول وافر الشكر و التقدير،</div>
        </div>
      </div>

      <!-- Signatures Section - With actual signatures if available -->
      <div class="signatures-section">
        <div class="signature-row">
          <!-- First Party Signature -->
          <div class="signature-column">
            <div class="signature-label">First Party / الطرف الأول</div>
            ${
              firstPartySignatureHTML
                ? `<div class="signature-image-container">${firstPartySignatureHTML}</div>`
                : `<div class="signature-line"></div>`
            }
          </div>

          <!-- Second Party Signature -->
          <div class="signature-column">
            <div class="signature-label">Second Party / الطرف الثاني</div>
            ${
              secondPartySignatureHTML
                ? `<div class="signature-image-container">${secondPartySignatureHTML}</div>`
                : `<div class="signature-line"></div>`
            }
          </div>
        </div>
      </div>
      
      <!-- Company Footer Info (based on Falcon Eye letterhead) -->
      <div class="company-info">
        <div class="cr-info">
          <span class="cr-label">CR Number: </span>
          <span class="cr-number">1410869</span>
        </div>
        <div class="address">
          PO Box 762, PC-122 Al Khuwair, Bousher, Sultanate of Oman
        </div>
        <div class="contact">
          +968 9194 3449 | hr@falconeyegroup.net
        </div>
      </div>
    </div>
  </div>
  `
}

/**
 * Generates the HTML for signature images
 */
function generateSignatureHTML(signatures: any[]): string {
  if (!signatures.length) return ''
  
  return signatures
    .map(
      (sig) => `
      <div class="signature-with-name">
        <img src="${sig.signature}" alt="${sig.name} Signature" class="signature-image" crossorigin="anonymous">
        ${sig.stamp ? `<img src="${sig.stamp}" alt="${sig.name} Stamp" class="stamp-image" crossorigin="anonymous">` : ""}
        <div class="signature-name">${sig.name}</div>
      </div>
    `,
    )
    .join("")
}

