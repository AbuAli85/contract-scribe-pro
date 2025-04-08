
import { useEffect, useState } from "react"
import { Printer, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usePrint } from "@/hooks/usePrint"
import { documentSystem, type AttachedDocument } from "@/lib/documents"
import { useNavigate } from "react-router-dom"
import { contractService } from "@/services/contract.service"

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
  const [contentReady, setContentReady] = useState(false)
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
  
  // Check content visibility on mount and when contractData changes
  useEffect(() => {
    if (!contractData) return
    
    // Check visibility of contract elements after render
    const checkVisibility = setTimeout(() => {
      const contractPreview = document.querySelector('.contract-preview')
      const contractContent = document.querySelector('.contract-content')
      const twoColumnLayout = document.querySelector('.two-column-layout')
      
      // Set as ready only if all important elements exist
      const isReady = !!contractPreview && !!contractContent && !!twoColumnLayout
      
      console.log("Contract content check:", {
        isReady,
        previewExists: !!contractPreview,
        contentExists: !!contractContent,
        layoutExists: !!twoColumnLayout
      })
      
      setContentReady(isReady)
      
      // Auto-fix visibility issues
      if (isReady) {
        contractService.fixPrintVisibility()
      }
    }, 1000)
    
    return () => clearTimeout(checkVisibility)
  }, [contractData])

  const handlePrintClick = () => {
    try {
      if (!contractData) {
        toast({
          title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
          description: language === "ar" ? "بيانات العقد مفقودة" : "Contract data is missing",
          variant: "destructive",
        })
        return
      }

      // Force visibility fixes before printing
      contractService.fixPrintVisibility()
      
      console.log("Starting print process with container:", document.querySelector('.print-container'))
      
      // Use the improved print function
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      navigate(`/print-error?error=${encodeURIComponent(errorMessage)}`)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrintClick}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting || isLoading || !contentReady}
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : !contentReady ? (
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>
        {isPrinting 
          ? (language === "ar" ? "جاري الطباعة..." : "Printing...") 
          : isLoading 
            ? (language === "ar" ? "جاري التحميل..." : "Loading...")
            : !contentReady 
              ? (language === "ar" ? "تجهيز المحتوى..." : "Preparing content...")
              : (language === "ar" ? "طباعة" : "Print")}
      </span>
      {documents.length > 0 && contentReady && (
        <span className="ml-1 text-xs">
          ({documents.length} {language === "ar" ? "مستندات" : "documents"})
        </span>
      )}
    </Button>
  )
}

export default PrintButton
