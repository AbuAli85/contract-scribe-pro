
import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ValidationItem {
  field: string;
  message: string;
  type: "error" | "warning" | "info";
}

interface ContractValidationSummaryProps {
  errors: ValidationItem[];
  isValid: boolean;
  language: "en" | "ar";
}

const ContractValidationSummary = ({ 
  errors, 
  isValid, 
  language 
}: ContractValidationSummaryProps) => {
  if (isValid) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <p className="text-green-800 dark:text-green-300 font-medium">
              {language === "ar" ? "العقد صالح وجاهز للمعاينة" : "Contract is valid and ready for preview"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const errorCount = errors.filter(e => e.type === "error").length;
  const warningCount = errors.filter(e => e.type === "warning").length;
  
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-300 font-medium">
            {language === "ar" 
              ? `يحتوي العقد على ${errorCount} أخطاء و ${warningCount} تحذيرات`
              : `Contract has ${errorCount} errors and ${warningCount} warnings`}
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="validation-issues" className="border-red-200 dark:border-red-800">
            <AccordionTrigger className="text-sm text-red-700 dark:text-red-300 py-2">
              {language === "ar" ? "عرض التفاصيل" : "View details"}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${
                      error.type === "error" 
                        ? "bg-red-500" 
                        : error.type === "warning" 
                          ? "bg-yellow-500" 
                          : "bg-blue-500"
                    }`} />
                    <span>
                      <strong>{error.field}:</strong> {error.message}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ContractValidationSummary;
