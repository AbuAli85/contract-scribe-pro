
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatContractDate } from '@/utils/contract/dateFormatter'
import { handleFileRead } from '@/utils/file/fileReader'
import { processExcelData } from '@/utils/excel/excelProcessor'
import { exportContractToPDF } from '@/utils/contract/contractExporter'
import { generateContractReferenceNumber } from '@/utils/contract/referenceGenerator'
import type { ContractData, ContractOptions } from '@/types/contract'

export function useContractCreator() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [contractData, setContractData] = useState<ContractData>({
    referenceNumber: '',
    firstParty: { nameEn: '', nameAr: '', crn: '' },
    secondParty: { nameEn: '', nameAr: '', crn: '' },
    employer: { nameEn: '', nameAr: '', crn: '' },
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
    employers: [],
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
    const refNumber = generateContractReferenceNumber()
    setContractData(prev => ({
      ...prev,
      referenceNumber: refNumber
    }))
  }, [])

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    await processExcelFile(file)
  }

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true)
      
      const data = await handleFileRead(file, 'excel')
      const { 
        firstParties: extractedFirstParties,
        secondParties: extractedSecondParties,
        employers: extractedEmployers,
        promoters: extractedPromoters,
        products: extractedProducts,
        locations: extractedLocations
      } = await processExcelData(data)
      
      setOptions(prev => ({
        ...prev,
        firstParties: [...prev.firstParties, ...extractedFirstParties],
        secondParties: [...prev.secondParties, ...extractedSecondParties],
        employers: [...prev.employers, ...extractedEmployers],
        promoters: [...prev.promoters, ...extractedPromoters],
        products: [...prev.products, ...extractedProducts],
        locations: [...prev.locations, ...extractedLocations]
      }))
      
      toast({
        title: language === 'ar' ? 'تمت المعالجة بنجاح' : 'Processed successfully',
        description: language === 'ar' 
          ? `تم تحليل ملف البيانات واستخراج: ${extractedFirstParties.length} عميل، ${extractedEmployers.length} مشغل، ${extractedPromoters.length} مروج`
          : `Data file processed: ${extractedFirstParties.length} clients, ${extractedEmployers.length} employers, ${extractedPromoters.length} promoters extracted`,
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
      exportContractToPDF({
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
      employer: { nameEn: '', nameAr: '', crn: '' },
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
    formatDate: formatContractDate,
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
