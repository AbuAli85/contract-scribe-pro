
import { useState, useEffect } from "react";
import { generateUniqueId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePrint } from "@/hooks/usePrint";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Eye, History } from "lucide-react";
import ContractForm from "@/components/ContractForm";
import ContractHeader from "@/components/contract/ContractHeader";
import ContractPreviewTab from "@/components/contract/ContractPreviewTab";
import DocumentsSection from "@/components/contract/DocumentsSection";
import { printService } from "@/services/print.service";
import ContractHistory from "@/components/contract/ContractHistory";
import type { ContractData } from "@/types/contract";

export default function CreateContract() {
  const [contractId] = useState(() => `temp-${generateUniqueId()}`);
  const [documents, setDocuments] = useState<any[]>([]);
  const [useNewDocumentsPanel, setUseNewDocumentsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const { toast } = useToast();
  const { handlePrint, isPrinting } = usePrint({ language, forceDirectPrint: true });

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
    setContractData(data);
    setActiveTab("preview");
    
    toast({
      title: language === "ar" ? "تم إنشاء العقد بنجاح" : "Contract generated successfully",
      description: language === "ar" ? "يمكنك الآن معاينة العقد وطباعته" : "You can now preview and print the contract",
    });
  };

  const handleSaveContract = () => {
    toast({
      title: language === "ar" ? "تم حفظ العقد" : "Contract saved",
      description: language === "ar" ? "تم حفظ العقد بنجاح" : "Your contract has been saved successfully",
    });
  };

  const handleEditClick = () => {
    setActiveTab("edit");
  };

  const handleLoadContract = (contract: ContractData) => {
    setContractData(contract);
    setActiveTab("preview");
    
    toast({
      title: language === "ar" ? "تم تحميل العقد" : "Contract loaded",
      description: language === "ar" ? "تم تحميل العقد بنجاح" : "Contract has been loaded successfully"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ContractHeader 
        language={language}
        useNewDocumentsPanel={useNewDocumentsPanel}
        onLanguageChange={setLanguage}
        onToggleDocumentsPanel={() => setUseNewDocumentsPanel(!useNewDocumentsPanel)}
        onSaveContract={handleSaveContract}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            {language === "ar" ? "تحرير العقد" : "Edit Contract"}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {language === "ar" ? "معاينة العقد" : "Preview Contract"}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            {language === "ar" ? "السجل" : "History"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <ContractForm
            language={language}
            onGenerateContract={handleGenerateContract}
          />
          
          <DocumentsSection 
            contractId={contractId}
            documents={documents}
            useNewDocumentsPanel={useNewDocumentsPanel}
            language={language}
            onDocumentsChange={setDocuments}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="min-h-[600px]">
          <ContractPreviewTab 
            language={language}
            contractData={contractData}
            contractId={contractId}
            isPrinting={isPrinting}
            onEditClick={handleEditClick}
          />
        </TabsContent>
        
        <TabsContent value="history" className="min-h-[600px]">
          {contractData && (
            <ContractHistory
              language={language}
              currentContract={contractData}
              onLoadContract={handleLoadContract}
              onSaveContract={handleSaveContract}
            />
          )}
          {!contractData && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "يرجى إنشاء عقد أولاً لعرض السجل"
                  : "Please create a contract first to view history"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
