
/**
 * Font Checker Utility
 * 
 * Utility for checking fonts in the document
 */

/**
 * Check for used fonts in the document
 */
export const checkFonts = (): { loaded: boolean; usedFontsCount: number } => {
  try {
    // @ts-ignore - document.fonts is a modern API not in all TypeScript definitions
    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      // Count the number of unique font families being used
      const fontSet = new Set<string>();
      document.querySelectorAll('*').forEach(element => {
        const fontFamily = window.getComputedStyle(element).fontFamily;
        if (fontFamily && fontFamily !== 'inherit') {
          fontSet.add(fontFamily);
        }
      });
      
      return {
        loaded: document.fonts.status === 'loaded',
        usedFontsCount: fontSet.size
      };
    }
  } catch (e) {
    console.error('Error checking fonts:', e);
  }
  
  return {
    loaded: true, // Assume loaded if we can't check
    usedFontsCount: 0
  };
};
