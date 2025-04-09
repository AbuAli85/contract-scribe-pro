
/**
 * PDF Page Utilities
 * Shared utility functions for PDF page creation
 */
import html2canvas from 'html2canvas';

/**
 * Convert an HTML element to a canvas for PDF generation
 * @param element HTML element to convert
 * @returns Promise resolving to an HTMLCanvasElement
 */
export const convertElementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true, // Allow images from other domains
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 15000, // Increased timeout for image loading
    onclone: (clonedDoc, clonedElement) => {
      // Ensure the cloned element has the correct dimensions for A4
      if (clonedElement) {
        clonedElement.style.width = '210mm';
        clonedElement.style.height = '297mm';
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';
        clonedElement.style.overflow = 'hidden';
        clonedElement.style.position = 'relative';
        
        // Make sure all child elements are visible
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'visible';
            el.style.display = el.tagName.toLowerCase() === 'div' ? 'block' : '';
            el.style.opacity = '1';
          }
        });
        
        // Make sure the letterhead is positioned correctly
        const letterhead = clonedElement.querySelector('.letterhead-background');
        if (letterhead instanceof HTMLElement) {
          letterhead.style.position = 'absolute';
          letterhead.style.top = '0';
          letterhead.style.left = '0';
          letterhead.style.width = '100%';
          letterhead.style.height = '100%';
          letterhead.style.zIndex = '1';
        }
        
        // Make sure content is positioned on top
        const content = clonedElement.querySelector('.contract-content');
        if (content instanceof HTMLElement) {
          content.style.position = 'relative';
          content.style.zIndex = '10';
        }
      }
    }
  });
};
