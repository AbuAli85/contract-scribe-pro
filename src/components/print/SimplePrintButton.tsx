
import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { printService } from '@/services/print.service';

interface SimplePrintButtonProps {
  selector?: string;
  className?: string;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * A simple print button component that uses the print service
 */
const SimplePrintButton: React.FC<SimplePrintButtonProps> = ({
  selector = '.print-container',
  className = '',
  buttonText = 'Print',
  variant = 'outline',
  size = 'default',
  onSuccess,
  onError
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const handlePrint = async () => {
    if (isPrinting) return;
    
    setIsPrinting(true);
    
    try {
      // Apply visibility fixes before printing
      printService.fixVisibility(selector);
      
      // Use the print service to handle printing
      await printService.print({
        selector,
        onSuccess: () => {
          setIsPrinting(false);
          toast({
            title: "Print Completed",
            description: "Document has been sent to the printer",
          });
          onSuccess?.();
        },
        onError: (error) => {
          setIsPrinting(false);
          toast({
            title: "Print Error",
            description: error.message || "Failed to print document",
            variant: "destructive",
          });
          onError?.(error);
        }
      });
    } catch (error) {
      setIsPrinting(false);
      const printError = error instanceof Error ? error : new Error('Unknown printing error');
      console.error('Print error:', printError);
      
      toast({
        title: "Print Error",
        description: printError.message,
        variant: "destructive",
      });
      
      onError?.(printError);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      disabled={isPrinting}
      className={`print:hidden flex items-center gap-2 ${className}`}
    >
      {isPrinting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Printing...</span>
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  );
};

export default SimplePrintButton;
