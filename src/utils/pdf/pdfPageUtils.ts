
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
    scale: 3, // Increased scale for better quality (previously 2)
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
        clonedElement.style.left = '0'; // Ensure no left offset
        
        // Ensure letterhead has proper opacity for PDF
        const letterhead = clonedElement.querySelector('.letterhead-background');
        if (letterhead instanceof HTMLElement) {
          letterhead.style.opacity = '0.07'; // Adjust opacity for PDF
        }
        
        // Make sure all child elements are visible
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.visibility = 'visible';
            el.style.display = el.tagName.toLowerCase() === 'div' ? 'block' : '';
            el.style.opacity = '1';
            
            // Ensure text is black for better readability in PDF
            if (el.classList.contains('contract-text') || 
                el.classList.contains('contract-title') ||
                el.classList.contains('info-row') ||
                el.classList.contains('contract-main-title')) {
              el.style.color = '#000000';
            }
            
            // Remove any left margin or padding that might cause spacing
            if (el.classList.contains('contract-content')) {
              el.style.paddingLeft = '0';
              el.style.marginLeft = '0';
              el.style.width = '100%';
              el.style.boxSizing = 'border-box';
            }
          }
        });
        
        // Fix image scaling specifically
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.objectFit = 'contain';
          
          // Add specific classes to help identify images
          img.classList.add('pdf-rendered-image');
          
          // Special handling for ID photos
          if (img.classList.contains('id-photo')) {
            const container = img.closest('.id-photo-container');
            if (container instanceof HTMLElement) {
              container.style.display = 'flex';
              container.style.justifyContent = 'center';
              container.style.margin = '10mm 0';
              container.style.width = '100%';
            }
            
            const wrapper = img.closest('.id-photo-wrapper');
            if (wrapper instanceof HTMLElement) {
              wrapper.style.width = '350px';
              wrapper.style.maxWidth = '100%';
              wrapper.style.margin = '0 auto';
              wrapper.style.border = '1px solid #ddd';
              wrapper.style.borderRadius = '4px';
              wrapper.style.overflow = 'hidden';
              wrapper.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }
            
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
          }
        });
      }
    }
  });
};
