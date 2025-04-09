
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
  // Determine document type for label
  const documentType = contractData.documentType || 'id';
  const documentLabel = documentType === 'passport' ? 'Passport / جواز السفر' : 'ID Card / بطاقة الهوية';

  return (
    <>
      {/* Reference number at top with specified positioning (2.5cm from top, left side) */}
      <ReferenceNumber refNumber={contractData.refNumber} />

      {/* Contract Title (2.8cm from top, centered) */}
      <ContractTitle language={language} />

      {/* ID Photo centered (3.2cm from top, width 400px) */}
      {contractData.promoterPhoto && (
        <PromoterPhoto 
          photoUrl={contractData.promoterPhoto} 
          type={documentType}
          label={documentLabel}
        />
      )}

      {/* Two Column Layout - contract content (3.5cm from top) */}
      <div className="two-column-layout flex justify-between gap-6 mb-2">
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

      {/* Signature Area below content */}
      <SignatureArea signatures={signatures} />
      
      {/* Footer information with reduced top margin */}
      <div className="bottom-info mt-3 pt-2 border-t border-gray-200 flex justify-between text-xs">
        <div className="company-info text-xs text-gray-600">
          <div className="cr-info">
            <div className="cr-number mb-1 font-mono">CR: {contractData?.firstParty?.crn?.en || "1410869"}</div>
            <div>PO Box 762, PC-122 Al Khuwair, Bousher, Sultanate of Oman</div>
          </div>
        </div>
        <div className="contact-info text-xs text-gray-600 text-right">
          <div>+968 9194 3449 / +968 9933 6958</div>
          <div>www.falconeyegroup.net</div>
        </div>
      </div>
    </>
  );
};

export default ContractContent;
