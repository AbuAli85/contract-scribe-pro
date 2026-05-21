
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

/**
 * Format a date string to bilingual format for contracts
 */
export function formatContractDate(dateStr: string, targetLang: 'en' | 'ar') {
  if (!dateStr) return { en: '', ar: '' }
  
  try {
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number)
      const date = new Date(year, month - 1, day)
      
      return {
        en: format(date, "PPP", { locale: enUS }),
        ar: format(date, "PPP", { locale: ar })
      }
    }
    
    const date = new Date(dateStr)
    return {
      en: format(date, "PPP", { locale: enUS }),
      ar: format(date, "PPP", { locale: ar })
    }
  } catch (e) {
    console.error('Error formatting date:', e)
    return { en: dateStr, ar: dateStr }
  }
}
