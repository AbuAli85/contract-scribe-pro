
/**
 * PDF Export Toast Messages
 * Contains toast messages for PDF export
 */
import { toast } from '@/hooks/use-toast';

export const displayToasts = {
  success: (language: 'en' | 'ar') => {
    toast({
      title: language === 'ar' ? 'تم تصدير الملف بنجاح' : 'PDF Export Successful',
      description: language === 'ar' 
        ? 'تم تصدير الملف بنجاح وحفظه على جهازك'
        : 'The document has been exported and saved to your device',
    });
  },
  
  error: (language: 'en' | 'ar', error: any) => {
    // For UUID validation errors, we'll show a more specific message
    const isUuidError = error instanceof Error && 
      (error.message.includes('UUID') || error.message.includes('contract ID'));
    
    // Don't show duplicate error messages for UUID validation
    if (isUuidError && document.querySelector('[data-uuid-error="true"]')) {
      console.warn('Suppressing duplicate UUID error toast');
      return;
    }
    
    toast({
      variant: 'destructive',
      title: language === 'ar' ? 'خطأ في تصدير الملف' : 'PDF Export Failed',
      description: isUuidError 
        ? (language === 'ar' 
            ? 'معرف العقد غير صالح. يرجى استخدام معرف بتنسيق UUID صالح.'
            : 'Invalid contract ID. Please use a valid UUID format.')
        : (error instanceof Error ? error.message : 'An unknown error occurred'),
    });
  },
  
  warning: (language: 'en' | 'ar', message: string) => {
    toast({
      variant: 'default',
      title: language === 'ar' ? 'تحذير' : 'Warning',
      description: message,
    });
  }
};
