
import React, { useState } from 'react';
import { Printer, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrint } from '@/hooks/usePrint';
import { useToast } from '@/hooks/use-toast';
import { printService } from '@/services/print.service';

interface PrintProps {
  disabled?: boolean;
  language?: 'en' | 'ar';
  selector?: string;
  className?: string;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onError?: (error: Error) => void;
  showDebugIcon?: boolean;
}

/**
 * Enhanced Print component with better error handling and diagnostics
 */
const Print: React.FC<PrintProps> = ({
  disabled = false,
  language = 'en',
  selector = '.print-container',
  className = '',
  buttonText,
  variant = 'outline',
  size = 'default',
  onBeforePrint,
  onAfterPrint,
  onError,
  showDebugIcon = false,
}) => {
  const { toast } = useToast();
  const [ready, setReady] = useState(true);
  
  const { isPrinting, handlePrint } = usePrint({
    onSuccess: () => {
      // Show success toast
      toast({
        title: language === 'ar' ? 'تمت الطباعة بنجاح' : 'Print Successful',
        description: language === 'ar' ? 'تم إرسال المستند إلى الطابعة' : 'Document has been sent to the printer',
      });
      
      onAfterPrint?.();
    },
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
      
      // Apply visibility fixes
      printService.fixVisibility(selector);
      
      // Log debug info before printing
      if (process.env.NODE_ENV === 'development') {
        console.log('Print container:', document.querySelector(selector));
        console.log('Starting print process with visibility fixes applied');
      }
      
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
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isPrinting || !ready}
      className={`print:hidden flex gap-2 items-center ${className}`}
    >
      {isPrinting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : !ready && showDebugIcon ? (
        <>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span>{language === 'ar' ? 'جاري التجهيز...' : 'Preparing...'}</span>
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
