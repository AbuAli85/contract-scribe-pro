
import { useState, useEffect } from "react";
import { contractService } from "@/services/contract.service";
import { setupPrintContainer } from "@/utils/print-container";
import PrintContainer from "./contract/PrintContainer";
import ContractDebugInfo from "./contract/ContractDebugInfo";
import ContractActions from "./contract/ContractActions";
import ContractPage from "./contract/ContractPage";
import ContractContent from "./contract/ContractContent";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractPreview = ({ language, contractData, signatures = [] }: ContractPreviewProps) => {
  const [contentReady, setContentReady] = useState(false);
  
  // Force add print-container class and validate printability when data changes
  useEffect(() => {
    if (contractData) {
      // Force setup print container
      setupPrintContainer();
      
      // Check if contract is printable after a short delay to allow rendering
      setTimeout(() => {
        const isPrintable = contractService.validatePrintability();
        console.log('Contract printability check:', isPrintable);
        setContentReady(true);
      }, 300);
    }
  }, [contractData]);

  // Loading state/error handling
  if (!contractData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative print:hidden">
        <strong className="font-bold">No data: </strong>
        <span className="block sm:inline">Contract data could not be loaded.</span>
      </div>
    );
  }

  return (
    <PrintContainer onReady={setContentReady} className="contract-preview">
      {/* Debug info for development environment */}
      <ContractDebugInfo 
        language={language} 
        contentReady={contentReady}
      />
      
      {/* Print and PDF buttons */}
      <ContractActions 
        language={language} 
        contractData={contractData} 
      />

      {/* A4 Page with content */}
      <ContractPage contractData={contractData}>
        <ContractContent 
          language={language} 
          contractData={contractData} 
          signatures={signatures} 
        />
      </ContractPage>
    </PrintContainer>
  );
};

export default ContractPreview;
