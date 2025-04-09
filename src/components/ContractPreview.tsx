
import { useEffect, useState, useRef } from "react";
import PrintButton from "./contract/PrintButton";
import ReferenceNumber from "./contract/ReferenceNumber";
import PromoterPhoto from "./contract/PromoterPhoto";
import ContractTitle from "./contract/ContractTitle";
import EnglishContractColumn from "./contract/EnglishContractColumn";
import ArabicContractColumn from "./contract/ArabicContractColumn";
import SignatureArea from "./contract/SignatureArea";
import { contractService } from "@/services/contract.service";
import { setupPrintContainer } from "@/utils/print-container";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractPreview = ({ language, contractData, signatures = [] }: ContractPreviewProps) => {
  const [contentReady, setContentReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Force add print-container class on mount and when data changes
  useEffect(() => {
    if (contractData && containerRef.current) {
      // Explicitly add the print-container class
      containerRef.current.classList.add('print-container');
      
      // Add data-testid for easier targeting
      containerRef.current.setAttribute('data-testid', 'print-container');
      
      // Add inline critical print styles
      const style = document.createElement('style');
      style.setAttribute('media', 'print');
      style.textContent = `
        @media print {
          .print-container, .contract-preview, .a4-page, .contract-content {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .two-column-layout {
            display: flex !important;
          }
          @page { size: A4 portrait; margin: 0; }
        }
      `;
      document.head.appendChild(style);
      
      // Log for debug purposes
      console.log('Print container setup in ContractPreview:', !!containerRef.current);
      
      // Validate printability after a short delay to allow rendering
      setTimeout(() => {
        // Force setup print container
        setupPrintContainer();
        
        // Check if contract is printable
        const isPrintable = contractService.validatePrintability();
        console.log('Contract printability check:', isPrintable);
        
        // Set content ready to allow printing
        setContentReady(true);
        
        // Cleanup style after initialization
        document.head.removeChild(style);
      }, 500);
      
      return () => {
        try {
          document.head.removeChild(style);
        } catch (e) {
          // Style might already be removed
        }
      };
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
