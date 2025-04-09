
import React from 'react';

interface ContractPageProps {
  contractData: any;
  children: React.ReactNode;
}

const ContractPage: React.FC<ContractPageProps> = ({ contractData, children }) => {
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
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        background: 'white'
      }}
    >
      {/* Letterhead background */}
      {contractData.letterhead && (
        <img
          src={contractData.letterhead}
          alt="Letterhead"
          className="letterhead-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
            opacity: 0.8,
            margin: 0,
            padding: 0,
            border: 'none'
          }}
        />
      )}
      
      <div 
        className="contract-content" 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          padding: '10mm', 
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
