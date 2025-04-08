
import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { printDebugTools } from '@/utils/print-debug-tools';

interface PrintFixButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  autoFix?: boolean;
}

/**
 * A button that automatically detects and fixes common printing issues
 */
const PrintFixButton: React.FC<PrintFixButtonProps> = ({
  className = '',
  variant = 'secondary',
  size = 'default',
  autoFix = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasIssues, setHasIssues] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleTroubleshoot = async () => {
    setIsProcessing(true);
    
    try {
      const { issues, fixed } = await printDebugTools.troubleshoot();
      
      setHasIssues(issues.length > 0);
      
      if (issues.length > 0) {
        toast({
          title: `${issues.length} print ${issues.length === 1 ? 'issue' : 'issues'} detected`,
          description: autoFix 
            ? 'Automatic fixes have been applied' 
            : 'Click to apply automatic fixes',
          action: autoFix ? undefined : <Button onClick={handleTroubleshoot}>Fix Issues</Button>,
          variant: "destructive",
        });
      } else {
        toast({
          title: 'No printing issues found',
          description: 'Your document should print correctly',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error troubleshooting print issues:', error);
      toast({
        title: 'Troubleshooting Error',
        description: error instanceof Error ? error.message : 'An error occurred during troubleshooting',
        variant: 'destructive',
      });
      setHasIssues(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTroubleshoot}
      disabled={isProcessing}
      className={`print:hidden ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Fixing...</span>
        </>
      ) : hasIssues === true ? (
        <>
          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Fix Print Issues</span>
        </>
      ) : hasIssues === false ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          <span>Print Ready</span>
        </>
      ) : (
        <>
          <Wrench className="h-4 w-4 mr-2" />
          <span>Print Troubleshoot</span>
        </>
      )}
    </Button>
  );
};

export default PrintFixButton;
