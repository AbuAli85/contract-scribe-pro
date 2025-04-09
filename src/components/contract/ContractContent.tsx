
import React, { useEffect } from 'react';
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

  // Use our custom hook to detect nesting and prevent duplicate print content
  const { containerRef, isNested } = useNestedPrintContainer();
  
  // Force visibility of content after mounting
  useEffect(() => {
    console.log("ContractContent mounted with data:", contractData);
    
    if (!isNested && containerRef.current) {
      // Force visibility on critical elements
      const forceVisible = (selector: string, display: string = 'block') => {
        const elements = containerRef.current?.querySelectorAll(selector);
        elements?.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = display;
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
      };
      
      setTimeout(() => {
        forceVisible('.contract-column');
        forceVisible('.two-column-layout', 'flex');
        forceVisible('.reference-section');
        forceVisible('.contract-title-area');
        forceVisible('.signature-area');
        forceVisible('.id-photo-container');
        console.log("Forced visibility on contract content elements");
      }, 100);
    }
  }, [isNested, contractData]);
  
  // Return simplified content if nested to prevent duplication
  if (isNested) {
    return (
      <div 
        ref={containerRef}
        className="print-nested-container" 
        data-testid="nested-contract-content"
      >
        {/* Simplified content for UI display only */}
        <div className="nested-content-notice p-4 bg-gray-50 rounded border border-gray-200 mb-4 print:hidden">
          <p className="text-sm text-gray-600">
            {language === "ar" 
              ? "هذا محتوى متداخل. سيتم عرضه في واجهة المستخدم ولكن لن يتم طباعته لتجنب التكرار."
              : "This is nested content. It will be shown in the UI but won't be printed to avoid duplication."}
          </p>
        </div>
        
        {/* Minimal content for UI only */}
        <div className="contract-title-area mb-4">
          <ContractTitle language={language} />
        </div>
        
        {/* Show a simplified reference number */}
        <div className="p-2 bg-gray-50 rounded mb-4">
          <ReferenceNumber refNumber={contractData.refNumber} />
        </div>
        
        {/* Show contract data for UI purposes */}
        <div className="grid grid-cols-2 gap-4 print:hidden">
          <div>
            <h3 className="text-sm font-medium mb-2">{language === "ar" ? "المحتوى العربي" : "English Content"}</h3>
            <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
              {language === "ar" 
                ? "المحتوى العربي سيظهر في النسخة المطبوعة الأصلية فقط"
                : "English content will appear in the original printed version only"}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">{language === "ar" ? "المحتوى الإنجليزي" : "Arabic Content"}</h3>
            <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
              {language === "ar" 
                ? "المحتوى الإنجليزي سيظهر في النسخة المطبوعة الأصلية فقط"
                : "Arabic content will appear in the original printed version only"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not nested, return full content with all elements
  return (
    <div 
      ref={containerRef}
      className="contract-content print-section"
      data-testid="contract-content"
      style={{position: 'relative', zIndex: 10, width: '100%', height: '100%'}}
    >
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="print:hidden bg-blue-50 text-xs p-2 mb-2 rounded">
          Content loaded. RefNumber: {contractData.refNumber}
        </div>
      )}
      
      {/* Letterhead background - if available */}
      {contractData.letterhead && (
        <div 
          className="letterhead-background print-background" 
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
      <div className="reference-section print-section">
        <ReferenceNumber refNumber={contractData.refNumber} />
      </div>

      {/* Contract Title (positioned at 2.8cm from top) */}
      <div className="contract-title-area print-section">
        <ContractTitle language={language} />
      </div>

      {/* ID Photo (positioned at 3.2cm from top) */}
      {contractData.promoterPhoto && (
        <div className="id-photo-container print-section">
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
      <div className="two-column-layout print-section">
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
      <div className="signature-area print-section">
        <SignatureArea signatures={signatures} />
      </div>
      
      {/* Footer information */}
      <div className="bottom-info print-section">
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
