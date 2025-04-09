
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
import DownloadPDFButton from "./contract/DownloadPDFButton";

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

  return (
    <div ref={containerRef} className="contract-preview print-container" data-testid="print-container">
      <div className="flex gap-2 mb-6 print:hidden">
        <PrintButton 
          language={language} 
          contractData={contractData} 
          contractId={contractData.id || "default"}
        />
        <DownloadPDFButton
          language={language}
          contractData={contractData}
          contractId={contractData.id || "default"}
          variant="outline"
          includePassport={true}
        />
      </div>

      <div className="a4-page" style={{ width: '210mm', height: '297mm', margin: '0', padding: '0', overflow: 'hidden', position: 'relative' }}>
        {/* Letterhead background - Full page coverage with proper positioning */}
        {contractData.letterhead && (
          <img
            src={contractData.letterhead}
            alt="Letterhead"
            className="letterhead-background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              opacity: 0.8,
              margin: 0,
              padding: 0,
              border: 'none'
            }}
          />
        )}
        
        <div className="contract-content" style={{ position: 'relative', zIndex: 10, padding: '10mm', width: '100%', height: '100%', boxSizing: 'border-box' }}>
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
