
import { useState, useCallback } from 'react';
import { pdfDebugger } from '@/utils/pdf/pdfDebugger';
import { useToast } from '@/hooks/use-toast';

interface UsePdfDebugOptions {
  selector?: string;
  showToasts?: boolean;
}

/**
 * Hook for PDF debugging functionality
 */
export const usePdfDebug = (options: UsePdfDebugOptions = {}) => {
  const { selector = '.print-container', showToasts = true } = options;
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const { toast } = useToast();

  const runDiagnostics = useCallback(async () => {
    try {
      setIsDebugging(true);
      
      // Run diagnostics
      const result = await pdfDebugger.diagnose({ selector, showToasts });
      
      // Run individual checks
      const imageIssues = pdfDebugger.checkImages();
      const dimensionIssues = pdfDebugger.checkDimensions();
      const elementsValid = pdfDebugger.validate(selector);
      
      // Collect results
      const allResults = {
        success: result,
        elementsValid,
        imageIssues,
        dimensionIssues,
        timestamp: new Date().toISOString()
      };
      
      setDebugResults(allResults);
      
      if (showToasts) {
        toast({
          title: 'PDF Diagnostics Complete',
          description: `${result ? 'No issues found' : 'Issues detected'} - check console for details`,
          variant: result ? 'default' : 'destructive',
        });
      }
      
      return allResults;
    } catch (error) {
      console.error('Error running PDF diagnostics:', error);
      
      if (showToasts) {
        toast({
          title: 'PDF Diagnostics Error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive',
        });
      }
      
      return null;
    } finally {
      setIsDebugging(false);
    }
  }, [selector, showToasts, toast]);

  return {
    runDiagnostics,
    isDebugging,
    debugResults,
    validateElements: useCallback(() => pdfDebugger.validate(selector), [selector]),
    checkImages: pdfDebugger.checkImages,
    checkDimensions: pdfDebugger.checkDimensions
  };
};
