
/**
 * PDF Toast Notifications
 * Handles displaying success and error toast notifications
 */
import { toast } from '@/hooks/use-toast';

/**
 * Toast notification display handlers
 */
export const displayToasts = {
  /**
   * Show a success toast message
   * @param language Current UI language
   */
  success: (language: 'en' | 'ar'): void => {
    toast({
      title: language === "ar" ? "تم تحميل PDF بنجاح" : "PDF Downloaded",
      description: language === "ar" ? "تم تحميل عقدك كملف PDF" : "Your contract has been downloaded as a PDF",
    });
  },

  /**
   * Show an error toast message
   * @param language Current UI language
   * @param error Error object or message
   */
  error: (language: 'en' | 'ar', error: unknown): void => {
    toast({
      title: language === "ar" ? "خطأ في تحميل PDF" : "PDF Export Error",
      description: error instanceof Error ? error.message : "An error occurred during PDF export",
      variant: "destructive",
    });
  }
};
