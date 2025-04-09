
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { generateUniqueId } from "@/lib/utils";
import { FirstPartySection, SecondPartySection, ContractDetailsSection } from "@/components/contract";

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
          // Type assertion to ensure TypeScript knows this is an object
          const firstLevelCopy = { ...(prev[part0 as keyof FormData] as object) };
          
          if (part0 === 'secondParty' && part1 === 'idNumber') {
            // Handle the special case for idNumber which is a string
            const secondPartyCopy = firstLevelCopy as SecondParty;
            secondPartyCopy.idNumber = value;
            newState.secondParty = secondPartyCopy;
          }
          
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
          <FirstPartySection
            firstParty={formData.firstParty}
            language={language}
            onChange={handleInputChange}
          />
          
          <SecondPartySection
            secondParty={formData.secondParty}
            documentType={formData.documentType}
            language={language}
            onChange={handleInputChange}
          />
          
          <ContractDetailsSection
            refNumber={formData.refNumber}
            startDate={formData.startDate}
            endDate={formData.endDate}
            language={language}
            onChange={handleInputChange}
          />
          
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
