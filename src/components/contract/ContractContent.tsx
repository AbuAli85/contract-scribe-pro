
import React from 'react';
import ReferenceNumber from "./ReferenceNumber";
import PromoterPhoto from "./PromoterPhoto";
import ContractTitle from "./ContractTitle";
import EnglishContractColumn from "./EnglishContractColumn";
import ArabicContractColumn from "./ArabicContractColumn";
import SignatureArea from "./SignatureArea";

interface ContractContentProps {
  language: "ar" | "en";
  contractData: any;
  signatures?: any[];
}

const ContractContent: React.FC<ContractContentProps> = ({ 
  language, 
  contractData, 
  signatures = [] 
}) => {
  return (
    <>
      {/* Reference number - with improved styling */}
      <ReferenceNumber refNumber={contractData.refNumber} />

      {/* Contract Title - Main title of document */}
      <h1 className="contract-main-title text-2xl font-bold text-center text-blue-600 mb-10">
        {language === "en" ? "Promoter Assignment Contract" : "عقد تعيين مروّج"}
      </h1>

      {/* ID Photo - Properly centered on page */}
      {contractData.promoterPhoto && (
        <PromoterPhoto photoUrl={contractData.promoterPhoto} />
      )}

      {/* Two Column Layout - English and Arabic sides with proper spacing */}
      <div className="two-column-layout flex justify-between gap-10 mb-12">
        {/* Columns order based on language */}
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
    </>
  );
};

export default ContractContent;
