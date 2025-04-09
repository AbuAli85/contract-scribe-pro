
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { AttachedDocument } from "@/lib/documents"
import type { ContractData } from "@/lib/types"
import { generatePrintStyles } from "@/utils/print/generatePrintStyles"
import { generateContractPageHTML } from "@/utils/print/generateContractPageHTML"
import { generateAttachedDocumentHTML } from "@/utils/print/generateAttachedDocumentHTML"

interface UseDocumentPrintOptions {
  contractId: string
  contractData: ContractData | null
  selectedDocuments: string[]
  documents?: AttachedDocument[]
}

export function useDocumentPrint({
  contractId,
  contractData,
  selectedDocuments,
  documents
}: UseDocumentPrintOptions) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)

  const validatePrintData = (): boolean => {
    // Check if contractData is valid
    if (!contractData) {
      toast({
        title: "Error preparing print",
        description: "Contract data is missing. Please try again.",
        variant: "destructive",
      })
      console.error("Contract data is missing")
      return false
    }

    // Check if any documents are selected
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to print",
        variant: "destructive",
      })
      console.warn("No documents selected for printing")
      return false
    }

    return true
  }

  const loadSignaturesFromStorage = (): any[] => {
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
    
    return signatures
  }

  const createPrintData = () => {
    // Create a simplified version of the contract data with default values
    return {
      refNumber: contractData?.refNumber || "N/A",
      firstParty: {
        name: {
          en: contractData?.firstParty?.name?.en || "N/A",
          ar: contractData?.firstParty?.name?.ar || "N/A",
        },
        crn: {
          en: contractData?.firstParty?.crn?.en || "N/A",
          ar: contractData?.firstParty?.crn?.ar || "N/A",
        },
      },
      secondParty: {
        name: {
          en: contractData?.secondParty?.name?.en || "N/A",
          ar: contractData?.secondParty?.name?.ar || "N/A",
        },
        crn: {
          en: contractData?.secondParty?.crn?.en || "N/A",
          ar: contractData?.secondParty?.crn?.ar || "N/A",
        },
      },
      promoter: {
        name: {
          en: contractData?.promoter?.name?.en || "N/A",
          ar: contractData?.promoter?.name?.ar || "N/A",
        },
        id: {
          en: contractData?.promoter?.id?.en || "N/A",
          ar: contractData?.promoter?.id?.ar || "N/A",
        },
      },
      product: {
        en: contractData?.product?.en || "N/A",
        ar: contractData?.product?.ar || "N/A",
      },
      location: {
        en: contractData?.location?.en || "N/A",
        ar: contractData?.location?.ar || "N/A",
      },
      startDate: {
        en: contractData?.startDate?.en || "N/A",
        ar: contractData?.startDate?.ar || "N/A",
      },
      endDate: {
        en: contractData?.endDate?.en || "N/A",
        ar: contractData?.endDate?.ar || "N/A",
      },
      letterhead: contractData?.letterhead || null,
      promoterPhoto: contractData?.promoterPhoto || null,
    }
  }

  const handlePrint = async () => {
    try {
      setIsPrinting(true)

      // Validate data before proceeding
      if (!validatePrintData()) {
        setIsPrinting(false)
        return
      }

      // Load signatures from localStorage
      const signatures = loadSignaturesFromStorage()

      // Create print data object
      const printData = createPrintData()

      // Log the printData to the console for debugging
      console.log("Printing with data:", printData)

      // Open a new window for printing
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups for this website.")
      }

      // Generate HTML content for the print window
      const htmlContent = generatePrintHTML(printData, signatures)

      // Write the HTML directly to the new window
      printWindow.document.write(htmlContent)

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

  // Function that returns the completed HTML for printing
  const generatePrintHTML = (printData: any, signatures: any[]): string => {
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

  // Generate HTML for all selected documents
  const generateDocumentHTML = (printData: any, signatures: any[]): string => {
    let documentHTML = ""

    // Add contract page if selected
    if (selectedDocuments.includes("contract")) {
      documentHTML += generateContractPageHTML(printData, signatures)
    }

    // Add attached documents if selected
    const allDocuments = documents || []
    allDocuments.forEach((doc) => {
      if (selectedDocuments.includes(doc.id)) {
        documentHTML += generateAttachedDocumentHTML(doc, printData)
      }
    })

    return documentHTML
  }

  return {
    isPrinting,
    handlePrint
  }
}
