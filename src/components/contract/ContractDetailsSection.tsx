
import React from "react";
import { Input } from "@/components/ui/input";
import ContractFormSection from "@/components/contract/ContractFormSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, Package } from "lucide-react";

interface ContractDetailsSectionProps {
  refNumber: string;
  startDate: string;
  endDate: string;
  language: "ar" | "en";
  onChange: (field: string, value: string) => void;
  productOptions?: Array<{ value: string, label: string }>;
  locationOptions?: Array<{ value: string, label: string }>;
}

const ContractDetailsSection: React.FC<ContractDetailsSectionProps> = ({
  refNumber,
  startDate,
  endDate,
  language,
  onChange,
  productOptions = [],
  locationOptions = []
}) => {
  const handleStartDateChange = (value: string) => onChange("startDate", value);
  const handleEndDateChange = (value: string) => onChange("endDate", value);
  
  const handleProductChange = (value: string) => {
    try {
      const selectedProduct = JSON.parse(value);
      onChange("product.nameEn", selectedProduct.nameEn);
      onChange("product.nameAr", selectedProduct.nameAr);
    } catch (error) {
      console.error("Error parsing selected product:", error);
    }
  };
  
  const handleLocationChange = (value: string) => {
    try {
      const selectedLocation = JSON.parse(value);
      onChange("location.nameEn", selectedLocation.nameEn);
      onChange("location.nameAr", selectedLocation.nameAr);
    } catch (error) {
      console.error("Error parsing selected location:", error);
    }
  };

  return (
    <ContractFormSection 
      title={language === "ar" ? "تفاصيل العقد" : "Contract Details"}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          {language === "ar" ? "رقم المرجع" : "Reference Number"}
        </label>
        <Input
          value={refNumber}
          readOnly
          className="bg-gray-50"
        />
      </div>
      
      {productOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "المنتج:" : "Product:"}
          </label>
          <Select onValueChange={handleProductChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر المنتج" : "Select Product"} />
            </SelectTrigger>
            <SelectContent>
              {productOptions.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-blue-500" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {locationOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "الموقع:" : "Location:"}
          </label>
          <Select onValueChange={handleLocationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={language === "ar" ? "اختر الموقع" : "Select Location"} />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option, index) => (
                <SelectItem key={index} value={option.value} className="flex items-center">
                  <Map className="h-4 w-4 mr-2 text-amber-500" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "تاريخ البداية" : "Start Date"}
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "تاريخ النهاية" : "End Date"}
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
