
/**
 * PDF Debugger Utility
 * Helps diagnose and fix issues with PDF generation
 */
import { toast } from '@/hooks/use-toast';
import { printDebugTools } from '@/utils/print-debug-tools';

interface PDFDebugOptions {
  selector?: string;
  showToasts?: boolean;
}

/**
 * PDF Debugger class with utilities for diagnosing PDF export issues
 */
export class PDFDebugger {
  /**
   * Check if all required elements for PDF export are present and visible
   */
  static validateElements(selector: string = '.print-container'): boolean {
    console.group('PDF Export Elements Validation');
    
    try {
      // Find the print container
      const container = document.querySelector(selector);
      if (!container) {
        console.error(`Print container not found: ${selector}`);
        return false;
      }
      
      console.log(`Print container found: ${selector}`);
      
      // Check for critical elements
      const criticalElements = [
        '.a4-page',
        '.contract-content',
        '.letterhead-background',
        '.two-column-layout',
        '.contract-column',
        '.signature-area',
        '.id-photo-container'
      ];
      
      const missingElements: string[] = [];
      
      criticalElements.forEach(selector => {
        const element = container.querySelector(selector);
        if (!element) {
          missingElements.push(selector);
          console.error(`Critical element missing: ${selector}`);
        } else {
          console.log(`Found element: ${selector}`);
          
          // Check visibility for found elements
          if (element instanceof HTMLElement) {
            const style = window.getComputedStyle(element);
            const isVisible = style.display !== 'none' && 
                             style.visibility !== 'hidden' && 
                             style.opacity !== '0';
            
            if (!isVisible) {
              console.warn(`Element ${selector} exists but might not be visible`);
            }
          }
        }
      });
      
      const valid = missingElements.length === 0;
      console.log(`PDF elements validation ${valid ? 'passed' : 'failed'}`);
      console.groupEnd();
      return valid;
    } catch (error) {
      console.error('Error validating PDF elements:', error);
      console.groupEnd();
      return false;
    }
  }
  
  /**
   * Diagnose and attempt to fix PDF export issues
   */
  static async diagnoseAndFix(options: PDFDebugOptions = {}): Promise<boolean> {
    const { selector = '.print-container', showToasts = true } = options;
    
    console.group('PDF Export Diagnostics');
    try {
      // Run browser and print diagnostics
      const { diagnostics, issues } = await printDebugTools.troubleshoot();
      
      // Log diagnostics results
      console.log('Print diagnostics results:', diagnostics);
      
      // Validate specific PDF elements
      const elementsValid = this.validateElements(selector);
      
      // Check for image loading issues
      const imageIssues = this.checkImageLoading();
      
      // Check page dimensions
      const dimensionsIssue = this.checkPageDimensions();
      
      // Collect all issues
      const allIssues = [
        ...issues,
        ...(!elementsValid ? ['Missing critical PDF elements'] : []),
        ...imageIssues,
        ...dimensionsIssue
      ];
      
      // Log all issues
      console.log(`Found ${allIssues.length} potential issues`);
      
      // Show toast with results if requested
      if (showToasts) {
        if (allIssues.length > 0) {
          toast({
            title: "PDF Export Diagnostics",
            description: `Found ${allIssues.length} potential issues. Check console for details.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "PDF Export Diagnostics",
            description: "No issues found. PDF export should work correctly.",
            variant: "default"
          });
        }
      }
      
      console.groupEnd();
      return allIssues.length === 0;
    } catch (error) {
      console.error('Error during PDF diagnostics:', error);
      console.groupEnd();
      
      if (showToasts) {
        toast({
          title: "PDF Export Diagnostics Error",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      }
      
      return false;
    }
  }
  
  /**
   * Check if all images are properly loaded
   */
  static checkImageLoading(): string[] {
    const issues: string[] = [];
    const images = document.querySelectorAll('.print-container img');
    
    console.log(`Checking ${images.length} images for loading issues`);
    
    images.forEach((img, index) => {
      if (img instanceof HTMLImageElement) {
        // Check if image is loaded
        if (!img.complete) {
          issues.push(`Image #${index + 1} is not fully loaded`);
        }
        
        // Check if image has valid src
        if (!img.src) {
          issues.push(`Image #${index + 1} has no source`);
        }
        
        // Check if image has error
        if (img.naturalWidth === 0) {
          issues.push(`Image #${index + 1} failed to load properly`);
        }
      }
    });
    
    return issues;
  }
  
  /**
   * Check A4 page dimensions
   */
  static checkPageDimensions(): string[] {
    const issues: string[] = [];
    const page = document.querySelector('.a4-page');
    
    if (page instanceof HTMLElement) {
      const style = window.getComputedStyle(page);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      
      // A4 is approximately 210mm x 297mm or 8.27in x 11.69in
      const expectedWidth = 210; // mm
      const expectedHeight = 297; // mm
      
      console.log(`Page dimensions: ${width}px x ${height}px`);
      
      // Convert to mm for comparison (rough estimate)
      const dpi = 96; // standard screen DPI
      const mmPerInch = 25.4;
      const widthInMm = (width / dpi) * mmPerInch;
      const heightInMm = (height / dpi) * mmPerInch;
      
      console.log(`Page dimensions in mm: ${widthInMm.toFixed(2)}mm x ${heightInMm.toFixed(2)}mm`);
      
      // Check if dimensions are close to A4
      const widthDiff = Math.abs(widthInMm - expectedWidth);
      const heightDiff = Math.abs(heightInMm - expectedHeight);
      
      if (widthDiff > 20) { // Allow 20mm tolerance
        issues.push(`Page width (${widthInMm.toFixed(2)}mm) differs significantly from A4 (${expectedWidth}mm)`);
      }
      
      if (heightDiff > 20) { // Allow 20mm tolerance
        issues.push(`Page height (${heightInMm.toFixed(2)}mm) differs significantly from A4 (${expectedHeight}mm)`);
      }
    } else {
      issues.push('A4 page element not found');
    }
    
    return issues;
  }
}

// Export a singleton instance for convenience
export const pdfDebugger = {
  validate: PDFDebugger.validateElements,
  diagnose: PDFDebugger.diagnoseAndFix,
  checkImages: PDFDebugger.checkImageLoading,
  checkDimensions: PDFDebugger.checkPageDimensions
};
