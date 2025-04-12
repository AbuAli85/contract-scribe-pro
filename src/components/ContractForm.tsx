
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { generateUniqueId } from "@/lib/utils";
import { FirstPartySection, SecondPartySection, ContractDetailsSection } from "@/components/contract";
import { useContractCreator } from "@/hooks/useContractCreator";
import { useToast } from "@/hooks/use-toast";

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

interface Employer {
  nameEn: string;
  nameAr: string;
  crn: string;
}

interface FormData {
  firstParty: FirstParty;
  secondParty: SecondParty;
  employer: Employer;
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
    employer: {
      nameEn: "",
      nameAr: "",
      crn: ""
    },
    refNumber: `REF-${generateUniqueId().substring(0, 8)}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    documentType: "id",
  });

  // State for Excel data options
  const [firstPartyOptions, setFirstPartyOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [secondPartyOptions, setSecondPartyOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [employerOptions, setEmployerOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [promoterOptions, setPromoterOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [productOptions, setProductOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ value: string, label: string }>>([]);

  const { options, handleExcelUpload, isLoading } = useContractCreator();
  const { toast } = useToast();

  // Update options when they change in the useContractCreator hook
  useEffect(() => {
    // Format options for dropdown components
    if (options.firstParties.length > 0) {
      const formattedOptions = options.firstParties.map(party => ({
        value: JSON.stringify(party),
        label: language === "ar" ? party.nameAr : party.nameEn
      }));
      setFirstPartyOptions(formattedOptions);
    }

    if (options.secondParties.length > 0) {
      const formattedOptions = options.secondParties.map(party => ({
        value: JSON.stringify(party),
        label: language === "ar" ? party.nameAr : party.nameEn
      }));
      setSecondPartyOptions(formattedOptions);
      setEmployerOptions(formattedOptions);
    }

    if (options.promoters.length > 0) {
      const formattedOptions = options.promoters.map(promoter => ({
        value: JSON.stringify(promoter),
        label: language === "ar" ? promoter.nameAr : promoter.nameEn
      }));
      setPromoterOptions(formattedOptions);
    }

    if (options.products.length > 0) {
      const formattedOptions = options.products.map(product => ({
        value: JSON.stringify(product),
        label: language === "ar" ? product.nameAr : product.nameEn
      }));
      setProductOptions(formattedOptions);
    }

    if (options.locations.length > 0) {
      const formattedOptions = options.locations.map(location => ({
        value: JSON.stringify(location),
        label: language === "ar" ? location.nameAr : location.nameEn
      }));
      setLocationOptions(formattedOptions);
    }
  }, [options, language]);

  const handleInputChange = (field: string, value: string) => {
    const parts = field.split('.');
    
    if (parts.length === 1) {
      // Handle top-level fields like refNumber, startDate, etc.
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (parts.length === 2) {
      // Handle second-level fields like secondParty.idNumber or employer fields
      const [part0, part1] = parts;
      
      if (part0 === 'firstParty' || part0 === 'secondParty' || part0 === 'employer') {
        setFormData(prev => {
          const newState = { ...prev };
          
          if (part0 === 'secondParty' && part1 === 'idNumber') {
            // Handle the special case for idNumber which is a string
            const secondPartyCopy = { ...prev.secondParty };
            secondPartyCopy.idNumber = value;
            newState.secondParty = secondPartyCopy;
          } else if (part0 === 'employer') {
            // Handle employer fields
            const employerCopy = { ...prev.employer };
            employerCopy[part1 as keyof Employer] = value;
            newState.employer = employerCopy;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleExcelUpload(e);
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
          {/* Excel Upload Section */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-3">
              {language === "ar" ? "تحميل بيانات من ملف إكسل" : "Import Data From Excel"}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="excelUpload"
                accept=".xlsx, .csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="excelUpload"
                className="cursor-pointer flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors text-primary px-4 py-2 rounded-md"
              >
                <Upload className="h-4 w-4" />
                {language === "ar" ? "اختر ملف اكسل" : "Choose Excel File"}
              </label>
              <span className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "قم بتحميل ملف يحتوي على بيانات العملاء، المشغلين، والمروجين" 
                  : "Upload a file containing clients, employers, and promoters data"}
              </span>
            </div>
            
            {isLoading && (
              <div className="mt-2 text-sm text-muted-foreground">
                {language === "ar" ? "جاري معالجة الملف..." : "Processing file..."}
              </div>
            )}
          </div>
          
          <FirstPartySection
            firstParty={formData.firstParty}
            language={language}
            onChange={handleInputChange}
            options={firstPartyOptions}
          />
          
          <SecondPartySection
            secondParty={formData.secondParty}
            documentType={formData.documentType}
            language={language}
            onChange={handleInputChange}
            promoterOptions={promoterOptions}
            employerOptions={employerOptions}
          />
          
          <ContractDetailsSection
            refNumber={formData.refNumber}
            startDate={formData.startDate}
            endDate={formData.endDate}
            language={language}
            onChange={handleInputChange}
            productOptions={productOptions}
            locationOptions={locationOptions}
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
