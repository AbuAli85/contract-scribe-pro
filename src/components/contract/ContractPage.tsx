
import React from 'react';

interface ContractPageProps {
  contractData: any;
  children: React.ReactNode;
}

const ContractPage: React.FC<ContractPageProps> = ({ contractData, children }) => {
  // Generate a watermark if the contract is in draft status
  const isDraft = contractData.status === 'draft';
  
  return (
    <div 
      className="a4-page"
      style={{ 
        width: '210mm',
        height: '297mm',
        margin: '0 auto',
        padding: '0',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.15)',
        background: 'white'
      }}
    >
      {/* Letterhead background that spans full width */}
      {contractData.letterhead && (
        <div
          className="letterhead-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '40mm',
            backgroundImage: `url('${contractData.letterhead}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            opacity: 0.1,
            zIndex: 1
          }}
        />
      )}
      
      {/* Draft watermark if applicable */}
      {isDraft && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'rgba(220, 53, 69, 0.1)',
            zIndex: 5,
            pointerEvents: 'none',
            userSelect: 'none',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          {contractData.language === 'ar' ? 'مسودة' : 'DRAFT'}
        </div>
      )}
      
      <div 
        className="contract-content"
        style={{ 
          position: 'relative',
          zIndex: 10,
          padding: '42mm 20mm 20mm',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContractPage;
