
/**
 * Utility to ensure print container exists in the DOM
 */

/**
 * Ensures a print container exists in the DOM and returns it
 * This solves the "Print container not found" error by creating one if needed
 */
export const ensurePrintContainer = (): HTMLElement => {
  // Try to find existing print container
  let container = document.querySelector('.print-container') as HTMLElement;
  
  // If not found, try to find suitable elements to mark as print container
  if (!container) {
    // Try contract preview first
    container = document.querySelector('.contract-preview') as HTMLElement;
    if (container) {
      container.classList.add('print-container');
      console.log('Added print-container class to contract-preview');
      return container;
    }
    
    // Try A4 page
    container = document.querySelector('.a4-page') as HTMLElement;
    if (container) {
      container.classList.add('print-container');
      console.log('Added print-container class to a4-page');
      return container;
    }
    
    // Try contract content
    container = document.querySelector('.contract-content') as HTMLElement;
    if (container) {
      container.classList.add('print-container');
      console.log('Added print-container class to contract-content');
      return container;
    }
    
    // If no suitable element found, create a new container
    console.log('No suitable print container found, creating new one');
    container = document.createElement('div');
    container.className = 'print-container';
    
    // Find main content area to append to
    const main = document.querySelector('main') || document.body;
    
    // Append after current elements
    main.appendChild(container);
    
    // Find relevant content to move into the print container
    const contractElements = document.querySelectorAll('.contract-preview, .a4-page, .contract-content');
    if (contractElements.length > 0) {
      console.log(`Moving ${contractElements.length} elements into new print container`);
      contractElements.forEach(el => {
        // Clone the element to avoid reference issues
        const clone = el.cloneNode(true);
        // Add to print container
        container.appendChild(clone);
      });
    }
  }
  
  return container;
};

/**
 * Makes an element printable by applying necessary classes and styles
 */
export const makePrintable = (element: HTMLElement): void => {
  // Add print-container class
  element.classList.add('print-container');
  
  // Force visibility
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.position = 'relative';
  element.style.zIndex = '9999';
  element.style.backgroundColor = 'white';
  
  // Ensure all print-critical elements are visible
  const criticalElements = element.querySelectorAll(
    '.contract-preview, .a4-page, .contract-content, .letterhead-background, ' +
    '.two-column-layout, .contract-column, .signature-area, .id-photo-container'
  );
  
  criticalElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.display = el.classList.contains('two-column-layout') ? 'flex' : 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    }
  });
};

/**
 * Setup print container and trigger print
 * This should be called just before printing
 */
export const setupPrintContainer = (): HTMLElement => {
  // Set printing classes on document
  document.documentElement.classList.add('is-printing');
  document.body.classList.add('printing');
  
  // Make sure container exists
  const container = ensurePrintContainer();
  
  // Make it printable
  makePrintable(container);
  
  return container;
};

/**
 * Clean up after printing
 */
export const cleanupPrinting = (): void => {
  // Remove printing classes
  document.documentElement.classList.remove('is-printing');
  document.body.classList.remove('printing');
};
