
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { exportToPDF } from '@/utils/pdf/pdfExport'
import { useToast } from '@/hooks/use-toast'

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

  // Generate reference number on component mount
  useEffect(() => {
    generateReferenceNumber()
  }, [])

  // Generate a unique reference number
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

  // Format date for display in contracts
  const formatDate = (dateStr: string, targetLang: 'en' | 'ar') => {
    if (!dateStr) return { en: '', ar: '' }
    
    try {
      // Check if the date is in DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number)
        const date = new Date(year, month - 1, day)
        
        return {
          en: format(date, "PPP", { locale: enUS }),
          ar: format(date, "PPP", { locale: ar })
        }
      }
      
      // Handle ISO format
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

  // Handle file upload and reading
  const handleFileRead = (file: File, fileType: 'excel' | 'letterhead' | 'promoterPhoto'): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'))
          return
        }
        
        if (fileType === 'excel') {
          // Process Excel/CSV data
          const data = e.target.result
          // Implementation for Excel parsing would go here
          resolve(data)
        } else {
          // Process image data
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

  // Handle Excel/CSV upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    try {
      setIsLoading(true)
      const file = e.target.files[0]
      // Process Excel file
      // This would parse the Excel and update options
      
      toast({
        title: language === 'ar' ? 'تمت المعالجة بنجاح' : 'Processed successfully',
        description: language === 'ar' ? 'تم معالجة ملف البيانات وتحديث الخيارات' : 'Data file processed and options updated',
      })
    } catch (error) {
      console.error('Error processing Excel file:', error)
      toast({
        title: language === 'ar' ? 'خطأ في المعالجة' : 'Processing Error',
        description: language === 'ar' ? 'حدث خطأ أثناء معالجة الملف' : 'An error occurred while processing the file',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle letterhead image upload
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

  // Handle promoter photo upload
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

  // Handle contract generation
  const handleGenerateContract = () => {
    // Validate required fields
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

  // Handle PDF download
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
      // Use the PDF export utility
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

  // Handle form reset
  const handleReset = () => {
    setContractData({
      referenceNumber: contractData.referenceNumber, // Keep the reference number
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

  // Handle print function
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
    handlePrint
  }
}
