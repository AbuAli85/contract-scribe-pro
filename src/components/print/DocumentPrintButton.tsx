
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2 } from "lucide-react"
import { useDocumentPrint } from "@/hooks/useDocumentPrint"
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
  const { isPrinting, handlePrint } = useDocumentPrint({
    contractId,
    contractData,
    selectedDocuments,
    documents
  })

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
