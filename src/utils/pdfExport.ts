
/**
 * PDF Export Utility
 * Handles exporting contract content as a downloadable PDF
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { setupPrintContainer, cleanupPrinting } from './print-container';
import { toast } from '@/hooks/use-toast';

/**
 * Hide UI elements that should not appear in the PDF
 */
const prepareForExport = (element: HTMLElement) => {
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
 * Restore the original display properties
 */
const restoreAfterExport = (hiddenElements: NodeListOf<Element>) => {
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

/**
 * Creates a second page with passport document if provided
 */
const createPassportPage = async (pdf: jsPDF, contractData: any): Promise<boolean> => {
  try {
    // Find passport/ID photo container
    const passportElement = document.querySelector('.id-photo-container') as HTMLElement;
    if (!passportElement) {
      console.warn('No passport element found for second page');
      return false;
    }

    // Create a temporary container for the passport page
    const passportPageContainer = document.createElement('div');
    passportPageContainer.className = 'a4-page passport-page';
    passportPageContainer.style.width = '210mm';
    passportPageContainer.style.height = '297mm';
    passportPageContainer.style.position = 'relative';
    passportPageContainer.style.overflow = 'hidden';
    passportPageContainer.style.backgroundColor = 'white';
    
    // Add letterhead background if available
    if (contractData && contractData.letterhead) {
      const letterheadBg = document.createElement('div');
      letterheadBg.className = 'letterhead-background';
      letterheadBg.style.position = 'absolute';
      letterheadBg.style.top = '0';
      letterheadBg.style.left = '0';
      letterheadBg.style.width = '100%';
      letterheadBg.style.height = '100%';
      letterheadBg.style.backgroundImage = `url('${contractData.letterhead}')`;
      letterheadBg.style.backgroundSize = 'cover';
      letterheadBg.style.backgroundPosition = 'center';
      letterheadBg.style.opacity = '0.8';
      letterheadBg.style.zIndex = '1';
      passportPageContainer.appendChild(letterheadBg);
    }
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'passport-content';
    contentContainer.style.position = 'relative';
    contentContainer.style.zIndex = '10';
    contentContainer.style.padding = '20mm';
    contentContainer.style.height = '100%';
    contentContainer.style.boxSizing = 'border-box';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.alignItems = 'center';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Passport / جواز السفر';
    title.style.fontSize = '24px';
    title.style.marginBottom = '20mm';
    title.style.textAlign = 'center';
    title.style.width = '100%';
    contentContainer.appendChild(title);
    
    // Create a container for the passport image
    const passportImageContainer = document.createElement('div');
    passportImageContainer.style.width = '100%';
    passportImageContainer.style.display = 'flex';
    passportImageContainer.style.justifyContent = 'center';
    passportImageContainer.style.marginBottom = '20mm';
    
    // Clone the passport photo for better quality
    const originalPhoto = passportElement.querySelector('.id-photo') as HTMLImageElement;
    if (originalPhoto && originalPhoto.src) {
      const passportImage = document.createElement('img');
      passportImage.src = originalPhoto.src;
      passportImage.alt = 'Passport';
      passportImage.style.maxWidth = '80%';
      passportImage.style.maxHeight = '60%';
      passportImage.style.objectFit = 'contain';
      passportImage.style.border = '1px solid #ddd';
      passportImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      passportImageContainer.appendChild(passportImage);
    }
    
    contentContainer.appendChild(passportImageContainer);
    
    // Add reference number if available
    if (contractData && contractData.refNumber) {
      const refNumber = document.createElement('div');
      refNumber.className = 'reference-number';
      refNumber.textContent = `Ref: ${contractData.refNumber}`;
      refNumber.style.fontSize = '14px';
      refNumber.style.marginBottom = '10mm';
      refNumber.style.position = 'absolute';
      refNumber.style.top = '10mm';
      refNumber.style.left = '20mm';
      contentContainer.appendChild(refNumber);
    }
    
    // Add promoter details if available
    if (contractData && contractData.promoter) {
      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'passport-details';
      detailsContainer.style.width = '80%';
      detailsContainer.style.marginTop = 'auto';
      detailsContainer.style.marginBottom = '20mm';
      detailsContainer.style.padding = '15px';
      detailsContainer.style.border = '1px solid #ddd';
      detailsContainer.style.borderRadius = '5px';
      detailsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      
      // Create promoter info in English and Arabic
      const infoHTML = `
        <div style="display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <p><strong>Promoter Name:</strong> ${contractData.promoter.name?.en || 'N/A'}</p>
            <p><strong>ID Number:</strong> ${contractData.promoter.id?.en || 'N/A'}</p>
            <p><strong>From:</strong> ${contractData.startDate?.en || 'N/A'}</p>
            <p><strong>To:</strong> ${contractData.endDate?.en || 'N/A'}</p>
          </div>
          <div style="width: 48%; text-align: right; direction: rtl;">
            <p><strong>اسم المروج:</strong> ${contractData.promoter.name?.ar || 'N/A'}</p>
            <p><strong>رقم الهوية:</strong> ${contractData.promoter.id?.ar || 'N/A'}</p>
            <p><strong>من:</strong> ${contractData.startDate?.ar || 'N/A'}</p>
            <p><strong>إلى:</strong> ${contractData.endDate?.ar || 'N/A'}</p>
          </div>
        </div>
      `;
      
      detailsContainer.innerHTML = infoHTML;
      contentContainer.appendChild(detailsContainer);
    }
    
    passportPageContainer.appendChild(contentContainer);
    
    // Temporarily add to document but hide it
    passportPageContainer.style.position = 'absolute';
    passportPageContainer.style.left = '-9999px';
    document.body.appendChild(passportPageContainer);
    
    // Add a new page for the passport
    pdf.addPage([210, 297], 'portrait');
    
    // Convert the passport page to canvas
    const canvas = await html2canvas(passportPageContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Add canvas to PDF - full page size
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Clean up - remove temporary elements
    document.body.removeChild(passportPageContainer);
    
    return true;
  } catch (error) {
    console.error('Error creating passport page:', error);
    return false;
  }
};

/**
 * Export contract content as PDF
 * @param options Configuration options for PDF export
 */
export const exportToPDF = async (options: {
  selector?: string;
  filename?: string;
  pageFormat?: 'a4' | 'letter';
  language?: 'en' | 'ar';
  contractData?: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  includePassport?: boolean;
}) => {
  const {
    selector = '.print-container',
    filename = 'contract.pdf',
    pageFormat = 'a4',
    language = 'en',
    contractData,
    onSuccess,
    onError,
    includePassport = true
  } = options;
  
  try {
    // Set up print container
    setupPrintContainer();
    
    // Find the element to export
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error('Element not found: ' + selector);
    }
    
    // Hide UI elements and prepare for export
    const hiddenElements = prepareForExport(element as HTMLElement);
    
    // Create PDF with appropriate dimensions (no margins)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat,
      compress: true
    });
    
    // Convert HTML to canvas
    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Add canvas image to PDF - using exact A4 dimensions with no margins
    const imgData = canvas.toDataURL('image/png');
    
    // Add the image to fill the entire page without margins - exact A4 size
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Add passport document as a second page if requested
    if (includePassport) {
      await createPassportPage(pdf, contractData);
    }
    
    // Save PDF
    pdf.save(filename);
    
    // Restore original element display properties
    restoreAfterExport(hiddenElements);
    
    // Show success message
    toast({
      title: language === "ar" ? "تم تحميل PDF بنجاح" : "PDF Downloaded",
      description: language === "ar" ? "تم تحميل عقدك كملف PDF" : "Your contract has been downloaded as a PDF",
    });
    
    // Callback if provided
    onSuccess?.();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Show error message
    toast({
      title: language === "ar" ? "خطأ في تحميل PDF" : "PDF Export Error",
      description: error instanceof Error ? error.message : "An error occurred during PDF export",
      variant: "destructive",
    });
    
    // Callback if provided
    onError?.(error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Clean up after export
    cleanupPrinting();
  }
};
