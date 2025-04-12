
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FirstPartySection, SecondPartySection, ContractDetailsSection } from "@/components/contract";
import ExcelUploadSection from "@/components/contract/ExcelUploadSection";
import EmployerSection from "@/components/contract/EmployerSection";
import GenerateContractButton from "@/components/contract/GenerateContractButton";
import { useContractForm } from "@/hooks/useContractForm";

interface ContractFormProps {
  language: "ar" | "en";
  onGenerateContract: (contractData: any) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ language, onGenerateContract }) => {
  // Use our new custom hook to manage form state
  const {
    formData,
    isLoading,
    firstPartyOptions,
    secondPartyOptions,
    employerOptions,
    promoterOptions,
    productOptions,
    locationOptions,
    handleInputChange,
    handleFileUpload,
    handleGenerateContract
  } = useContractForm({ language, onGenerateContract });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <ExcelUploadSection 
            language={language}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
          
          <FirstPartySection
            firstParty={formData.firstParty}
            language={language}
            onChange={handleInputChange}
            options={firstPartyOptions}
          />
          
          <SecondPartySection
            secondParty={formData.secondParty}
            documentType={formData.documentType}
            language={language}
            onChange={handleInputChange}
            promoterOptions={promoterOptions}
            employerOptions={secondPartyOptions}
          />
          
          <EmployerSection
            employer={formData.employer}
            language={language}
            onChange={handleInputChange}
            options={employerOptions}
          />
          
          <ContractDetailsSection
            refNumber={formData.refNumber}
            startDate={formData.startDate}
            endDate={formData.endDate}
            language={language}
            onChange={handleInputChange}
            productOptions={productOptions}
            locationOptions={locationOptions}
          />
          
          <GenerateContractButton
            language={language}
            onClick={handleGenerateContract}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractForm;
