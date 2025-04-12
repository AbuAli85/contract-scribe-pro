
import { useState } from "react";
import { generateUniqueId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useContractCreator } from "@/hooks/useContractCreator";

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

export interface FormData {
  firstParty: FirstParty;
  secondParty: SecondParty;
  employer: Employer;
  refNumber: string;
  startDate: string;
  endDate: string;
  documentType: string;
}

export interface UseContractFormProps {
  language: "ar" | "en";
  onGenerateContract: (contractData: any) => void;
}

export const useContractForm = ({ language, onGenerateContract }: UseContractFormProps) => {
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

  // Use the contract creator hook for Excel upload functionality
  const { options, handleExcelUpload, isLoading } = useContractCreator();
  const { toast } = useToast();

  // State for Excel data options
  const [firstPartyOptions, setFirstPartyOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [secondPartyOptions, setSecondPartyOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [employerOptions, setEmployerOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [promoterOptions, setPromoterOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [productOptions, setProductOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [locationOptions, setLocationOptions] = useState<Array<{ value: string, label: string }>>([]);

  // Update options when they change in the useContractCreator hook
  const updateOptions = () => {
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
    }
    
    if (options.employers.length > 0) {
      const formattedOptions = options.employers.map(employer => ({
        value: JSON.stringify(employer),
        label: language === "ar" ? employer.nameAr : employer.nameEn
      }));
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
  };

  // Call updateOptions whenever options or language changes
  if (options.firstParties.length > 0 || 
      options.secondParties.length > 0 || 
      options.employers.length > 0 ||
      options.promoters.length > 0 ||
      options.products.length > 0 ||
      options.locations.length > 0) {
    updateOptions();
  }

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

  const handleGenerateContractClick = () => {
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

  return {
    formData,
    isLoading,
    firstPartyOptions,
    secondPartyOptions,
    employerOptions,
    promoterOptions,
    productOptions,
    locationOptions,
    handleInputChange,
    handleFileUpload,
    handleGenerateContract: handleGenerateContractClick
  };
};
