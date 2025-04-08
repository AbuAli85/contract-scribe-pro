
import { documentSystem, type AttachedDocument } from "@/lib/documents"
import { toast } from "@/hooks/use-toast"

export type PrintOptions = {
  contractId: string;
  language: "en" | "ar";
  includeAttachments?: boolean;
}

export const contractService = {
  /**
   * Prepares a contract for printing
   */
  prepareForPrinting: async (contractId: string): Promise<{
    contractData: any;
    attachments: AttachedDocument[];
  }> => {
    try {
      // Get contract data
      // In a real app, this would fetch from an API or database
      const contractData = {
        id: contractId,
        // Mock data for testing
        refNumber: "CL-2025-" + contractId,
        letterhead: "https://picsum.photos/800/1100",
        promoterPhoto: "https://picsum.photos/400/300",
        firstParty: {
          name: { en: "Falcon Eye Management LLC", ar: "عين الصقر للإدارة ذ.م.م" },
          crn: { en: "1410869", ar: "١٤١٠٨٦٩" },
        },
        secondParty: {
          name: { en: "Al Madar Trading LLC", ar: "المدار للتجارة ذ.م.م" },
          crn: { en: "1234567", ar: "١٢٣٤٥٦٧" },
        },
        product: { en: "Electronics", ar: "الإلكترونيات" },
        location: { en: "Muscat Grand Mall", ar: "مسقط جراند مول" },
        promoter: {
          name: { en: "Farzan Riyaz Munde", ar: "فرزان رياض موندي" },
          id: { en: "126208869", ar: "١٢٦٢٠٨٨٦٩" },
        },
        startDate: { en: "06/04/2025", ar: "٠٦/٠٤/٢٠٢٥" },
        endDate: { en: "06/07/2025", ar: "٠٦/٠٧/٢٠٢٥" },
      }
      
      // Get attachments for printing
      const attachments = await documentSystem.getDocumentsForPrinting(contractId)
      
      return {
        contractData,
        attachments
      }
    } catch (error) {
      console.error("Error preparing contract for printing:", error)
      throw error
    }
  },
  
  /**
   * Validate that all required elements are present and visible
   */
  validatePrintability: (): boolean => {
    // Check contract preview exists
    const contractPreview = document.querySelector('.contract-preview')
    if (!contractPreview) {
      console.error("Contract preview element not found")
      return false
    }
    
    // Check contract content exists
    const contractContent = document.querySelector('.contract-content')
    if (!contractContent) {
      console.error("Contract content element not found")
      return false
    }
    
    // Check contract text elements exist
    const contractText = document.querySelectorAll('.contract-text')
    if (contractText.length === 0) {
      console.error("Contract text elements not found")
      return false
    }
    
    // Check two-column layout exists
    const twoColumnLayout = document.querySelector('.two-column-layout')
    if (!twoColumnLayout) {
      console.error("Two-column layout not found")
      return false
    }
    
    // Check letterhead background exists if that element is used
    const letterhead = document.querySelector('.letterhead-background')
    if (!letterhead) {
      console.warn("Letterhead background not found (optional)")
    }
    
    // Log all checked elements for debugging
    console.log("Contract printability check passed with elements:", {
      contractPreview: !!contractPreview,
      contractContent: !!contractContent,
      contractTextCount: contractText.length,
      twoColumnLayout: !!twoColumnLayout,
      letterhead: !!letterhead
    })
    
    return true
  },
  
  /**
   * Fix visibility of elements before printing
   */
  fixPrintVisibility: (): void => {
    console.log("Applying contract visibility fixes")
    
    // Add printing class to body
    document.body.classList.add('printing')
    
    // Force visibility of all essential elements
    const selectors = [
      '.contract-preview',
      '.a4-page',
      '.contract-content',
      '.letterhead-background',
      '.reference-section',
      '.contract-title-area',
      '.two-column-layout',
      '.contract-column',
      '.contract-text',
      '.promoter-details',
      '.responsibilities',
      '.signature-area',
      '.signature-block',
      '.contract-title',
      '.contract-main-title',
      '.best-regards',
      '.id-photo-container',
      '.reference-number',
      '.info-row',
      '.responsibilities-title'
    ]
    
    const elementsFixed = selectors.map(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Determine correct display style
          const display = selector === '.two-column-layout' ? 'flex' : 'block'
          el.style.display = display
          el.style.visibility = 'visible'
          el.style.opacity = '1'
          
          // Special color handling
          if (!selector.includes('two-column-layout') && 
              !selector.includes('a4-page') && 
              !selector.includes('contract-preview')) {
            el.style.color = 'black'
          }
          
          // Add padding for readability
          if (selector === '.contract-content') {
            el.style.padding = '20mm'
          }
        }
      })
      return { selector, count: elements.length }
    })
    
    console.log("Visibility fixes applied to:", elementsFixed)
    
    // Special handling for two-column layout
    const twoColumnLayout = document.querySelector('.two-column-layout')
    if (twoColumnLayout instanceof HTMLElement) {
      twoColumnLayout.style.display = 'flex'
      twoColumnLayout.style.flexDirection = 'row'
      twoColumnLayout.style.justifyContent = 'space-between'
      twoColumnLayout.style.gap = '10mm'
      console.log("Two-column layout style applied")
    }
    
    // Ensure any images are visible
    document.querySelectorAll('img').forEach(img => {
      img.style.visibility = 'visible'
      img.style.display = 'block'
      img.style.opacity = '1'
    })
  },
  
  /**
   * Clean up after printing
   */
  cleanupAfterPrinting: (): void => {
    // Remove printing class from body
    document.body.classList.remove('printing')
    console.log("Print cleanup completed")
  }
}
