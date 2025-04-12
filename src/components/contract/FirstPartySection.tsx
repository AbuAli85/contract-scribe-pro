
import React from "react";
import BilingualInput from "./BilingualInput";
import ContractFormSection from "@/components/contract/ContractFormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building } from "lucide-react";

interface FirstParty {
  name: {
    en: string;
    ar: string;
  };
  crn: {
    en: string;
    ar: string;
  };
}

interface FirstPartySectionProps {
  firstParty: FirstParty;
  language: "ar" | "en";
  onChange: (field: string, value: string) => void;
  options?: Array<{ value: string, label: string }>;
}

const FirstPartySection: React.FC<FirstPartySectionProps> = ({
  firstParty,
  language,
  onChange,
  options = []
}) => {
  const handleNameEnChange = (value: string) => onChange("firstParty.name.en", value);
  const handleNameArChange = (value: string) => onChange("firstParty.name.ar", value);
  const handleCrnEnChange = (value: string) => onChange("firstParty.crn.en", value);
  const handleCrnArChange = (value: string) => onChange("firstParty.crn.ar", value);
  
  const handleSelectChange = (value: string) => {
    try {
      const selectedParty = JSON.parse(value);
      onChange("firstParty.name.en", selectedParty.nameEn);
      onChange("firstParty.name.ar", selectedParty.nameAr);
      onChange("firstParty.crn.en", selectedParty.crn);
      onChange("firstParty.crn.ar", selectedParty.crn); // Using the same CRN for both languages
    } catch (error) {
      console.error("Error parsing selected party:", error);
    }
  };

  return (
    <ContractFormSection 
      title={language === "ar" ? "الطرف الأول (الشركة)" : "First Party (Company)"}
    >
      {options.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "اختر من القائمة:" : "Select from list:"}
          </label>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر الطرف الأول" : "Select First Party"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <BilingualInput
        englishValue={firstParty.name.en}
        arabicValue={firstParty.name.ar}
        englishLabel={language === "ar" ? "اسم الشركة (بالإنجليزية)" : "Company Name (English)"}
        arabicLabel={language === "ar" ? "اسم الشركة (بالعربية)" : "Company Name (Arabic)"}
        onEnglishChange={handleNameEnChange}
        onArabicChange={handleNameArChange}
        currentLanguage={language}
      />
      
      <BilingualInput
        englishValue={firstParty.crn.en}
        arabicValue={firstParty.crn.ar}
        englishLabel={language === "ar" ? "رقم السجل التجاري (بالإنجليزية)" : "Commercial Registration (English)"}
        arabicLabel={language === "ar" ? "رقم السجل التجاري (بالعربية)" : "Commercial Registration (Arabic)"}
        onEnglishChange={handleCrnEnChange}
        onArabicChange={handleCrnArChange}
        currentLanguage={language}
      />
    </ContractFormSection>
  );
};

export default FirstPartySection;
