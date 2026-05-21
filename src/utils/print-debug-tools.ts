
import { printDiagnostics } from './print-diagnostics';
import { generatePrintDebugInfo, logPrintDebugInfo, attachDebuggerToWindow } from './print-debug';
import { printService } from '@/services/print.service';

/**
 * Centralized access point for all print debugging tools and utilities
 */
export const printDebugTools = {
  /**
   * Run all diagnostics and apply fixes for printing issues
   */
  troubleshoot: async () => {
    // 1. Run diagnostics
    console.group('📝 Print Troubleshooting');
    console.log('Running print diagnostics...');
    
    const diagnostics = printDiagnostics.runDiagnostics();
    const { hasIssues, issues } = printDiagnostics.checkForIssues();
    
    if (hasIssues) {
      console.warn('Issues detected:', issues);
      console.log('Applying automatic fixes...');
      
      // 2. Apply fixes
      printDiagnostics.applyQuickFixes();
      
      // 3. Additional browser-specific fixes
      const { browserName, tips } = printDiagnostics.getBrowserSpecificInfo();
      console.log(`${browserName}-specific tips:`, tips);
      
      // 4. Apply print-section classes to all elements that need it
      const elementsToFix = document.querySelectorAll('.contract-content *, .signature-area *, .reference-section *, .two-column-layout *');
      elementsToFix.forEach(el => {
        if (el instanceof HTMLElement && !el.classList.contains('print-section') && 
            !el.closest('.print-nested-container')) {
          el.classList.add('print-visibility-fixed');
        }
      });
    } else {
      console.log('No major issues detected. Print preview should work correctly.');
    }
    
    console.groupEnd();
    
    return {
      diagnostics,
      issues,
      fixed: hasIssues
    };
  },
  
  /**
   * Initialize print debugging tools
   */
  initialize: () => {
    if (process.env.NODE_ENV === 'development') {
      // Attach debug functions to the window object for console access
      attachDebuggerToWindow();
      
      // Add some helpful console messages
      console.info('Print debugging tools initialized. Available commands:');
      console.info('- window.printDebug() - Run print diagnostics');
      console.info('- window.printTroubleshoot() - Run troubleshooting and apply fixes');
      
      // Additional window methods for debugging
      // @ts-ignore - Adding to window object
      window.printTroubleshoot = async () => {
        const result = await printDebugTools.troubleshoot();
        return `Troubleshooting complete. Found ${result.issues.length} issues. ${result.fixed ? 'Fixes applied.' : 'No fixes needed.'}`;
      };
      
      // @ts-ignore - Adding to window object
      window.printVisibilityFix = () => {
        printService.fixVisibility('.print-container');
        return "Visibility fixes applied. Check if printing works now.";
      };
      
      // @ts-ignore - Adding to window object
      window.checkNestedContainers = () => {
        const containers = document.querySelectorAll('.print-container');
        const nestedContainers = [];
        
        containers.forEach(container => {
          if (container.closest('.print-container') !== container) {
            nestedContainers.push(container);
          }
        });
        
        return {
          totalContainers: containers.length,
          nestedContainers: nestedContainers.length,
          nestedElements: nestedContainers
        };
      };
    }
    
    return true;
  },
  
  // Re-export core functions for convenience
  generatePrintDebugInfo,
  logPrintDebugInfo
};

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  printDebugTools.initialize();
}
