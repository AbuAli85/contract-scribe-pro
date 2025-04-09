
import React from 'react';

interface ReferenceNumberProps {
  refNumber?: string;
}

const ReferenceNumber = ({ refNumber }: ReferenceNumberProps) => {
  // Format reference number to match PAC-YYYYMMDD-XXXX format
  const formattedRefNumber = () => {
    if (!refNumber) return "PAC-20250409-6996";

    // Extract date parts from the existing reference number
    const parts = refNumber.split("-");
    if (parts.length >= 2) {
      const datePart = parts[1];
      const randomPart = parts[2] ? parts[2].padStart(4, "0") : "6996";
      return `PAC-${datePart}-${randomPart}`;
    }

    return `PAC-${refNumber}`;
  };

  return (
    <div className="reference-section mt-6 mb-5">
      <div className="reference-number font-mono text-gray-700 text-sm">
        <span className="font-bold">Reference Number:</span> {formattedRefNumber()}
      </div>
    </div>
  );
};

export default ReferenceNumber;
