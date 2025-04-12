
import * as XLSX from 'xlsx'
import type { ExcelProcessingResult } from '@/types/contract'

/**
 * Process Excel data and extract contract-related information
 */
export async function processExcelData(data: string): Promise<ExcelProcessingResult> {
  const workbook = XLSX.read(data, { type: 'binary' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet)
  
  const extractedFirstParties: Array<{ nameEn: string; nameAr: string; crn: string }> = []
  const extractedSecondParties: Array<{ nameEn: string; nameAr: string; crn: string }> = []
  const extractedEmployers: Array<{ nameEn: string; nameAr: string; crn: string }> = []
  const extractedPromoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }> = []
  const extractedProducts: Array<{ nameEn: string; nameAr: string }> = []
  const extractedLocations: Array<{ nameEn: string; nameAr: string }> = []
  
  // Process first sheet
  processJsonData(jsonData, {
    extractedFirstParties,
    extractedSecondParties,
    extractedEmployers,
    extractedPromoters,
    extractedProducts,
    extractedLocations
  })
  
  // Process additional sheets if available
  if (workbook.SheetNames.length > 1) {
    processAdditionalSheets(workbook, {
      extractedFirstParties,
      extractedSecondParties,
      extractedEmployers,
      extractedPromoters,
      extractedProducts,
      extractedLocations
    })
  }
  
  // If no specific employer data was found, use second parties as employers
  const employersToUse = extractedEmployers.length === 0 && extractedSecondParties.length > 0 
    ? [...extractedSecondParties] 
    : extractedEmployers
  
  return {
    firstParties: extractedFirstParties,
    secondParties: extractedSecondParties,
    employers: employersToUse,
    promoters: extractedPromoters,
    products: extractedProducts,
    locations: extractedLocations
  }
}

interface DataCollections {
  extractedFirstParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  extractedSecondParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  extractedEmployers: Array<{ nameEn: string; nameAr: string; crn: string }>
  extractedPromoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }>
  extractedProducts: Array<{ nameEn: string; nameAr: string }>
  extractedLocations: Array<{ nameEn: string; nameAr: string }>
}

/**
 * Process JSON data from Excel and categorize entities
 */
function processJsonData(jsonData: any[], collections: DataCollections): void {
  jsonData.forEach((row: any) => {
    const entryType = row.Type || 'unknown'
    
    if (entryType.toLowerCase() === 'client' || (row.nameEn && row.crn && !row.id)) {
      collections.extractedFirstParties.push({
        nameEn: row.nameEn || row.name_en || row.NameEn || row.client_nameEn || '',
        nameAr: row.nameAr || row.name_ar || row.NameAr || row.client_nameAr || '',
        crn: row.crn || row.CRN || row.client_crn || ''
      })
    } else if (entryType.toLowerCase() === 'employer' || (row.employerNameEn || row.employer_nameEn)) {
      collections.extractedEmployers.push({
        nameEn: row.employerNameEn || row.employer_nameEn || row.EmployerNameEn || '',
        nameAr: row.employerNameAr || row.employer_nameAr || row.EmployerNameAr || '',
        crn: row.employerCrn || row.employer_crn || row.EmployerCRN || ''
      })
    } else if (entryType.toLowerCase() === 'secondparty' || row.crn) {
      collections.extractedSecondParties.push({
        nameEn: row.nameEn || row.name_en || row.NameEn || row.secondparty_nameEn || '',
        nameAr: row.nameAr || row.name_ar || row.NameAr || row.secondparty_nameAr || '',
        crn: row.crn || row.CRN || row.secondparty_crn || ''
      })
    } else if (entryType.toLowerCase() === 'promoter' || row.id) {
      collections.extractedPromoters.push({
        nameEn: row.nameEn || row.name_en || row.NameEn || row.promoter_nameEn || '',
        nameAr: row.nameAr || row.name_ar || row.NameAr || row.promoter_nameAr || '',
        id: row.id || row.ID || row.promoter_id || '',
        nationality: row.nationality ? {
          en: row.nationality.en || row.nationality_en || 'Indian',
          ar: row.nationality.ar || row.nationality_ar || 'هندي'
        } : { en: 'Indian', ar: 'هندي' }
      })
    } else if (entryType.toLowerCase() === 'product' || row.product_nameEn) {
      collections.extractedProducts.push({
        nameEn: row.nameEn || row.product_nameEn || row.ProductNameEn || '',
        nameAr: row.nameAr || row.product_nameAr || row.ProductNameAr || ''
      })
    } else if (entryType.toLowerCase() === 'location' || row.location_nameEn) {
      collections.extractedLocations.push({
        nameEn: row.nameEn || row.location_nameEn || row.LocationNameEn || '',
        nameAr: row.nameAr || row.location_nameAr || row.LocationNameAr || ''
      })
    }
  })
}

/**
 * Process additional sheets from the Excel workbook
 */
function processAdditionalSheets(workbook: XLSX.WorkBook, collections: DataCollections): void {
  workbook.SheetNames.forEach(sheetName => {
    if (sheetName === workbook.SheetNames[0]) return // Skip the first sheet as it's already processed
    
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    
    if (sheetName.toLowerCase().includes('client')) {
      sheetData.forEach((row: any) => {
        collections.extractedFirstParties.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || '',
          crn: row.crn || row.CRN || ''
        })
      })
    } else if (sheetName.toLowerCase().includes('employer')) {
      sheetData.forEach((row: any) => {
        collections.extractedEmployers.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || row.employerNameEn || row.employer_nameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || row.employerNameAr || row.employer_nameAr || '',
          crn: row.crn || row.CRN || row.employerCrn || row.employer_crn || ''
        })
      })
    } else if (sheetName.toLowerCase().includes('secondparty')) {
      sheetData.forEach((row: any) => {
        collections.extractedSecondParties.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || '',
          crn: row.crn || row.CRN || ''
        })
      })
    } else if (sheetName.toLowerCase().includes('promoter')) {
      sheetData.forEach((row: any) => {
        collections.extractedPromoters.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || '',
          id: row.id || row.ID || '',
          nationality: row.nationality ? {
            en: row.nationality.en || row.nationality_en || 'Indian',
            ar: row.nationality.ar || row.nationality_ar || 'هندي'
          } : { en: 'Indian', ar: 'هندي' }
        })
      })
    } else if (sheetName.toLowerCase().includes('product')) {
      sheetData.forEach((row: any) => {
        collections.extractedProducts.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || ''
        })
      })
    } else if (sheetName.toLowerCase().includes('location')) {
      sheetData.forEach((row: any) => {
        collections.extractedLocations.push({
          nameEn: row.nameEn || row.name_en || row.NameEn || '',
          nameAr: row.nameAr || row.name_ar || row.NameAr || ''
        })
      })
    }
  })
}
