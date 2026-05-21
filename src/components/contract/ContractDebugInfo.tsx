
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import PrintDebugButton from '../print/PrintDebugButton';

interface ContractDebugInfoProps {
  language: "ar" | "en";
  contentReady: boolean;
  showDebugTools?: boolean;
}

const ContractDebugInfo: React.FC<ContractDebugInfoProps> = ({ 
  language, 
  contentReady, 
  showDebugTools = process.env.NODE_ENV === 'development' 
}) => {
  if (!showDebugTools) return null;
  
  return (
    <div className="mb-4 print:hidden">
      {!contentReady ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {language === "ar" 
              ? "المحتوى قيد التحميل. قد لا تظهر بعض العناصر بشكل صحيح عند الطباعة." 
              : "Content is loading. Some elements may not print correctly."}
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="flex justify-end mt-2">
        <PrintDebugButton iconOnly={false} buttonVariant="ghost" className="text-xs" />
      </div>
    </div>
  );
};

export default ContractDebugInfo;
