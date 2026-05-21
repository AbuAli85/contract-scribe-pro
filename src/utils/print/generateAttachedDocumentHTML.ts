
import { AttachedDocument } from "@/lib/documents"

/**
 * Generates HTML for an attached document in the print view
 */
export function generateAttachedDocumentHTML(doc: AttachedDocument, printData: any): string {
  return `
  <!-- Document: ${doc.name} -->
  <div class="a4-page">
    <!-- Letterhead as full page background -->
    ${
      printData.letterhead
        ? `<div class="letterhead-background" style="background-image: url('${printData.letterhead}');"></div>`
        : ""
    }

    <div class="contract-content">
      <!-- Reference Number - Top Left -->
      <div class="ref-number-container">
        <div class="ref-number">Ref: ${printData.refNumber}</div>
      </div>

      <div class="document-page-content">
        <h2 class="document-title">${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} / ${
          doc.type === "passport"
            ? "جواز السفر"
            : doc.type === "id"
              ? "بطاقة الهوية"
              : doc.type === "visa"
                ? "تأشيرة"
                : doc.type === "license"
                  ? "رخصة"
                  : "شهادة"
        }</h2>

        <div class="document-name">${doc.name}</div>
        ${doc.description ? `<div class="document-description">${doc.description}</div>` : ""}

        <!-- Document Display -->
        <div class="document-display">
          ${
            doc.file.startsWith("data:image")
              ? `<img src="${doc.file}" alt="${doc.name}" class="document-image" crossorigin="anonymous" />`
              : `<div class="document-placeholder">Document Preview Not Available</div>`
          }
        </div>

        <div class="document-details">
          <div class="document-info">
            <div class="document-field">
              <span class="field-label">Promoter Name:</span>
              <span class="field-value">${printData.promoter.name.en}</span>
            </div>
            <div class="document-field">
              <span class="field-label">ID Number:</span>
              <span class="field-value">${printData.promoter.id.en}</span>
            </div>
            <div class="document-field">
              <span class="field-label">Contract Period:</span>
              <span class="field-value">${printData.startDate.en} to ${printData.endDate.en}</span>
            </div>
          </div>

          <div class="document-info-ar" dir="rtl">
            <div class="document-field">
              <span class="field-label">اسم المروج:</span>
              <span class="field-value">${printData.promoter.name.ar}</span>
            </div>
            <div class="document-field">
              <span class="field-label">رقم الهوية:</span>
              <span class="field-value">${printData.promoter.id.ar}</span>
            </div>
            <div class="document-field">
              <span class="field-label">فترة العقد:</span>
              <span class="field-value">${printData.startDate.ar} إلى ${printData.endDate.ar}</span>
            </div>
          </div>
        </div>

        <div class="document-verification">
          <div class="verification-text">
            <p>This document confirms the identity of the promoter mentioned in the contract.</p>
            <p>تؤكد هذه الوثيقة هوية المروج المذكور في العقد.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
}
