
import React, { useState } from 'react';
import { Printer, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
}

/**
 * Simple Print component that uses direct window.print for maximum compatibility
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
}) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  
  const printText = buttonText || (language === 'ar' ? 'طباعة' : 'Print');
  const loadingText = language === 'ar' ? 'جاري الطباعة...' : 'Printing...';
  
  const handleClick = () => {
    if (isPrinting) return;
    
    setIsPrinting(true);
    
    try {
      // Call before print callback
      onBeforePrint?.();
      
      // Force document to be in printing mode
      document.body.classList.add('printing');
      document.documentElement.classList.add('is-printing');
      
      // Short timeout to ensure styles are applied
      setTimeout(() => {
        try {
          // Use direct window.print() approach for all browsers
          // This is the most reliable method that avoids cross-origin issues
          window.print();
          
          // Success handling
          setTimeout(() => {
            document.body.classList.remove('printing');
            document.documentElement.classList.remove('is-printing');
            setIsPrinting(false);
            onAfterPrint?.();
            
            // Show success toast
            toast({
              title: language === 'ar' ? 'تمت الطباعة بنجاح' : 'Print Successful',
              description: language === 'ar' ? 'تم إرسال المستند إلى الطابعة' : 'Document has been sent to the printer',
            });
          }, 1000);
        } catch (error) {
          console.error('Print error:', error);
          document.body.classList.remove('printing');
          document.documentElement.classList.remove('is-printing');
          setIsPrinting(false);
          
          // Handle errors
          const printError = error instanceof Error ? error : new Error('Unknown printing error');
          onError?.(printError);
          
          toast({
            title: language === 'ar' ? 'خطأ في الطباعة' : 'Print Error',
            description: printError.message,
            variant: 'destructive',
          });
        }
      }, 100);
    } catch (error) {
      console.error('Print setup error:', error);
      document.body.classList.remove('printing');
      document.documentElement.classList.remove('is-printing');
      setIsPrinting(false);
      
      // Handle errors
      const printError = error instanceof Error ? error : new Error('Unknown printing error');
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
      disabled={disabled || isPrinting}
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
