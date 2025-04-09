
import type { AttachedDocument } from "@/lib/documents"
import { generateContractPageHTML } from "./generateContractPageHTML"
import { generateAttachedDocumentHTML } from "./generateAttachedDocumentHTML"
import { generatePrintStyles } from "./generatePrintStyles"

/**
 * Generates complete HTML for the print window
 */
export function generatePrintHTML(printData: any, signatures: any[]): string {
  // Generate all document HTML
  const documentHTML = generateDocumentHTML(printData, signatures)
  
  // Combine with the full HTML template including styles
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Documents - ${printData.refNumber}</title>
  <style>
    ${generatePrintStyles()}
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
`
}

/**
 * Generates HTML for all selected documents
 */
export function generateDocumentHTML(
  printData: any, 
  signatures: any[], 
  selectedDocuments: string[] = ["contract"], 
  documents: AttachedDocument[] = []
): string {
  let documentHTML = ""

  // Add contract page if selected
  if (selectedDocuments.includes("contract")) {
    documentHTML += generateContractPageHTML(printData, signatures)
  }

  // Add attached documents if selected
  documents.forEach((doc) => {
    if (selectedDocuments.includes(doc.id)) {
      documentHTML += generateAttachedDocumentHTML(doc, printData)
    }
  })

  return documentHTML
}
