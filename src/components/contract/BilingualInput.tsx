
import React from "react";
import { Input } from "@/components/ui/input";

interface BilingualInputProps {
  englishValue: string;
  arabicValue: string;
  englishLabel: string;
  arabicLabel: string;
  englishPlaceholder?: string;
  arabicPlaceholder?: string;
  onEnglishChange: (value: string) => void;
  onArabicChange: (value: string) => void;
  currentLanguage: "ar" | "en";
}

const BilingualInput: React.FC<BilingualInputProps> = ({
  englishValue,
  arabicValue,
  englishLabel,
  arabicLabel,
  englishPlaceholder,
  arabicPlaceholder,
  onEnglishChange,
  onArabicChange,
  currentLanguage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {currentLanguage === "ar" ? englishLabel : englishLabel}
        </label>
        <Input
          value={englishValue}
          onChange={(e) => onEnglishChange(e.target.value)}
          placeholder={englishPlaceholder}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {currentLanguage === "ar" ? arabicLabel : arabicLabel}
        </label>
        <Input
          value={arabicValue}
          onChange={(e) => onArabicChange(e.target.value)}
          placeholder={arabicPlaceholder}
          className="text-right"
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default BilingualInput;
