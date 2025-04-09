
import React from "react";
import BilingualInput from "./BilingualInput";
import ContractFormSection from "@/components/contract/ContractFormSection";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SecondParty {
  name: {
    en: string;
    ar: string;
  };
  nationality: {
    en: string;
    ar: string;
  };
  idNumber: string;
}

interface SecondPartySectionProps {
  secondParty: SecondParty;
  documentType: string;
  language: "ar" | "en";
  onChange: (field: string, value: string) => void;
}

const SecondPartySection: React.FC<SecondPartySectionProps> = ({
  secondParty,
  documentType,
  language,
  onChange
}) => {
  const handleNameEnChange = (value: string) => onChange("secondParty.name.en", value);
  const handleNameArChange = (value: string) => onChange("secondParty.name.ar", value);
  const handleIdNumberChange = (value: string) => onChange("secondParty.idNumber", value);
  const handleDocumentTypeChange = (value: string) => onChange("documentType", value);

  return (
    <ContractFormSection 
      title={language === "ar" ? "الطرف الثاني (المروج)" : "Second Party (Promoter)"}
    >
      <BilingualInput
        englishValue={secondParty.name.en}
        arabicValue={secondParty.name.ar}
        englishLabel={language === "ar" ? "الاسم (بالإنجليزية)" : "Name (English)"}
        arabicLabel={language === "ar" ? "الاسم (بالعربية)" : "Name (Arabic)"}
        englishPlaceholder={language === "ar" ? "أدخل الاسم بالإنجليزية" : "Enter name in English"}
        arabicPlaceholder={language === "ar" ? "أدخل الاسم بالعربية" : "Enter name in Arabic"}
        onEnglishChange={handleNameEnChange}
        onArabicChange={handleNameArChange}
        currentLanguage={language}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "رقم الهوية" : "ID Number"}
          </label>
          <Input
            value={secondParty.idNumber}
            onChange={(e) => handleIdNumberChange(e.target.value)}
            placeholder={language === "ar" ? "أدخل رقم الهوية" : "Enter ID number"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "نوع الوثيقة" : "Document Type"}
          </label>
          <Select
            value={documentType}
            onValueChange={handleDocumentTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === "ar" ? "اختر نوع الوثيقة" : "Select document type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">{language === "ar" ? "بطاقة هوية" : "ID Card"}</SelectItem>
              <SelectItem value="passport">{language === "ar" ? "جواز سفر" : "Passport"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ContractFormSection>
  );
};

export default SecondPartySection;
