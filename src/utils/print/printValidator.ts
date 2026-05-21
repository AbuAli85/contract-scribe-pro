
import { ContractData } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

/**
 * Validates that all required data for printing documents is available
 */
export function validatePrintData(contractData: ContractData | null, selectedDocuments: string[]): boolean {
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
