
import React from "react";
import BilingualInput from "./BilingualInput";
import ContractFormSection from "@/components/contract/ContractFormSection";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, UserCheck } from "lucide-react";

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
  promoterOptions?: Array<{ value: string, label: string }>;
  employerOptions?: Array<{ value: string, label: string }>;
}

const SecondPartySection: React.FC<SecondPartySectionProps> = ({
  secondParty,
  documentType,
  language,
  onChange,
  promoterOptions = [],
  employerOptions = []
}) => {
  const handleNameEnChange = (value: string) => onChange("secondParty.name.en", value);
  const handleNameArChange = (value: string) => onChange("secondParty.name.ar", value);
  const handleIdNumberChange = (value: string) => onChange("secondParty.idNumber", value);
  const handleDocumentTypeChange = (value: string) => onChange("documentType", value);
  
  const handlePromoterSelectChange = (value: string) => {
    try {
      const selectedPromoter = JSON.parse(value);
      onChange("secondParty.name.en", selectedPromoter.nameEn);
      onChange("secondParty.name.ar", selectedPromoter.nameAr);
      onChange("secondParty.idNumber", selectedPromoter.id);
      
      if (selectedPromoter.nationality) {
        onChange("secondParty.nationality.en", selectedPromoter.nationality.en);
        onChange("secondParty.nationality.ar", selectedPromoter.nationality.ar);
      }
    } catch (error) {
      console.error("Error parsing selected promoter:", error);
    }
  };
  
  const handleEmployerSelectChange = (value: string) => {
    try {
      const selectedEmployer = JSON.parse(value);
      onChange("employer.nameEn", selectedEmployer.nameEn);
      onChange("employer.nameAr", selectedEmployer.nameAr);
      onChange("employer.crn", selectedEmployer.crn);
    } catch (error) {
      console.error("Error parsing selected employer:", error);
    }
  };

  return (
    <ContractFormSection 
      title={language === "ar" ? "الطرف الثاني (المروج)" : "Second Party (Promoter)"}
    >
      {promoterOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "اختر المروج:" : "Select Promoter:"}
          </label>
          <Select onValueChange={handlePromoterSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر المروج" : "Select Promoter"} />
            </SelectTrigger>
            <SelectContent>
              {promoterOptions.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {employerOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "اختر المشغل:" : "Select Employer:"}
          </label>
          <Select onValueChange={handleEmployerSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر المشغل" : "Select Employer"} />
            </SelectTrigger>
            <SelectContent>
              {employerOptions.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
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
