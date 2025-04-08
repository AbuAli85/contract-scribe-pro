
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Edit, Eye, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { DocumentUploader } from "@/components/DocumentUploader"
import { DocumentsPanel } from "@/components/DocumentsPanel"
import { generateUniqueId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import ContractPreview from "@/components/ContractPreview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContractForm from "@/components/ContractForm"
import { usePrint } from "@/hooks/usePrint"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PrintDebugButton from "@/components/print/PrintDebugButton"
import PrintPreview from "@/components/print/PrintPreview"

export default function CreateContract() {
  // Generate a temporary contract ID for document attachments
  const [contractId] = useState(() => `temp-${generateUniqueId()}`)
  const [documents, setDocuments] = useState<any[]>([])
  const [useNewDocumentsPanel, setUseNewDocumentsPanel] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [contractData, setContractData] = useState<any>(null)
  const { toast } = useToast()
  const { handlePrint, isPrinting } = usePrint({ language })

  const handleGenerateContract = (data: any) => {
    console.log("Contract generated with data:", data);
    setContractData(data)
    setActiveTab("preview")
    
    toast({
      title: language === "ar" ? "تم إنشاء العقد بنجاح" : "Contract generated successfully",
      description: language === "ar" ? "يمكنك الآن معاينة العقد وطباعته" : "You can now preview and print the contract",
    })
  }

  const handleSaveContract = () => {
    // In a real app, this would save the contract to a database
    toast({
      title: language === "ar" ? "تم حفظ العقد" : "Contract saved",
      description: language === "ar" ? "تم حفظ العقد بنجاح" : "Your contract has been saved successfully",
    })
  }

  const handlePrintContract = () => {
    if (!contractData) {
      toast({
        title: language === "ar" ? "لا يمكن طباعة العقد" : "Unable to print contract",
        description: language === "ar" ? "يرجى إنشاء العقد أولاً" : "Please generate the contract first",
        variant: "destructive",
      })
      return
    }
    
    // Use the print hook
    handlePrint('.print-container')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {language === "ar" ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إنشاء عقد جديد" : "Create New Contract"}
        </h1>
        <div className="flex gap-2">
          {/* Only show development tools in development mode */}
          {process.env.NODE_ENV === "development" && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setUseNewDocumentsPanel(!useNewDocumentsPanel)}
                className="mr-2"
              >
                {language === "ar" ? "تبديل لوحة المستندات" : "Toggle Documents Panel"}
              </Button>
              <PrintDebugButton iconOnly className="mr-2" />
            </>
          )}
          <Select 
            value={language} 
            onValueChange={(value: "en" | "ar") => setLanguage(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === "ar" ? "اللغة" : "Language"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSaveContract} variant="default">
            {language === "ar" ? "حفظ العقد" : "Save Contract"}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            {language === "ar" ? "تحرير العقد" : "Edit Contract"}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {language === "ar" ? "معاينة العقد" : "Preview Contract"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <ContractForm
            language={language}
            onGenerateContract={handleGenerateContract}
          />
          
          {useNewDocumentsPanel ? (
            <DocumentsPanel 
              contractId={contractId} 
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "المستندات" : "Documents"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "قم بتحميل المستندات ذات الصلة بهذا العقد" : "Upload relevant documents for this contract"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploader contractId={contractId} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="min-h-[600px]">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {language === "ar" ? "معاينة العقد" : "Contract Preview"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "معاينة كيف سيبدو عقدك" : "Preview how your contract will look"}
                  </CardDescription>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <PrintDebugButton />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto print-container" data-testid="print-container">
              <div className="contract-container">
                {contractData ? (
                  <ContractPreview 
                    language={language} 
                    contractData={contractData}
                    signatures={[]}
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    {language === "ar" 
                      ? "يرجى ملء نموذج العقد وتوليد العقد أولاً" 
                      : "Please fill out the contract form and generate the contract first"}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between print:hidden">
              <Button variant="outline" onClick={() => setActiveTab("edit")}>
                {language === "ar" ? "تحرير العقد" : "Edit Contract"}
              </Button>
              <Button 
                onClick={handlePrintContract}
                disabled={isPrinting || !contractData}
                className="flex items-center gap-2"
              >
                {isPrinting ? (
                  <span>{language === "ar" ? "جاري التحضير..." : "Preparing..."}</span>
                ) : (
                  <>
                    <Printer className="h-4 w-4" />
                    {language === "ar" ? "طباعة العقد" : "Print Contract"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
