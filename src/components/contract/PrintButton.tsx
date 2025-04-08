
import { useEffect, useState, useRef } from "react"
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
  const [visibilityChecked, setVisibilityChecked] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const navigate = useNavigate()
  const printButtonRef = useRef<HTMLButtonElement>(null)
  
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
      const contractText = document.querySelectorAll('.contract-text')
      const twoColumnLayout = document.querySelector('.two-column-layout')
      
      // Detailed visibility check
      const results = {
        previewExists: !!contractPreview,
        contentExists: !!contractContent,
        textElements: contractText.length,
        layoutExists: !!twoColumnLayout,
        previewDisplay: contractPreview ? window.getComputedStyle(contractPreview).display : 'element not found',
        contentDisplay: contractContent ? window.getComputedStyle(contractContent).display : 'element not found',
        layoutDisplay: twoColumnLayout ? window.getComputedStyle(twoColumnLayout).display : 'element not found'
      }
      
      console.log("Content visibility check results:", results)
      
      // Set as ready only if all important elements exist
      const isReady = results.previewExists && 
                      results.contentExists && 
                      results.textElements > 0 &&
                      results.layoutExists;
      
      setContentReady(isReady)
      setVisibilityChecked(true)
      
      // Auto-fix visibility issues
      if (results.previewExists) {
        contractService.fixPrintVisibility()
      }
    }, 1000)
    
    return () => clearTimeout(checkVisibility)
  }, [contractData])

  // Validate all required elements before printing
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

    // Check if printing container exists and has content
    const printContainer = document.querySelector('.print-container')
    if (!printContainer || !printContainer.innerHTML || printContainer.innerHTML.trim() === '') {
      toast({
        title: language === "ar" ? "محتوى الطباعة غير موجود" : "Print content empty",
        description: language === "ar" ? "لا يمكن العثور على محتوى للطباعة" : "Cannot find content to print",
        variant: "destructive",
      })
      console.error("Print container is empty or not found")
      return false
    }

    // Log content length for debugging
    console.log("Print container content length:", printContainer.innerHTML.length)

    // Check contract preview content visibility
    const contractPreview = document.querySelector('.contract-preview')
    const contractContent = document.querySelector('.contract-content')
    const twoColumnLayout = document.querySelector('.two-column-layout')
    
    if (!contractPreview || !contractContent || !twoColumnLayout) {
      toast({
        title: language === "ar" ? "عناصر العقد غير مكتملة" : "Contract elements incomplete",
        description: language === "ar" ? "بعض عناصر العقد مفقودة. يرجى تحديث الصفحة." : "Some contract elements are missing. Try refreshing.",
        variant: "destructive",
      })
      console.error("Missing critical contract elements", {
        preview: !!contractPreview,
        content: !!contractContent,
        layout: !!twoColumnLayout
      })
      return false
    }

    return true
  }

  const prepareForPrinting = () => {
    // Apply visibility fixes via the contract service
    contractService.fixPrintVisibility()
    
    // Get all contract elements and log their status
    const elements = document.querySelectorAll('.contract-preview, .contract-content, .two-column-layout, .contract-column')
    console.log(`Found ${elements.length} critical contract elements to prepare for printing`)
    
    // Extra step to ensure letterhead visibility
    const letterhead = document.querySelector('.letterhead-background')
    if (letterhead instanceof HTMLElement) {
      letterhead.style.display = 'block'
      letterhead.style.visibility = 'visible'
      letterhead.style.opacity = '0.8'
    } else {
      console.warn("Letterhead background not found")
    }
  }

  const handlePrintClick = async () => {
    try {
      if (!validatePrintContent()) {
        return
      }

      // Prepare elements for printing by forcing visibility
      prepareForPrinting()
      
      // Log info about what will be printed
      console.log("Preparing document for print:", {
        contractId,
        contentReady,
        documentCount: documents.length
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      navigate(`/print-error?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  return (
    <Button
      ref={printButtonRef}
      variant="outline"
      onClick={handlePrintClick}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting || isLoading || !contentReady}
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : !visibilityChecked || !contentReady ? (
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
      <span>
        {isPrinting 
          ? (language === "ar" ? "جاري التحضير..." : "Preparing...") 
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
