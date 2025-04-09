import React from "react";
import BilingualInput from "./BilingualInput";
import ContractFormSection from "@/components/contract/ContractFormSection";

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
}

const FirstPartySection: React.FC<FirstPartySectionProps> = ({
  firstParty,
  language,
  onChange
}) => {
  const handleNameEnChange = (value: string) => onChange("firstParty.name.en", value);
  const handleNameArChange = (value: string) => onChange("firstParty.name.ar", value);
  const handleCrnEnChange = (value: string) => onChange("firstParty.crn.en", value);
  const handleCrnArChange = (value: string) => onChange("firstParty.crn.ar", value);

  return (
    <ContractFormSection 
      title={language === "ar" ? "الطرف الأول (الشركة)" : "First Party (Company)"}
    >
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
