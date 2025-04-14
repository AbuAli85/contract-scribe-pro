
// Contract data type definitions

export interface ContractData {
  referenceNumber: string
  firstParty: {
    nameEn: string
    nameAr: string
    crnEn: string
    crnAr: string
  }
  secondParty: {
    nameEn: string
    nameAr: string
    crnEn: string
    crnAr: string
  }
  promoter: {
    nameEn: string
    nameAr: string
    idEn: string
    idAr: string
  }
  product: {
    nameEn: string
    nameAr: string
  }
  location: {
    nameEn: string
    nameAr: string
  }
  dates: {
    startEn: string
    startAr: string
    endEn: string
    endAr: string
  }
  letterheadUrl: string
  promoterPhotoUrl: string
}

export interface ContractOptions {
  firstParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  secondParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  employers: Array<{ nameEn: string; nameAr: string; crn: string }>
  promoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }>
  products: Array<{ nameEn: string; nameAr: string }>
  locations: Array<{ nameEn: string; nameAr: string }>
  letterheads: Array<{ name: string; dataUrl: string }>
  promoterPhotos: Array<{ name: string; dataUrl: string }>
}

export interface FileReadResult {
  data: string | ArrayBuffer | null
  filename: string
}

export interface ExcelProcessingResult {
  firstParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  secondParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  employers: Array<{ nameEn: string; nameAr: string; crn: string }>
  promoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }>
  products: Array<{ nameEn: string; nameAr: string }>
  locations: Array<{ nameEn: string; nameAr: string }>
}

export type BilingualValue = {
  en: string
  ar: string
}

export interface PDFExportOptions {
  selector: string
  filename: string
  contractData: ContractData
  language: 'ar' | 'en'
  onSuccess?: () => void
  onError?: (error: any) => void
}
