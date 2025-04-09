
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
      {/* Reference number */}
      <ReferenceNumber refNumber={contractData.refNumber} />

      {/* Contract Title - Main title of document */}
      <h1 className="contract-main-title">
        {language === "en" ? "Promoter Assignment Contract" : "عقد تعيين مروّج"}
      </h1>

      {/* ID Photo - Centered on page */}
      {contractData.promoterPhoto && (
        <div className="flex justify-center mb-6">
          <PromoterPhoto photoUrl={contractData.promoterPhoto} />
        </div>
      )}

      {/* Two Column Layout - English and Arabic sides */}
      <div className="two-column-layout">
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
