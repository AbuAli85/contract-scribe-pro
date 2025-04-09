import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Edit, Eye, Printer, FileDown } from "lucide-react"
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
import { printService } from "@/services/print.service"
import { directPrint } from "@/utils/direct-print"
import DownloadPDFButton from "@/components/contract/DownloadPDFButton"

export default function CreateContract() {
  const [contractId] = useState(() => `temp-${generateUniqueId()}`)
  const [documents, setDocuments] = useState<any[]>([])
  const [useNewDocumentsPanel, setUseNewDocumentsPanel] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [contractData, setContractData] = useState<any>(null)
  const { toast } = useToast()
  const { handlePrint, isPrinting } = usePrint({ language, forceDirectPrint: true })

  useEffect(() => {
    if (activeTab === "preview" && contractData) {
      const timer = setTimeout(() => {
        const printContainer = document.querySelector('.print-container');
        
        if (!printContainer) {
          console.log('Print container not found, creating one');
          
          const containers = [
            '.contract-preview',
            '.contract-container',
            '.a4-page',
            '[data-testid="print-container"]',
            '.contract-content'
          ];
          
          let containerFound = false;
          for (const selector of containers) {
            const element = document.querySelector(selector);
            if (element) {
              element.classList.add('print-container');
              console.log(`Added print-container class to ${selector}`);
              containerFound = true;
              break;
            }
          }
          
          if (!containerFound && document.querySelector('.contract-container')) {
            const content = document.querySelector('.contract-container');
            const wrapper = document.createElement('div');
            wrapper.className = 'print-container';
            wrapper.setAttribute('data-testid', 'print-container');
            
            if (content && content.parentNode) {
              content.parentNode.insertBefore(wrapper, content);
              wrapper.appendChild(content);
              console.log('Created new print container wrapper');
            }
          }
        }
        
        printService.fixVisibility('.print-container');
        
        console.log('Print container check complete:', !!document.querySelector('.print-container'));
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, contractData]);

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
    
    const printContainer = document.querySelector('.print-container');
    if (!printContainer) {
      console.log('Print container not found, adding to contract-preview');
      
      const contractPreview = document.querySelector('.contract-preview');
      if (contractPreview) {
        contractPreview.classList.add('print-container');
      }
    }
    
    printService.fixVisibility('.print-container');
    directPrint('.print-container');
    
    setTimeout(() => {
      toast({
        title: language === "ar" ? "تم إرسال الطباعة" : "Print Sent",
        description: language === "ar" ? "تم إرسال المستند إلى الطابعة" : "Document was sent to printer",
      });
    }, 1000);
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
              <div className="flex gap-2">
                <DownloadPDFButton
                  language={language}
                  contractData={contractData}
                  contractId={contractId}
                />
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
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
