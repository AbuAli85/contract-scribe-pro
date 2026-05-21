
/**
 * Formats a date in the format required by the date input field (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return ''
  
  // Check if the date is already in the YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Try to parse the date
  try {
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      
      // Return in YYYY-MM-DD format for the input field
      return `${year}-${month}-${day}`
    }
  } catch (e) {
    console.error('Error formatting date:', e)
  }
  
  return ''
}

/**
 * Converts a date string into both English and Arabic formats
 */
export function generateBilingualDates(dateString: string): { englishDate: string; arabicDate: string } {
  if (!dateString) {
    return { englishDate: '', arabicDate: '' }
  }
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    
    // Format for English: DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    const englishDate = `${day}/${month}/${year}`
    
    // Convert to Arabic numerals
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    const arabicDay = day.split('').map(d => arabicNumerals[parseInt(d)]).join('')
    const arabicMonth = month.split('').map(m => arabicNumerals[parseInt(m)]).join('')
    const arabicYear = year.toString().split('').map(y => arabicNumerals[parseInt(y)]).join('')
    
    const arabicDate = `${arabicDay}/${arabicMonth}/${arabicYear}`
    
    return { englishDate, arabicDate }
  } catch (e) {
    console.error('Error generating bilingual dates:', e)
    return { englishDate: '', arabicDate: '' }
  }
}
