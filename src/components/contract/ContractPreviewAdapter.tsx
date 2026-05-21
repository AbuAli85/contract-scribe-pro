
import ContractPreview from "@/components/contract/ContractPreview"
import type { ContractData } from "@/types/contract"

interface ContractPreviewAdapterProps {
  contractData: ContractData
  language: "ar" | "en"
}

export default function ContractPreviewAdapter({ contractData, language }: ContractPreviewAdapterProps) {
  const clientName = language === "ar" 
    ? contractData.firstParty.nameAr 
    : contractData.firstParty.nameEn
  
  const promoterName = language === "ar" 
    ? contractData.promoter.nameAr 
    : contractData.promoter.nameEn
  
  const productName = language === "ar" 
    ? contractData.product.nameAr 
    : contractData.product.nameEn
  
  const locationName = language === "ar" 
    ? contractData.location.nameAr 
    : contractData.location.nameEn
  
  const startDate = language === "ar" 
    ? contractData.dates.startAr 
    : contractData.dates.startEn
  
  const endDate = language === "ar" 
    ? contractData.dates.endAr 
    : contractData.dates.endEn

  return (
    <ContractPreview
      clientName={clientName}
      promoterName={promoterName}
      productName={productName}
      locationName={locationName}
      referenceNumber={contractData.referenceNumber}
      letterheadUrl={contractData.letterheadUrl}
      promoterPhotoUrl={contractData.promoterPhotoUrl}
      startDate={startDate}
      endDate={endDate}
    />
  )
}
