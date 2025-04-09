
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
      console.log("ContractPreview: Contract data received", contractData);
      
      // Force setup print container
      setupPrintContainer();
      
      // Check if contract is printable after a short delay to allow rendering
      setTimeout(() => {
        const isPrintable = contractService.validatePrintability();
        console.log('Contract printability check:', isPrintable);
        setContentVisible(true);
        setContentReady(true);
      }, 300);
    } else {
      console.warn("ContractPreview: No contract data provided");
    }
  }, [contractData]);

  const [contentVisible, setContentVisible] = useState(false);
  
  // Add an extra visibility forcing effect
  useEffect(() => {
    if (contractData) {
      const visibilityTimer = setTimeout(() => {
        // Force visibility on critical elements
        console.log("Forcing visibility on contract elements");
        
        // Add CSS to force visibility
        const style = document.createElement('style');
        style.textContent = `
          .contract-content, .a4-page, .two-column-layout, .contract-column,
          .reference-section, .signature-area, .id-photo-container {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .two-column-layout {
            display: flex !important;
          }
        `;
        document.head.appendChild(style);
        
        setContentVisible(true);
        
        return () => {
          document.head.removeChild(style);
        };
      }, 500);
      
      return () => clearTimeout(visibilityTimer);
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
    <PrintContainer 
      onReady={setContentReady} 
      className={`contract-preview ${contentVisible ? 'content-visible' : 'content-loading'}`}
      showDebugInfo={process.env.NODE_ENV === 'development'}
    >
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
      
      {/* Inline debug info */}
      {process.env.NODE_ENV === 'development' && !contentVisible && (
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 print:hidden">
          <p className="text-sm text-yellow-800">
            Content is initializing... If you don't see the contract, please try refreshing the page.
          </p>
        </div>
      )}
    </PrintContainer>
  );
};

export default ContractPreview;
