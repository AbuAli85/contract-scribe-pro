
import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrint } from '@/hooks/usePrint';
import { useToast } from '@/hooks/use-toast';

interface PrintProps {
  disabled?: boolean;
  language?: 'en' | 'ar';
  selector?: string;
  className?: string;
  buttonText?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Reusable Print component that uses the centralized print service
 */
const Print: React.FC<PrintProps> = ({
  disabled = false,
  language = 'en',
  selector = '.print-container',
  className = '',
  buttonText,
  onBeforePrint,
  onAfterPrint,
  onError,
}) => {
  const { toast } = useToast();
  const [ready, setReady] = useState(true);
  
  const { isPrinting, handlePrint } = usePrint({
    onSuccess: onAfterPrint,
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ في الطباعة' : 'Print Error',
        description: error.message || (language === 'ar' ? 'حدث خطأ أثناء الطباعة' : 'An error occurred while printing'),
        variant: 'destructive',
      });
      
      onError?.(error);
    }
  });
  
  const printText = buttonText || (language === 'ar' ? 'طباعة' : 'Print');
  const loadingText = language === 'ar' ? 'جاري الطباعة...' : 'Printing...';
  
  const handleClick = () => {
    try {
      onBeforePrint?.();
      handlePrint(selector);
    } catch (error) {
      console.error('Print error:', error);
      
      const printError = error instanceof Error ? error : new Error('Unknown printing error occurred');
      onError?.(printError);
      
      toast({
        title: language === 'ar' ? 'خطأ في الطباعة' : 'Print Error',
        description: printError.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || isPrinting || !ready}
      className={`print:hidden flex gap-2 items-center ${className}`}
    >
      {isPrinting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          <span>{printText}</span>
        </>
      )}
    </Button>
  );
};

export default Print;
