
import React from 'react';
import PrintButton from './PrintButton';
import DownloadPDFButton from './DownloadPDFButton';

interface ContractActionsProps {
  language: "ar" | "en";
  contractData: any;
}

const ContractActions: React.FC<ContractActionsProps> = ({ language, contractData }) => {
  const contractId = contractData?.id || "default";
  
  return (
    <div className="flex gap-2 mb-6 print:hidden">
      <PrintButton 
        language={language} 
        contractData={contractData} 
        contractId={contractId}
      />
      <DownloadPDFButton
        language={language}
        contractData={contractData}
        contractId={contractId}
        variant="outline"
        includePassport={true}
      />
    </div>
  );
};

export default ContractActions;
