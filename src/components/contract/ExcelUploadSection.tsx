
import React from "react";
import { Upload } from "lucide-react";

interface ExcelUploadSectionProps {
  language: "ar" | "en";
  isLoading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExcelUploadSection: React.FC<ExcelUploadSectionProps> = ({
  language,
  isLoading,
  onFileUpload
}) => {
  return (
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
          onChange={onFileUpload}
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
  );
};

export default ExcelUploadSection;
