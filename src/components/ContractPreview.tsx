
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
    const fixVisibilityIssues = () => {
      if (!previewRef.current) return;
      
      const contractPreview = previewRef.current;
      
      console.log("ContractPreview visibility check - element exists:", !!contractPreview);
      
      // Force visibility on all important elements
      if (contractPreview) {
        // Make the preview visible
        contractPreview.style.display = 'block';
        contractPreview.style.visibility = 'visible';
        
        // Force all children to be visible
        const elements = contractPreview.querySelectorAll('.contract-content, .two-column-layout, .contract-column, .contract-text, .promoter-details, .responsibilities, .contract-title, .best-regards');
        
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            const display = el.classList.contains('two-column-layout') ? 'flex' : 'block';
            el.style.display = display;
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            
            // Add border for debugging
            if (process.env.NODE_ENV === 'development') {
              el.style.border = '1px dashed rgba(0,0,255,0.2)';
            }
          }
        });
        
        // Special styling for two-column layout
        const twoColumnLayout = contractPreview.querySelector('.two-column-layout');
        if (twoColumnLayout instanceof HTMLElement) {
          twoColumnLayout.style.display = 'flex';
          twoColumnLayout.style.flexDirection = 'row';
          twoColumnLayout.style.justifyContent = 'space-between';
          twoColumnLayout.style.gap = '10mm';
        }
        
        console.log("Contract visibility fix applied");
      }
    };
    
    // First immediate fix
    fixVisibilityIssues();
    
    // Schedule another fix after rendering completes
    const timer = setTimeout(fixVisibilityIssues, 500);
    
    return () => clearTimeout(timer);
  }, [contractData]);

  // Validate printability on load and when data changes
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
