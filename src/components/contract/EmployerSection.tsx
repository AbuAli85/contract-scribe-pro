
import React from "react";
import BilingualInput from "./BilingualInput";
import ContractFormSection from "@/components/contract/ContractFormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";

interface Employer {
  nameEn: string;
  nameAr: string;
  crn: string;
}

interface EmployerSectionProps {
  employer: Employer;
  language: "ar" | "en";
  onChange: (field: string, value: string) => void;
  options?: Array<{ value: string, label: string }>;
}

const EmployerSection: React.FC<EmployerSectionProps> = ({
  employer,
  language,
  onChange,
  options = []
}) => {
  const handleNameEnChange = (value: string) => onChange("employer.nameEn", value);
  const handleNameArChange = (value: string) => onChange("employer.nameAr", value);
  const handleCrnChange = (value: string) => onChange("employer.crn", value);
  
  const handleSelectChange = (value: string) => {
    try {
      const selectedEmployer = JSON.parse(value);
      onChange("employer.nameEn", selectedEmployer.nameEn);
      onChange("employer.nameAr", selectedEmployer.nameAr);
      onChange("employer.crn", selectedEmployer.crn || "");
    } catch (error) {
      console.error("Error parsing selected employer:", error);
    }
  };

  return (
    <ContractFormSection 
      title={language === "ar" ? "المشغل" : "Employer"}
    >
      {options.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "اختر من القائمة:" : "Select from list:"}
          </label>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر المشغل" : "Select Employer"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <BilingualInput
        englishValue={employer.nameEn}
        arabicValue={employer.nameAr}
        englishLabel={language === "ar" ? "اسم المشغل (بالإنجليزية)" : "Employer Name (English)"}
        arabicLabel={language === "ar" ? "اسم المشغل (بالعربية)" : "Employer Name (Arabic)"}
        onEnglishChange={handleNameEnChange}
        onArabicChange={handleNameArChange}
        currentLanguage={language}
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {language === "ar" ? "رقم السجل التجاري للمشغل" : "Employer Commercial Registration"}
        </label>
        <input
          type="text"
          value={employer.crn}
          onChange={(e) => handleCrnChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
    </ContractFormSection>
  );
};

export default EmployerSection;
