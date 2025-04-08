
import { useEffect } from "react";
import PrintButton from "./contract/PrintButton";
import ReferenceNumber from "./contract/ReferenceNumber";
import PromoterPhoto from "./contract/PromoterPhoto";
import ContractTitle from "./contract/ContractTitle";
import EnglishContractColumn from "./contract/EnglishContractColumn";
import ArabicContractColumn from "./contract/ArabicContractColumn";
import SignatureArea from "./contract/SignatureArea";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractPreview = ({ language, contractData, signatures = [] }: ContractPreviewProps) => {
  // Debug useEffect to check visibility issues
  useEffect(() => {
    if (contractData) {
      console.log("Contract preview rendering with data:", contractData);
      
      // Check visibility of key elements after render
      setTimeout(() => {
        const contractPreview = document.querySelector('.contract-preview');
        const contractContent = document.querySelector('.contract-content');
        const contractText = document.querySelectorAll('.contract-text');
        
        console.log("ContractPreview visibility:", contractPreview ? 
          `display: ${window.getComputedStyle(contractPreview).display}, ` +
          `visibility: ${window.getComputedStyle(contractPreview).visibility}` : 'Not found');
        
        console.log("ContractContent visibility:", contractContent ? 
          `display: ${window.getComputedStyle(contractContent).display}, ` +
          `visibility: ${window.getComputedStyle(contractContent).visibility}` : 'Not found');
        
        console.log(`Found ${contractText.length} contract-text elements`);
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
    <div className="contract-preview print-container">
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
