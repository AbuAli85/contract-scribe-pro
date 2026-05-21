
/**
 * Print Validation Service
 * Handles validation of print content
 */
import { contractService } from '../contract.service';

export type PrintElement = {
  selector: string;
  display?: 'block' | 'flex' | 'grid';
};

/**
 * Validate that the print content exists and is visible
 */
export const validatePrintContent = (selector = '.print-container'): boolean => {
  try {
    // Check if content exists
    const content = document.querySelector(selector);
    if (!content) {
      console.error('Print content not found:', selector);
      return false;
    }
    
    // Check if content is empty
    if (!content.innerHTML || content.innerHTML.trim() === '') {
      console.error('Print content is empty');
      return false;
    }
    
    // Check key elements exist using contractService
    const isPrintable = contractService.validatePrintability();
    console.log('Contract printability check:', isPrintable);
    
    return isPrintable;
  } catch (error) {
    console.error('Error validating print content:', error);
    return false;
  }
};
