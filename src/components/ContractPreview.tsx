
import { useEffect, useState, useRef } from "react";
import PrintButton from "./contract/PrintButton";
import ReferenceNumber from "./contract/ReferenceNumber";
import PromoterPhoto from "./contract/PromoterPhoto";
import ContractTitle from "./contract/ContractTitle";
import EnglishContractColumn from "./contract/EnglishContractColumn";
import ArabicContractColumn from "./contract/ArabicContractColumn";
import SignatureArea from "./contract/SignatureArea";
import { contractService } from "@/services/contract.service";
import PrintPreview from "./print/PrintPreview";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractPreview = ({ language, contractData, signatures = [] }: ContractPreviewProps) => {
  const [contentReady, setContentReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize print container and validate printability on load and when data changes
  useEffect(() => {
    if (contractData) {
      // Force add print-container class to the main element
      if (containerRef.current) {
        containerRef.current.classList.add('print-container');
        console.log('Added print-container class to contract preview element');
      }
      
      // Short timeout to allow DOM to update
      setTimeout(() => {
        // Double-check print container exists
        const printContainer = document.querySelector('.print-container');
        if (!printContainer && containerRef.current) {
          containerRef.current.classList.add('print-container');
          console.log('Re-added print-container class');
        }
        
        const isPrintable = contractService.validatePrintability();
        console.log("Contract printability check:", isPrintable, "Print container exists:", !!document.querySelector('.print-container'));
        
        // Set content ready regardless to allow printing to proceed
        setContentReady(true);
      }, 500);
    }
  }, [contractData]);

  if (!contractData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative print:hidden">
        <strong className="font-bold">No data: </strong>
        <span className="block sm:inline">Contract data could not be loaded.</span>
      </div>
    );
  }

  const handleContentReady = (isReady: boolean) => {
    setContentReady(isReady);
    console.log("Contract preview content ready:", isReady);
  };

  return (
    <div ref={containerRef} className="contract-preview print-container" data-testid="print-container">
      <PrintButton 
        language={language} 
        contractData={contractData} 
        contractId={contractData.id || "default"}
      />

      <div className="a4-page">
        {/* Letterhead background */}
        {contractData.letterhead && (
          <img
            src={contractData.letterhead}
            alt="Letterhead"
            className="letterhead-background"
          />
        )}
        
        <div className="contract-content">
          {/* Reference number */}
          <ReferenceNumber refNumber={contractData.refNumber} />

          {/* ID Photo */}
          <PromoterPhoto photoUrl={contractData.promoterPhoto} />

          {/* Contract Title */}
          <ContractTitle language={language} />

          {/* Two Column Layout - English and Arabic sides */}
          <div className="two-column-layout">
            {/* Left Column - English */}
            {language === "en" ? (
              <>
                <EnglishContractColumn contractData={contractData} />
                <ArabicContractColumn contractData={contractData} />
              </>
            ) : (
              <>
                <ArabicContractColumn contractData={contractData} />
                <EnglishContractColumn contractData={contractData} />
              </>
            )}
          </div>

          {/* Signature Area */}
          <SignatureArea signatures={signatures} />
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
