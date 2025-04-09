
import React from 'react';

interface ReferenceNumberProps {
  refNumber?: string;
}

const ReferenceNumber = ({ refNumber }: ReferenceNumberProps) => {
  // Format reference number to match PAC-YYYYMMDD-XXXX format
  const formattedRefNumber = () => {
    if (!refNumber) return "PAC-20250409-9940";

    // Extract date parts from the existing reference number
    const parts = refNumber.split("-");
    if (parts.length >= 2) {
      const datePart = parts[1];
      const randomPart = parts[2] ? parts[2].padStart(4, "0") : "9940";
      return `PAC-${datePart}-${randomPart}`;
    }

    return `PAC-${refNumber}`;
  };

  return (
    <div className="reference-section">
      <div className="reference-number">
        Reference Number: <span className="font-bold">{formattedRefNumber()}</span>
      </div>
    </div>
  );
};

export default ReferenceNumber;
