
/**
 * PDF Export Preparation Utilities
 * Handles DOM preparation and cleanup for PDF export
 */

/**
 * Hide UI elements that should not appear in the PDF
 * @param element Root element to prepare for export
 * @returns NodeList of elements that were hidden
 */
export const prepareForExport = (element: HTMLElement): NodeListOf<Element> => {
  // Temporarily hide all print:hidden elements
  const hiddenElements = element.querySelectorAll('.print\\:hidden, button, nav, header, .tabs-list');
  hiddenElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.setAttribute('data-original-display', el.style.display);
      el.style.display = 'none';
    }
  });

  // Force all critical elements to be visible
  const criticalElements = element.querySelectorAll(
    '.contract-preview, .a4-page, .contract-content, .letterhead-background, ' +
    '.two-column-layout, .contract-column, .contract-text, .signature-area, ' +
    '.signature-block, .contract-title, .reference-section, .id-photo-container, ' +
    '.promoter-details, .responsibilities, .info-row, .best-regards, ' +
    '.responsibilities-title, .reference-number'
  );
  
  criticalElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      
      // Apply specific styles based on element type
      if (el.classList.contains('a4-page')) {
        el.style.width = '210mm';
        el.style.height = '297mm';
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.boxShadow = 'none';
        el.style.overflow = 'hidden';
        el.style.position = 'relative';
      }
      
      if (el.classList.contains('contract-content')) {
        el.style.position = 'relative';
        el.style.zIndex = '10';
        el.style.padding = '10mm';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.boxSizing = 'border-box';
      }
      
      if (el.classList.contains('letterhead-background')) {
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.zIndex = '1';
        el.style.opacity = '0.8';
        el.style.objectFit = 'cover';
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.border = 'none';
      }
      
      if (el.classList.contains('two-column-layout')) {
        el.style.display = 'flex';
        el.style.justifyContent = 'space-between';
        el.style.gap = '10mm';
      }
    }
  });

  return hiddenElements;
};

/**
 * Restore the original display properties after export
 * @param hiddenElements Elements that were hidden during export
 */
export const restoreAfterExport = (hiddenElements: NodeListOf<Element>): void => {
  hiddenElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const originalDisplay = el.getAttribute('data-original-display');
      if (originalDisplay) {
        el.style.display = originalDisplay;
      } else {
        el.style.display = '';
      }
      el.removeAttribute('data-original-display');
    }
  });
};
