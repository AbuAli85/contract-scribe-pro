
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import type { ContractData } from "@/types/contract";
import ContractPreviewAdapter from "./ContractPreviewAdapter";

interface ContractPreviewTabProps {
  language: "ar" | "en";
  contractData: ContractData;
  contractId: string;
  isPrinting: boolean;
  onEditClick: () => void;
}

const ContractPreviewTab: React.FC<ContractPreviewTabProps> = ({
  language,
  contractData,
  isPrinting,
  onEditClick,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {language === "ar" ? "معاينة العقد" : "Contract Preview"}
        </h2>
        <Button variant="outline" onClick={onEditClick}>
          <Edit className="h-4 w-4 mr-2" />
          {language === "ar" ? "تعديل" : "Edit"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="contract-container print-container">
            <ContractPreviewAdapter 
              contractData={contractData} 
              language={language} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractPreviewTab;
