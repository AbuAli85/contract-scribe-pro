
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

      {/* ID Photo */}
      <PromoterPhoto photoUrl={contractData.promoterPhoto} />

      {/* Contract Title */}
      <ContractTitle language={language} />

      {/* Two Column Layout - English and Arabic sides */}
      <div 
        className="two-column-layout"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10mm'
        }}
      >
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
