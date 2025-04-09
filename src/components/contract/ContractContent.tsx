
import React from 'react';
import ReferenceNumber from "./ReferenceNumber";
import PromoterPhoto from "./PromoterPhoto";
import ContractTitle from "./ContractTitle";
import EnglishContractColumn from "./EnglishContractColumn";
import ArabicContractColumn from "./ArabicContractColumn";
import SignatureArea from "./SignatureArea";
import { useNestedPrintContainer } from '@/hooks/useNestedPrintContainer';

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

  // Use our custom hook to detect nesting
  const { isNested } = useNestedPrintContainer();
  
  // If nested, return null to prevent duplication
  if (isNested) {
    console.warn('Warning: Nested contract content detected. Returning null to prevent duplication.');
    return null;
  }

  return (
    <div className="contract-content">
      {/* Letterhead background - if available */}
      {contractData.letterhead && (
        <div 
          className="letterhead-background" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('${contractData.letterhead}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.05,
            zIndex: 1
          }}
        />
      )}

      {/* Reference number at top-left (positioned at 2.5cm from top) */}
      <div className="reference-section">
        <ReferenceNumber refNumber={contractData.refNumber} />
      </div>

      {/* Contract Title (positioned at 2.8cm from top) */}
      <div className="contract-title-area">
        <ContractTitle language={language} />
      </div>

      {/* ID Photo (positioned at 3.2cm from top) */}
      {contractData.promoterPhoto && (
        <div className="id-photo-container">
          <div className="id-photo-wrapper">
            <PromoterPhoto 
              photoUrl={contractData.promoterPhoto} 
              type={documentType}
              label={documentLabel}
            />
          </div>
        </div>
      )}

      {/* Two Column Layout - contract content (positioned at 3.5cm from top) */}
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

      {/* Signature Area below content */}
      <div className="signature-area">
        <SignatureArea signatures={signatures} />
      </div>
      
      {/* Footer information */}
      <div className="bottom-info">
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
    </div>
  );
};

export default ContractContent;
