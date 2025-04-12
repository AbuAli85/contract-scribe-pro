import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { exportToPDF } from '@/utils/pdf/pdfExport'
import { useToast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'

export interface ContractData {
  referenceNumber: string
  firstParty: {
    nameEn: string
    nameAr: string
    crn: string
  }
  secondParty: {
    nameEn: string
    nameAr: string
    crn: string
  }
  promoter: {
    nameEn: string
    nameAr: string
    id: string
    nationality?: {
      en: string
      ar: string
    }
  }
  product: {
    nameEn: string
    nameAr: string
  }
  location: {
    nameEn: string
    nameAr: string
  }
  startDate: {
    en: string
    ar: string
  }
  endDate: {
    en: string
    ar: string
  }
  letterheadImage: string | null
  promoterPhoto: string | null
}

export interface ContractOptions {
  firstParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  secondParties: Array<{ nameEn: string; nameAr: string; crn: string }>
  promoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }>
  products: Array<{ nameEn: string; nameAr: string }>
  locations: Array<{ nameEn: string; nameAr: string }>
  letterheads: Array<{ name: string; dataUrl: string }>
  promoterPhotos: Array<{ name: string; dataUrl: string }>
}

export function useContractCreator() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [contractData, setContractData] = useState<ContractData>({
    referenceNumber: '',
    firstParty: { nameEn: '', nameAr: '', crn: '' },
    secondParty: { nameEn: '', nameAr: '', crn: '' },
    promoter: { nameEn: '', nameAr: '', id: '' },
    product: { nameEn: '', nameAr: '' },
    location: { nameEn: '', nameAr: '' },
    startDate: { en: '', ar: '' },
    endDate: { en: '', ar: '' },
    letterheadImage: null,
    promoterPhoto: null
  })
  const [options, setOptions] = useState<ContractOptions>({
    firstParties: [],
    secondParties: [],
    promoters: [],
    products: [],
    locations: [],
    letterheads: [],
    promoterPhotos: []
  })
  const [showContract, setShowContract] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    generateReferenceNumber()
  }, [])

  const generateReferenceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    const refNumber = `PRO-${year}${month}${day}-${random}`
    
    setContractData(prev => ({
      ...prev,
      referenceNumber: refNumber
    }))
  }

  const formatDate = (dateStr: string, targetLang: 'en' | 'ar') => {
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

  const handleFileRead = (file: File, fileType: 'excel' | 'letterhead' | 'promoterPhoto'): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'))
          return
        }
        
        if (fileType === 'excel') {
          resolve(e.target.result)
        } else {
          resolve(e.target.result)
        }
      }
      
      reader.onerror = (e) => {
        reject(e)
      }
      
      if (fileType === 'excel') {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true)
      
      const data = await handleFileRead(file, 'excel')
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      const extractedFirstParties: Array<{ nameEn: string; nameAr: string; crn: string }> = []
      const extractedSecondParties: Array<{ nameEn: string; nameAr: string; crn: string }> = []
      const extractedPromoters: Array<{ nameEn: string; nameAr: string; id: string; nationality?: { en: string; ar: string } }> = []
      const extractedProducts: Array<{ nameEn: string; nameAr: string }> = []
      const extractedLocations: Array<{ nameEn: string; nameAr: string }> = []
      
      jsonData.forEach((row: any) => {
        const entryType = row.Type || 'unknown'
        
        if (entryType.toLowerCase() === 'client' || (row.nameEn && row.crn && !row.id)) {
          extractedFirstParties.push({
            nameEn: row.nameEn || row.name_en || row.NameEn || row.client_nameEn || '',
            nameAr: row.nameAr || row.name_ar || row.NameAr || row.client_nameAr || '',
            crn: row.crn || row.CRN || row.client_crn || ''
          })
        } else if (entryType.toLowerCase() === 'employer' || (row.nameEn && row.crn)) {
          extractedSecondParties.push({
            nameEn: row.nameEn || row.name_en || row.NameEn || row.employer_nameEn || '',
            nameAr: row.nameAr || row.name_ar || row.NameAr || row.employer_nameAr || '',
            crn: row.crn || row.CRN || row.employer_crn || ''
          })
        } else if (entryType.toLowerCase() === 'promoter' || row.id) {
          extractedPromoters.push({
            nameEn: row.nameEn || row.name_en || row.NameEn || row.promoter_nameEn || '',
            nameAr: row.nameAr || row.name_ar || row.NameAr || row.promoter_nameAr || '',
            id: row.id || row.ID || row.promoter_id || '',
            nationality: row.nationality ? {
              en: row.nationality.en || row.nationality_en || 'Indian',
              ar: row.nationality.ar || row.nationality_ar || 'هندي'
            } : { en: 'Indian', ar: 'هندي' }
          })
        } else if (entryType.toLowerCase() === 'product' || row.product_nameEn) {
          extractedProducts.push({
            nameEn: row.nameEn || row.product_nameEn || row.ProductNameEn || '',
            nameAr: row.nameAr || row.product_nameAr || row.ProductNameAr || ''
          })
        } else if (entryType.toLowerCase() === 'location' || row.location_nameEn) {
          extractedLocations.push({
            nameEn: row.nameEn || row.location_nameEn || row.LocationNameEn || '',
            nameAr: row.nameAr || row.location_nameAr || row.LocationNameAr || ''
          })
        }
      })
      
      if (workbook.SheetNames.length > 1) {
        workbook.SheetNames.forEach(sheetName => {
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
          
          if (sheetName.toLowerCase().includes('client')) {
            sheetData.forEach((row: any) => {
              extractedFirstParties.push({
                nameEn: row.nameEn || row.name_en || row.NameEn || '',
                nameAr: row.nameAr || row.name_ar || row.NameAr || '',
                crn: row.crn || row.CRN || ''
              })
            })
          } else if (sheetName.toLowerCase().includes('employer')) {
            sheetData.forEach((row: any) => {
              extractedSecondParties.push({
                nameEn: row.nameEn || row.name_en || row.NameEn || '',
                nameAr: row.nameAr || row.name_ar || row.NameAr || '',
                crn: row.crn || row.CRN || ''
              })
            })
          } else if (sheetName.toLowerCase().includes('promoter')) {
            sheetData.forEach((row: any) => {
              extractedPromoters.push({
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
              extractedProducts.push({
                nameEn: row.nameEn || row.name_en || row.NameEn || '',
                nameAr: row.nameAr || row.name_ar || row.NameAr || ''
              })
            })
          } else if (sheetName.toLowerCase().includes('location')) {
            sheetData.forEach((row: any) => {
              extractedLocations.push({
                nameEn: row.nameEn || row.name_en || row.NameEn || '',
                nameAr: row.nameAr || row.name_ar || row.NameAr || ''
              })
            })
          }
        })
      }
      
      console.log('Extracted data from Excel:', {
        firstParties: extractedFirstParties,
        secondParties: extractedSecondParties,
        promoters: extractedPromoters,
        products: extractedProducts,
        locations: extractedLocations
      })
      
      setOptions(prev => ({
        ...prev,
        firstParties: [...prev.firstParties, ...extractedFirstParties],
        secondParties: [...prev.secondParties, ...extractedSecondParties],
        promoters: [...prev.promoters, ...extractedPromoters],
        products: [...prev.products, ...extractedProducts],
        locations: [...prev.locations, ...extractedLocations]
      }))
      
      toast({
        title: language === 'ar' ? 'تمت المعالجة بنجاح' : 'Processed successfully',
        description: language === 'ar' 
          ? `تم تحليل ملف البيانات واستخراج: ${extractedFirstParties.length} عميل، ${extractedSecondParties.length} مشغل، ${extractedPromoters.length} مروج`
          : `Data file processed: ${extractedFirstParties.length} clients, ${extractedSecondParties.length} employers, ${extractedPromoters.length} promoters extracted`,
      })
      
    } catch (error) {
      console.error('Error processing Excel file:', error)
      toast({
        title: language === 'ar' ? 'خطأ في المعالجة' : 'Processing Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء معالجة ملف الإكسل. تأكد من تنسيق الملف'
          : 'An error occurred while processing the Excel file. Check the file format',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    await processExcelFile(file)
  }

  const handleLetterheadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    try {
      setIsLoading(true)
      const newLetterheads = []
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const dataUrl = await handleFileRead(file, 'letterhead')
        
        newLetterheads.push({
          name: file.name,
          dataUrl
        })
      }
      
      setOptions(prev => ({
        ...prev,
        letterheads: [...prev.letterheads, ...newLetterheads]
      }))
      
      toast({
        title: language === 'ar' ? 'تم التحميل بنجاح' : 'Upload Successful',
        description: language === 'ar' 
          ? `تم تحميل ${newLetterheads.length} صورة بنجاح` 
          : `Successfully uploaded ${newLetterheads.length} image(s)`,
      })
    } catch (error) {
      console.error('Error uploading letterhead:', error)
      toast({
        title: language === 'ar' ? 'خطأ في التحميل' : 'Upload Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحميل الصور' : 'An error occurred while uploading images',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromoterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    try {
      setIsLoading(true)
      const newPhotos = []
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i]
        const dataUrl = await handleFileRead(file, 'promoterPhoto')
        
        newPhotos.push({
          name: file.name,
          dataUrl
        })
      }
      
      setOptions(prev => ({
        ...prev,
        promoterPhotos: [...prev.promoterPhotos, ...newPhotos]
      }))
      
      toast({
        title: language === 'ar' ? 'تم التحميل بنجاح' : 'Upload Successful',
        description: language === 'ar' 
          ? `تم تحميل ${newPhotos.length} صورة بنجاح` 
          : `Successfully uploaded ${newPhotos.length} image(s)`,
      })
    } catch (error) {
      console.error('Error uploading promoter photos:', error)
      toast({
        title: language === 'ar' ? 'خطأ في التحميل' : 'Upload Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحميل الصور' : 'An error occurred while uploading images',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateContract = () => {
    const requiredFields = [
      contractData.firstParty.nameEn,
      contractData.secondParty.nameEn,
      contractData.promoter.nameEn,
      contractData.product.nameEn,
      contractData.location.nameEn,
      contractData.startDate.en,
      contractData.endDate.en
    ]
    
    if (requiredFields.some(field => !field)) {
      toast({
        title: language === 'ar' ? 'بيانات غير مكتملة' : 'Incomplete Data',
        description: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }
    
    setShowContract(true)
    toast({
      title: language === 'ar' ? 'تم إنشاء العقد' : 'Contract Generated',
      description: language === 'ar' ? 'تم إنشاء العقد بنجاح' : 'Contract has been generated successfully',
    })
  }

  const handleDownloadPDF = () => {
    if (!showContract) {
      toast({
        title: language === 'ar' ? 'إنشاء العقد أولا' : 'Generate Contract First',
        description: language === 'ar' ? 'يرجى إنشاء العقد أولا قبل تنزيل PDF' : 'Please generate the contract before downloading PDF',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      exportToPDF({
        selector: '.agreement-container',
        filename: `promoter-contract-${contractData.referenceNumber}.pdf`,
        contractData: contractData,
        language: language,
        onSuccess: () => {
          toast({
            title: language === 'ar' ? 'تم التنزيل بنجاح' : 'Download Successful',
            description: language === 'ar' ? 'تم تنزيل ملف PDF بنجاح' : 'PDF file was downloaded successfully',
          })
        },
        onError: (error) => {
          console.error('PDF export error:', error)
          toast({
            title: language === 'ar' ? 'خطأ في التنزيل' : 'Download Error',
            description: language === 'ar' ? 'حدث خطأ أثناء إنشاء ملف PDF' : 'An error occurred while creating the PDF file',
            variant: 'destructive',
          })
        }
      })
    } catch (error) {
      console.error('PDF download error:', error)
      toast({
        title: language === 'ar' ? 'خطأ في التنزيل' : 'Download Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تنزيل ملف PDF' : 'An error occurred while downloading the PDF file',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setContractData({
      referenceNumber: contractData.referenceNumber,
      firstParty: { nameEn: '', nameAr: '', crn: '' },
      secondParty: { nameEn: '', nameAr: '', crn: '' },
      promoter: { nameEn: '', nameAr: '', id: '' },
      product: { nameEn: '', nameAr: '' },
      location: { nameEn: '', nameAr: '' },
      startDate: { en: '', ar: '' },
      endDate: { en: '', ar: '' },
      letterheadImage: null,
      promoterPhoto: null
    })
    setShowContract(false)
    
    toast({
      title: language === 'ar' ? 'تمت إعادة التعيين' : 'Form Reset',
      description: language === 'ar' ? 'تم إعادة تعيين النموذج' : 'The form has been reset',
    })
  }

  const handlePrint = () => {
    if (!showContract) {
      toast({
        title: language === 'ar' ? 'إنشاء العقد أولا' : 'Generate Contract First',
        description: language === 'ar' ? 'يرجى إنشاء العقد أولا قبل الطباعة' : 'Please generate the contract before printing',
        variant: 'destructive',
      })
      return
    }
    
    window.print()
  }

  return {
    language,
    setLanguage,
    contractData,
    setContractData,
    options,
    setOptions,
    showContract,
    isLoading,
    generateReferenceNumber,
    formatDate,
    handleExcelUpload,
    handleLetterheadUpload,
    handlePromoterPhotoUpload,
    handleGenerateContract,
    handleDownloadPDF,
    handleReset,
    handlePrint,
    processExcelFile
  }
}
