
import { useEffect, useState } from "react"
import { Printer, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { documentSystem, type AttachedDocument } from "@/lib/documents"
import { useNavigate } from "react-router-dom"
import { contractService } from "@/services/contract.service"
import { printService } from "@/services/print.service"

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
  const [documents, setDocuments] = useState<AttachedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
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
      // Validate printability using our centralized service
      const isReady = printService.validatePrintContent('.print-container')
      setContentReady(isReady)
      
      if (isReady) {
        // Pre-fix any visibility issues that might exist
        printService.fixVisibility('.print-container')
      }
    }, 1000)
    
    return () => clearTimeout(checkVisibility)
  }, [contractData])

  const handlePrintClick = () => {
    if (!contractData) {
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: language === "ar" ? "بيانات العقد مفقودة" : "Contract data is missing",
        variant: "destructive",
      })
      return
    }

    setIsPrinting(true)
    
    try {
      // Force visibility fixes before printing
      printService.fixVisibility('.print-container')
      
      // Short timeout to ensure styles are applied
      setTimeout(() => {
        try {
          // Use the direct printNow method to avoid cross-origin issues
          printService.printNow()
          
          // Handle success
          setTimeout(() => {
            setIsPrinting(false)
            toast({
              title: language === "ar" ? "تمت الطباعة بنجاح" : "Print Successful",
              description: language === "ar" ? "تم إرسال المستند إلى الطابعة" : "Document has been sent to the printer"
            })
          }, 1000)
        } catch (error) {
          console.error("Print error:", error)
          setIsPrinting(false)
          
          toast({
            title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
            description: error instanceof Error ? error.message : "An error occurred while printing",
            variant: "destructive",
          })
          
          // Navigate to error page for cross-origin errors
          if (error instanceof Error && 
              (error.message.includes('cross-origin') || 
               error.message.includes('Permission denied'))) {
            navigate('/print-error?error=' + encodeURIComponent(error.message))
          }
        }
      }, 100)
    } catch (error) {
      console.error("Print setup error:", error)
      setIsPrinting(false)
      
      toast({
        title: language === "ar" ? "خطأ في الطباعة" : "Print Error",
        description: error instanceof Error ? error.message : "An error occurred while printing",
        variant: "destructive",
      })
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
