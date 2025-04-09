
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ContractPreview from "@/components/ContractPreview";
import PrintDebugButton from "@/components/print/PrintDebugButton";
import DownloadPDFButton from "@/components/contract/DownloadPDFButton";
import { printService } from "@/services/print.service";
import { directPrint } from "@/utils/direct-print";
import { useToast } from "@/hooks/use-toast";

interface ContractPreviewTabProps {
  language: "ar" | "en";
  contractData: any;
  contractId: string;
  isPrinting: boolean;
  onEditClick: () => void;
}

const ContractPreviewTab: React.FC<ContractPreviewTabProps> = ({
  language,
  contractData,
  contractId,
  isPrinting,
  onEditClick
}) => {
  const { toast } = useToast();

  const handlePrintContract = () => {
    if (!contractData) {
      toast({
        title: language === "ar" ? "لا يمكن طباعة العقد" : "Unable to print contract",
        description: language === "ar" ? "يرجى إنشاء العقد أولاً" : "Please generate the contract first",
        variant: "destructive",
      });
      return;
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
  };

  return (
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
        <Button variant="outline" onClick={onEditClick}>
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
  );
};

export default ContractPreviewTab;
