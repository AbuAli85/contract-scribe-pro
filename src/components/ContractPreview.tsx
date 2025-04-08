
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
}

const ContractPreview = ({ language, contractData }: ContractPreviewProps) => {
  return (
    <div className="contract-preview">
      <PrintButton language={language} />

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
            <EnglishContractColumn contractData={contractData} />

            {/* Right Column - Arabic */}
            <ArabicContractColumn contractData={contractData} />
          </div>

          {/* Signature Area */}
          <SignatureArea />
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
