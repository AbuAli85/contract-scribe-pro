
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

  // Ensure letterhead covers full page with proper dimensions
  const letterhead = element.querySelector('.letterhead-background') as HTMLElement;
  if (letterhead) {
    letterhead.style.position = 'absolute';
    letterhead.style.top = '0';
    letterhead.style.left = '0';
    letterhead.style.width = '100%';
    letterhead.style.height = '100%';
    letterhead.style.zIndex = '1';
    letterhead.style.opacity = '0.8';
    letterhead.style.objectFit = 'cover';
    letterhead.style.margin = '0';
    letterhead.style.padding = '0';
    letterhead.style.border = 'none';
  }

  // Make sure the contract content is on top of the letterhead
  const content = element.querySelector('.contract-content') as HTMLElement;
  if (content) {
    content.style.position = 'relative';
    content.style.zIndex = '10';
    // Use smaller padding to maximize content area
    content.style.padding = '10mm';
  }

  // Set A4 page dimensions explicitly without margins
  const a4Page = element.querySelector('.a4-page') as HTMLElement;
  if (a4Page) {
    a4Page.style.width = '210mm';
    a4Page.style.height = '297mm';
    a4Page.style.margin = '0';
    a4Page.style.padding = '0';
    a4Page.style.boxShadow = 'none';
    a4Page.style.overflow = 'hidden';
  }

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
