
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
      {/* Reference number - positioned below the letterhead */}
      <ReferenceNumber refNumber={contractData.refNumber} />

      {/* Contract Title - Main title of document */}
      <h1 className="contract-main-title text-2xl font-bold text-center text-blue-700 mb-5">
        {language === "en" ? "Promoter Assignment Contract" : "عقد تعيين مروّج"}
      </h1>

      {/* ID Photo - Properly centered on page with improved sizing */}
      {contractData.promoterPhoto && (
        <PromoterPhoto 
          photoUrl={contractData.promoterPhoto} 
          type={contractData.documentType || 'id'} 
          label={contractData.documentType === 'passport' ? 'Passport / جواز السفر' : 'ID Card / بطاقة الهوية'}
        />
      )}

      {/* Two Column Layout - English and Arabic sides with proper spacing */}
      <div className="two-column-layout flex justify-between gap-6 mb-6">
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

      {/* Enhanced Signature Area with better positioning */}
      <SignatureArea signatures={signatures} />
      
      {/* Footer information with company details */}
      <div className="bottom-info mt-6 pt-3 border-t border-gray-200 flex justify-between">
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
