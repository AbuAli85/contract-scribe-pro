
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface GenerateContractButtonProps {
  language: "ar" | "en";
  onClick: () => void;
}

const GenerateContractButton: React.FC<GenerateContractButtonProps> = ({
  language,
  onClick
}) => {
  return (
    <Button 
      onClick={onClick}
      className="w-full flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      {language === "ar" ? "إنشاء العقد" : "Generate Contract"}
    </Button>
  );
};

export default GenerateContractButton;
