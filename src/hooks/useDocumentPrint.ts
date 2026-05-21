
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { AttachedDocument } from "@/lib/documents"
import type { ContractData } from "@/lib/types"
import { validatePrintData } from "@/utils/print/printValidator"
import { loadSignaturesFromStorage } from "@/utils/print/signatureLoader"
import { formatContractDataForPrint } from "@/utils/print/contractDataFormatter"
import { generatePrintHTML } from "@/utils/print/htmlGenerator"

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
  documents = []
}: UseDocumentPrintOptions) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    try {
      setIsPrinting(true)

      // Validate data before proceeding
      if (!validatePrintData(contractData, selectedDocuments)) {
        setIsPrinting(false)
        return
      }

      // Load signatures from localStorage
      const signatures = loadSignaturesFromStorage(contractId)

      // Create print data object
      const printData = formatContractDataForPrint(contractData)

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

  return {
    isPrinting,
    handlePrint
  }
}
