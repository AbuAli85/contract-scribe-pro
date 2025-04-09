
import React from "react";
import { ContractFormSection } from "@/components/contract/ContractFormSection";
import { Input } from "@/components/ui/input";

interface ContractDetailsProps {
  refNumber: string;
  startDate: string;
  endDate: string;
  language: "ar" | "en";
  onChange: (field: string, value: string) => void;
}

const ContractDetailsSection: React.FC<ContractDetailsProps> = ({
  refNumber,
  startDate,
  endDate,
  language,
  onChange
}) => {
  const handleRefNumberChange = (value: string) => onChange("refNumber", value);
  const handleStartDateChange = (value: string) => onChange("startDate", value);
  const handleEndDateChange = (value: string) => onChange("endDate", value);

  return (
    <ContractFormSection 
      title={language === "ar" ? "تفاصيل العقد" : "Contract Details"}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "رقم المرجع" : "Reference Number"}
          </label>
          <Input
            value={refNumber}
            onChange={(e) => handleRefNumberChange(e.target.value)}
            placeholder={language === "ar" ? "مثال: REF-12345" : "e.g. REF-12345"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "تاريخ البدء" : "Start Date"}
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "تاريخ الانتهاء" : "End Date"}
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
          />
        </div>
      </div>
    </ContractFormSection>
  );
};

export default ContractDetailsSection;
