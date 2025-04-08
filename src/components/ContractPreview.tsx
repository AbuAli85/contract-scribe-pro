
import { useEffect, useRef } from "react";
import PrintButton from "./contract/PrintButton";
import ReferenceNumber from "./contract/ReferenceNumber";
import PromoterPhoto from "./contract/PromoterPhoto";
import ContractTitle from "./contract/ContractTitle";
import EnglishContractColumn from "./contract/EnglishContractColumn";
import ArabicContractColumn from "./contract/ArabicContractColumn";
import SignatureArea from "./contract/SignatureArea";
import { contractService } from "@/services/contract.service";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractPreview = ({ language, contractData, signatures = [] }: ContractPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Effect to ensure visibility and fix common rendering issues
  useEffect(() => {
    if (!contractData) return;
    
    // Debug and fix visibility issues
    setTimeout(() => {
      if (!previewRef.current) return;
      
      const contractPreview = previewRef.current;
      const contractContent = contractPreview.querySelector('.contract-content');
      const contractText = contractPreview.querySelectorAll('.contract-text');
      const twoColumnLayout = contractPreview.querySelector('.two-column-layout');
      
      console.log("ContractPreview visibility check:", {
        previewDisplay: contractPreview ? window.getComputedStyle(contractPreview).display : 'element not found',
        previewVisibility: contractPreview ? window.getComputedStyle(contractPreview).visibility : 'element not found',
        contentDisplay: contractContent ? window.getComputedStyle(contractContent).display : 'element not found',
        textElementsCount: contractText.length,
        twoColumnDisplay: twoColumnLayout ? window.getComputedStyle(twoColumnLayout).display : 'element not found'
      });
      
      // Fix visibility issues proactively
      if (contractPreview) {
        contractPreview.style.display = 'block';
        contractPreview.style.visibility = 'visible';
      }
      
      if (contractContent instanceof HTMLElement) {
        contractContent.style.display = 'block';
        contractContent.style.visibility = 'visible';
      }
      
      if (twoColumnLayout instanceof HTMLElement) {
        twoColumnLayout.style.display = 'flex';
        twoColumnLayout.style.visibility = 'visible';
      }
      
      // Make sure text elements are visible
      contractText.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'block';
          el.style.visibility = 'visible';
        }
      });
    }, 500);
  }, [contractData]);

  // Additional effect to validate printability
  useEffect(() => {
    if (contractData) {
      setTimeout(() => {
        const isPrintable = contractService.validatePrintability();
        console.log("Contract printability check:", isPrintable);
      }, 1000);
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
    <div ref={previewRef} className="contract-preview print-container">
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
