
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AttachedDocument } from "@/lib/documents"
import type { ContractData } from "@/lib/types"

// Define the PrintButtonProps interface
interface PrintButtonProps {
  contractId: string
  contractData: ContractData | null
  selectedDocuments: string[]
  documents?: AttachedDocument[]
}

/**
 * A specialized print button for contracts and associated documents
 * that opens a new window with formatted content for printing
 */
const DocumentPrintButton: React.FC<PrintButtonProps> = ({
  contractId,
  contractData,
  selectedDocuments,
  documents,
}) => {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    try {
      setIsPrinting(true)

      // Check if contractData is valid
      if (!contractData) {
        toast({
          title: "Error preparing print",
          description: "Contract data is missing. Please try again.",
          variant: "destructive",
        })
        setIsPrinting(false)
        console.error("Contract data is missing")
        return
      }

      // Check if any documents are selected
      if (selectedDocuments.length === 0) {
        toast({
          title: "No documents selected",
          description: "Please select at least one document to print",
          variant: "destructive",
        })
        setIsPrinting(false)
        console.warn("No documents selected for printing")
        return
      }

      // Load signatures from localStorage
      const signatures: any[] = []
      try {
        // Try to get signatures from the new format first
        const savedSignatures = localStorage.getItem(`contract-signatures-${contractId}`)
        if (savedSignatures) {
          const parsedSignatures = JSON.parse(savedSignatures)
          // Filter only signatures with actual signature data
          const validSignatures = parsedSignatures.filter((s: any) => s.signature)
          signatures.push(...validSignatures)
        }

        // If no signatures found, try the old format
        if (signatures.length === 0) {
          const savedSignatories = localStorage.getItem(`contract-signatories-${contractId}`)
          if (savedSignatories) {
            const signatories = JSON.parse(savedSignatories)
            // Filter only signed signatories with signature data
            const signedSignatories = signatories.filter((s: any) => s.signed && s.signatureData)

            // Convert to the expected format
            const convertedSignatures = signedSignatories.map((s: any) => ({
              partyId: s.id,
              partyName: s.name,
              partyRole: s.role,
              signature: s.signatureData,
              stamp: s.stampData,
              timestamp: s.signedAt || new Date().toISOString(),
            }))

            signatures.push(...convertedSignatures)
          }
        }
      } catch (error) {
        console.error("Error loading signatures:", error)
      }

      // Create a simplified version of the contract data with default values and explicit type assertions
      const printData = {
        refNumber: contractData.refNumber || "N/A",
        firstParty: {
          name: {
            en: contractData.firstParty?.name?.en || "N/A",
            ar: contractData.firstParty?.name?.ar || "N/A",
          },
          crn: {
            en: contractData.firstParty?.crn?.en || "N/A",
            ar: contractData.firstParty?.crn?.ar || "N/A",
          },
        },
        secondParty: {
          name: {
            en: contractData.secondParty?.name?.en || "N/A",
            ar: contractData.secondParty?.name?.ar || "N/A",
          },
          crn: {
            en: contractData.secondParty?.crn?.en || "N/A",
            ar: contractData.secondParty?.crn?.ar || "N/A",
          },
        },
        promoter: {
          name: {
            en: contractData.promoter?.name?.en || "N/A",
            ar: contractData.promoter?.name?.ar || "N/A",
          },
          id: {
            en: contractData.promoter?.id?.en || "N/A",
            ar: contractData.promoter?.id?.ar || "N/A",
          },
        },
        product: {
          en: contractData.product?.en || "N/A",
          ar: contractData.product?.ar || "N/A",
        },
        location: {
          en: contractData.location?.en || "N/A",
          ar: contractData.location?.ar || "N/A",
        },
        startDate: {
          en: contractData.startDate?.en || "N/A",
          ar: contractData.startDate?.ar || "N/A",
        },
        endDate: {
          en: contractData.endDate?.en || "N/A",
          ar: contractData.endDate?.ar || "N/A",
        },
        letterhead: contractData.letterhead || null,
        promoterPhoto: contractData.promoterPhoto || null,
      }

      // Log the printData to the console for debugging
      console.log("Printing with data:", printData)

      // Open a new window for printing
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups for this website.")
      }

      // Generate HTML for selected documents
      let documentHTML = ""

      // Add contract page if selected
      if (selectedDocuments.includes("contract")) {
        // Generate signatures HTML
        let firstPartySignatureHTML = ""
        let secondPartySignatureHTML = ""

        // First party signatures
        const firstPartySignatures = signatures.filter((s) => s.role.toLowerCase().includes("first party"))
        if (firstPartySignatures.length > 0) {
          firstPartySignatureHTML = firstPartySignatures
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

        // Second party signatures
        const secondPartySignatures = signatures.filter((s) => s.role.toLowerCase().includes("second party"))
        if (secondPartySignatures.length > 0) {
          secondPartySignatureHTML = secondPartySignatures
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

        // Create letterhead background HTML
        const letterheadHTML = printData.letterhead
          ? `<div class="letterhead-background" style="background-image: url('${printData.letterhead}');"></div>`
          : ""

        // Create ID photo HTML
        const idPhotoHTML = printData.promoterPhoto
          ? `
         <div class="id-photo-container" style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
           <img src="${printData.promoterPhoto}" alt="ID Photo" class="id-photo" crossorigin="anonymous">
           <div class="id-photo-label">ID Photo / صورة الهوية</div>
         </div>
          `
          : ""

        documentHTML += `
        <!-- Contract Page -->
        <div class="a4-page">
         <!-- Letterhead as full page background - Ensure correct styling -->
          ${letterheadHTML}

          <div class="contract-content">
            <!-- Reference Number - Top Left -->
            <div class="ref-number-container">
              <div class="ref-number">Ref: ${printData.refNumber}</div>
            </div>

           <!-- ID Photo - Positioned prominently - Ensure correct styling -->
            ${idPhotoHTML}

            <!-- Contract Body -->
            <div class="contract-body">
              <!-- First Party -->
              <div class="party-section">
                <div class="party-en">
                 <p>This contract is between <strong>${printData.firstParty?.name?.en || "N/A"}</strong></p>
                 <p class="party-crn">C.R. No.: ${printData.firstParty?.crn?.en || "N/A"}</p>
                </div>
                <div class="party-ar">
                 <p>هذا العقد بين <strong>${printData.firstParty?.name?.ar || "N/A"}</strong></p>
                 <p class="party-crn">رقم السجل التجاري: ${printData.firstParty?.crn?.ar}</p>
                </div>
              </div>

              <!-- Second Party -->
              <div class="party-section second-party">
                <div class="party-en">
                  <h3>Second Party:</h3>
                 <p><strong>${printData.secondParty?.name?.en || "N/A"}</strong></p>
                 <p class="party-crn">C.R. No.: ${printData.secondParty?.crn?.en || "N/A"}</p>
                </div>
                <div class="party-ar">
                  <h3>طرف ثاني:</h3>
                 <p><strong>${printData.secondParty?.name?.ar || "N/A"}</strong></p>
                 <p class="party-crn">رقم السجل التجاري: ${printData.secondParty?.crn?.ar}</p>
                </div>
              </div>

              <!-- Agreement -->
              <div class="agreement-section">
                <div class="agreement-en">
                  <p>
                   The Second Party agrees to provide The First Party with a qualified promoter to sell (" <strong>${printData.product?.en || "N/A"}</strong>
                   ") products at <strong>${printData.location?.en || "N/A"}</strong>.
                  </p>
                </div>
                <div class="agreement-ar">
                  <p>
                    يوافق الطرف الثاني على تزويد الطرف الأول بمروج مؤهل لبيع منتجات "
                   <strong>${printData.product?.ar || "N/A"}</strong>" في <strong>${printData.location?.ar || "N/A"}</strong>.
                  </p>
                </div>
              </div>

              <!-- Promoter Details -->
              <div class="promoter-details-section">
                <div class="promoter-details-header">
                  <div class="promoter-title-en">Promoter Details:</div>
                  <div class="promoter-title-ar">بيانات المروج:</div>
                </div>

                     <div class="promoter-content">
                       <div class="promoter-info-en">
                         <div class="promoter-field">
                           <span class="field-label">Name:</span> <span class="field-value">${printData.promoter?.name?.en || "N/A"}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">ID NO:</span> <span class="field-value">${printData.promoter?.id?.en || "N/A"}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">From:</span> <span class="field-value">${printData.startDate?.en || "N/A"}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">To:</span> <span class="field-value">${printData.endDate?.en || "N/A"}</span>
                         </div>
                       </div>

                       <div class="promoter-info-ar">
                         <div class="promoter-field">
                           <span class="field-label">الاسم:</span>
                           <span class="field-value">${printData.promoter.name.ar}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">رقم الهوية:</span>
                           <span class="field-value">${printData.promoter.id.ar}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">من:</span>
                           <span class="field-value">${printData.startDate.ar}</span>
                         </div>
                         <div class="promoter-field">
                           <span class="field-label">إلى:</span>
                           <span class="field-value">${printData.endDate.ar}</span>
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
               </div>
             </div>
             `
      }

      // Add attached documents if selected
      const allDocuments = documents || []
      allDocuments.forEach((doc) => {
        if (selectedDocuments.includes(doc.id)) {
          documentHTML += `
          <!-- Document: ${doc.name} -->
          <div class="a4-page">
            <!-- Letterhead as full page background -->
            ${
              contractData?.letterhead
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
      })

      // Write the HTML directly to the new window
      printWindow.document.write(`
 <!DOCTYPE html>
 <html>
 <head>
   <meta charset="UTF-8">
   <title>Print Documents - ${printData.refNumber}</title>
   <style>
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
   </style>
 </head>
 <body>
   ${documentHTML}
   <script>
     window.onload = function() {
       window.print();
     };
   </script>
 </body>
 </html>
`)

      // Close the document to finish loading
      printWindow.document.close()
    } catch (error) {
      console.error("Print error:", error)
      toast({
        title: "Print Error",
        description: error instanceof Error ? error.message : "An error occurred while printing",
        variant: "destructive",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Button onClick={handlePrint} disabled={isPrinting} variant="outline" className="flex items-center gap-1">
      {isPrinting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Preparing...</span>
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          <span>Print Selected Documents</span>
        </>
      )}
    </Button>
  )
}

export default DocumentPrintButton
