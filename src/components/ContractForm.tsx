
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { generateUniqueId } from "@/lib/utils";
import { BilingualText } from "@/lib/types";

interface ContractFormProps {
  language: "ar" | "en";
  onGenerateContract: (contractData: any) => void;
}

// Define BilingualObject type for reuse
type BilingualObject = {
  en: string;
  ar: string;
};

// Define specific property structures
interface FirstParty {
  name: BilingualObject;
  crn: BilingualObject;
}

interface SecondParty {
  name: BilingualObject;
  nationality: BilingualObject;
  idNumber: string;
}

interface FormData {
  firstParty: FirstParty;
  secondParty: SecondParty;
  refNumber: string;
  startDate: string;
  endDate: string;
  documentType: string;
}

const ContractForm: React.FC<ContractFormProps> = ({ language, onGenerateContract }) => {
  const [formData, setFormData] = useState<FormData>({
    firstParty: {
      name: {
        en: "Falcon Eye Security Systems",
        ar: "أنظمة فالكون آي للأمن"
      },
      crn: {
        en: "1234567",
        ar: "١٢٣٤٥٦٧"
      }
    },
    secondParty: {
      name: {
        en: "",
        ar: ""
      },
      nationality: {
        en: "Omani",
        ar: "عماني"
      },
      idNumber: "",
    },
    refNumber: `REF-${generateUniqueId().substring(0, 8)}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    documentType: "id",
  });

  const handleInputChange = (field: string, value: string) => {
    const parts = field.split('.');
    
    if (parts.length === 1) {
      // Handle top-level fields like refNumber, startDate, etc.
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (parts.length === 2) {
      // Handle second-level fields like secondParty.idNumber
      const [part0, part1] = parts;
      
      if (part0 === 'firstParty' || part0 === 'secondParty') {
        setFormData(prev => {
          const newState = { ...prev };
          const firstLevelCopy = { ...prev[part0 as keyof FormData] };
          
          if (typeof firstLevelCopy[part1 as keyof typeof firstLevelCopy] === 'string') {
            // @ts-ignore - We know this is safe within our controlled data structure
            firstLevelCopy[part1] = value;
          }
          
          // @ts-ignore - Type safety is maintained by our controlled structure
          newState[part0] = firstLevelCopy;
          return newState;
        });
      }
    } else if (parts.length === 3) {
      // Handle third-level fields like firstParty.name.en
      const [part0, part1, part2] = parts;
      
      if ((part0 === 'firstParty' || part0 === 'secondParty') && 
          (part1 === 'name' || part1 === 'crn' || part1 === 'nationality')) {
        
        setFormData(prev => {
          // Create a deep copy to avoid mutation
          const newState = { ...prev };
          
          if (part0 === 'firstParty') {
            const firstPartyCopy = { ...prev.firstParty };
            
            if (part1 === 'name' || part1 === 'crn') {
              const fieldCopy = { ...firstPartyCopy[part1] };
              fieldCopy[part2 as keyof BilingualObject] = value;
              firstPartyCopy[part1] = fieldCopy;
            }
            
            newState.firstParty = firstPartyCopy;
          } else if (part0 === 'secondParty') {
            const secondPartyCopy = { ...prev.secondParty };
            
            if (part1 === 'name' || part1 === 'nationality') {
              const fieldCopy = { ...secondPartyCopy[part1] };
              fieldCopy[part2 as keyof BilingualObject] = value;
              secondPartyCopy[part1] = fieldCopy;
            }
            
            newState.secondParty = secondPartyCopy;
          }
          
          return newState;
        });
      }
    }
  };

  const handleGenerateContract = () => {
    const mockContractData = {
      ...formData,
      responsibilities: {
        en: "1. Promote products and services\n2. Attend meetings and trainings\n3. Follow company policies and procedures\n4. Report any issues to management",
        ar: "١. الترويج للمنتجات والخدمات\n٢. حضور الاجتماعات والتدريبات\n٣. اتباع سياسات وإجراءات الشركة\n٤. الإبلاغ عن أي مشاكل للإدارة"
      },
      agreement: {
        en: "This agreement is between the First Party and the Second Party for the provision of promotion services.",
        ar: "هذه الاتفاقية بين الطرف الأول والطرف الثاني لتقديم خدمات الترويج."
      },
      status: "active",
      letterhead: "https://via.placeholder.com/1000x1400/ffffff/ffffff?text=",
      promoterPhoto: "https://via.placeholder.com/400x300/eeeeee/999999?text=ID+Document"
    };
    
    console.log("Generated contract data:", mockContractData);
    onGenerateContract(mockContractData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">
              {language === "ar" ? "الطرف الأول (الشركة)" : "First Party (Company)"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "اسم الشركة (بالإنجليزية)" : "Company Name (English)"}
                </label>
                <Input
                  value={formData.firstParty.name.en}
                  onChange={(e) => handleInputChange("firstParty.name.en", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "اسم الشركة (بالعربية)" : "Company Name (Arabic)"}
                </label>
                <Input
                  value={formData.firstParty.name.ar}
                  onChange={(e) => handleInputChange("firstParty.name.ar", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "رقم السجل التجاري (بالإنجليزية)" : "Commercial Registration (English)"}
                </label>
                <Input
                  value={formData.firstParty.crn.en}
                  onChange={(e) => handleInputChange("firstParty.crn.en", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "رقم السجل التجاري (بالعربية)" : "Commercial Registration (Arabic)"}
                </label>
                <Input
                  value={formData.firstParty.crn.ar}
                  onChange={(e) => handleInputChange("firstParty.crn.ar", e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
          
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">
              {language === "ar" ? "الطرف الثاني (المروج)" : "Second Party (Promoter)"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "الاسم (بالإنجليزية)" : "Name (English)"}
                </label>
                <Input
                  value={formData.secondParty.name.en}
                  onChange={(e) => handleInputChange("secondParty.name.en", e.target.value)}
                  placeholder={language === "ar" ? "أدخل الاسم بالإنجليزية" : "Enter name in English"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "الاسم (بالعربية)" : "Name (Arabic)"}
                </label>
                <Input
                  value={formData.secondParty.name.ar}
                  onChange={(e) => handleInputChange("secondParty.name.ar", e.target.value)}
                  placeholder={language === "ar" ? "أدخل الاسم بالعربية" : "Enter name in Arabic"}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "رقم الهوية" : "ID Number"}
                </label>
                <Input
                  value={formData.secondParty.idNumber}
                  onChange={(e) => handleInputChange("secondParty.idNumber", e.target.value)}
                  placeholder={language === "ar" ? "أدخل رقم الهوية" : "Enter ID number"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "نوع الوثيقة" : "Document Type"}
                </label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => handleInputChange("documentType", value)}
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
          </div>
          
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">
              {language === "ar" ? "تفاصيل العقد" : "Contract Details"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "رقم المرجع" : "Reference Number"}
                </label>
                <Input
                  value={formData.refNumber}
                  onChange={(e) => handleInputChange("refNumber", e.target.value)}
                  placeholder={language === "ar" ? "مثال: REF-12345" : "e.g. REF-12345"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "تاريخ البدء" : "Start Date"}
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "ar" ? "تاريخ الانتهاء" : "End Date"}
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateContract}
            className="w-full flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {language === "ar" ? "إنشاء العقد" : "Generate Contract"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractForm;
