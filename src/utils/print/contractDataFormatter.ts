
import { ContractData } from "@/lib/types"

/**
 * Creates a simplified version of the contract data with default values for printing
 */
export function formatContractDataForPrint(contractData: ContractData | null): any {
  if (!contractData) return null
  
  return {
    refNumber: contractData?.refNumber || "N/A",
    firstParty: {
      name: {
        en: contractData?.firstParty?.name?.en || "N/A",
        ar: contractData?.firstParty?.name?.ar || "N/A",
      },
      crn: {
        en: contractData?.firstParty?.crn?.en || "N/A",
        ar: contractData?.firstParty?.crn?.ar || "N/A",
      },
    },
    secondParty: {
      name: {
        en: contractData?.secondParty?.name?.en || "N/A",
        ar: contractData?.secondParty?.name?.ar || "N/A",
      },
      crn: {
        en: contractData?.secondParty?.crn?.en || "N/A",
        ar: contractData?.secondParty?.crn?.ar || "N/A",
      },
    },
    promoter: {
      name: {
        en: contractData?.promoter?.name?.en || "N/A",
        ar: contractData?.promoter?.name?.ar || "N/A",
      },
      id: {
        en: contractData?.promoter?.id?.en || "N/A",
        ar: contractData?.promoter?.id?.ar || "N/A",
      },
    },
    product: {
      en: contractData?.product?.en || "N/A",
      ar: contractData?.product?.ar || "N/A",
    },
    location: {
      en: contractData?.location?.en || "N/A",
      ar: contractData?.location?.ar || "N/A",
    },
    startDate: {
      en: contractData?.startDate?.en || "N/A",
      ar: contractData?.startDate?.ar || "N/A",
    },
    endDate: {
      en: contractData?.endDate?.en || "N/A",
      ar: contractData?.endDate?.ar || "N/A",
    },
    letterhead: contractData?.letterhead || null,
    promoterPhoto: contractData?.promoterPhoto || null,
  }
}
