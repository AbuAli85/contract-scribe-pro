
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PrintDebugButton from "@/components/print/PrintDebugButton";

interface ContractHeaderProps {
  language: "ar" | "en";
  useNewDocumentsPanel: boolean;
  onLanguageChange: (value: "en" | "ar") => void;
  onToggleDocumentsPanel: () => void;
  onSaveContract: () => void;
  showDevControls?: boolean;
}

const ContractHeader: React.FC<ContractHeaderProps> = ({
  language,
  useNewDocumentsPanel,
  onLanguageChange,
  onToggleDocumentsPanel,
  onSaveContract,
  showDevControls = process.env.NODE_ENV === "development"
}) => {
  return (
    <>
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {language === "ar" ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إنشاء عقد جديد" : "Create New Contract"}
        </h1>
        <div className="flex gap-2">
          {showDevControls && (
            <>
              <Button 
                variant="outline" 
                onClick={onToggleDocumentsPanel}
                className="mr-2"
              >
                {language === "ar" ? "تبديل لوحة المستندات" : "Toggle Documents Panel"}
              </Button>
              <PrintDebugButton iconOnly className="mr-2" />
            </>
          )}
          <Select 
            value={language} 
            onValueChange={(value: "en" | "ar") => onLanguageChange(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === "ar" ? "اللغة" : "Language"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onSaveContract} variant="default">
            {language === "ar" ? "حفظ العقد" : "Save Contract"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContractHeader;
