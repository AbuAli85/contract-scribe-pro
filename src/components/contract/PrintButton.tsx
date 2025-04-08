
import { useEffect, useState } from "react"
import { Printer, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usePrint } from "@/hooks/usePrint"
import { documentSystem, type AttachedDocument } from "@/lib/documents"
import { useNavigate } from "react-router-dom"

interface PrintButtonProps {
  language: "ar" | "en"
  contractData?: any
  selectedDocuments?: string[]
  contractId?: string
}

const PrintButton = ({ 
  language, 
  contractData,
  selectedDocuments = ["contract"],
  contractId = "default"
}: PrintButtonProps) => {
  const { toast } = useToast()
  const { isPrinting, handlePrint } = usePrint()
  const [documents, setDocuments] = useState<AttachedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Load documents that should be included in printing
  useEffect(() => {
    async function loadPrintDocuments() {
      if (!contractId || contractId === "default") return
      
      setIsLoading(true)
      try {
        const docs = await documentSystem.getDocumentsForPrinting(contractId)
        setDocuments(docs)
      } catch (error) {
        console.error("Error loading documents for printing:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPrintDocuments()
  }, [contractId])
  
  // Log contract data on mount for debugging
  useEffect(() => {
    if (contractData) {
      console.log("Contract data available for printing:", contractId)
      console.log("Contract data details:", contractData)
    }
  }, [contractData, contractId])

  const validatePrintContent = () => {
    // Check if contractData is valid
    if (!contractData) {
      toast({
        title: language === "ar" ? "خطأ في تحضير الطباعة" : "Error preparing print",
        description: language === "ar" ? "بيانات العقد مفقودة. يرجى المحاولة مرة أخرى." : "Contract data is missing. Please try again.",
        variant: "destructive",
      })
      console.error("Contract data is missing")
      return false
    }

    // Check if any documents are selected
    if (selectedDocuments.length === 0) {
      toast({
        title: language === "ar" ? "لم يتم تحديد أي مستندات" : "No documents selected",
        description: language === "ar" ? "يرجى تحديد مستند واحد على الأقل للطباعة" : "Please select at least one document to print",
        variant: "destructive",
      })
      console.warn("No documents selected for printing")
      return false
    }

    // Check if printing container exists and has content
    const printContainer = document.querySelector('.print-container')
    if (!printContainer) {
      toast({
        title: language === "ar" ? "محتوى الطباعة غير موجود" : "Print content not found",
        description: language === "ar" ? "لا يمكن العثور على محتوى الطباعة" : "Cannot find print content",
        variant: "destructive",
      })
      console.error("Print container not found")
      return false
    }

    return true
  }

  const handlePrintClick = async () => {
    try {
      if (!validatePrintContent()) {
        return
      }

      // Check contract preview content visibility
      const contractPreview = document.querySelector('.contract-preview')
      const isVisible = contractPreview && 
                       window.getComputedStyle(contractPreview).display !== 'none' &&
                       window.getComputedStyle(contractPreview).visibility !== 'hidden'
      
      if (!isVisible) {
        toast({
          title: language === "ar" ? "معاينة العقد غير مرئية" : "Contract preview not visible",
          description: language === "ar" ? "يرجى التأكد من أن معاينة العقد مرئية قبل الطباعة" : "Please ensure contract preview is visible before printing",
          variant: "destructive",
        })
        return
      }

      // Log info about what will be printed
      console.log("Preparing document for print:", {
        contractData,
        selectedDocuments,
        includedDocuments: documents.length
      })
      
      // Call the handlePrint function from usePrint hook
      handlePrint()

    } catch (error) {
      console.error("Print error:", error)
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : 
          (language === "ar" ? "حدث خطأ أثناء الطباعة" : "An error occurred while printing"),
        variant: "destructive",
      })
      
      // Navigate to error page on error
      navigate('/print-error')
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrintClick}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting || isLoading}
    >
      {isPrinting || isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>
        {isPrinting 
          ? (language === "ar" ? "جاري التحضير..." : "Preparing...") 
          : isLoading 
            ? (language === "ar" ? "جاري التحميل..." : "Loading...")
            : (language === "ar" ? "طباعة" : "Print")}
      </span>
      {documents.length > 0 && (
        <span className="ml-1 text-xs">
          ({documents.length} {language === "ar" ? "مستندات" : "documents"})
        </span>
      )}
    </Button>
  )
}

export default PrintButton
