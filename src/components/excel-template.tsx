
import React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export function ExcelTemplate() {
  const handleDownloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Define the headers and create a worksheet
    const headers = [
      "FirstPartyNameEn",
      "FirstPartyNameAr",
      "FirstPartyCRNEn",
      "FirstPartyCRNAr",
      "SecondPartyNameEn",
      "SecondPartyNameAr",
      "SecondPartyCRNEn",
      "SecondPartyCRNAr",
      "PromoterNameEn",
      "PromoterNameAr",
      "PromoterIDEn",
      "PromoterIDAr",
      "ProductNameEn",
      "ProductNameAr",
      "LocationNameEn",
      "LocationNameAr",
      "StartDateEn",
      "StartDateAr",
      "EndDateEn",
      "EndDateAr"
    ]
    
    // Create sample data row
    const sampleData = {
      FirstPartyNameEn: "First Company Ltd.",
      FirstPartyNameAr: "الشركة الأولى المحدودة",
      FirstPartyCRNEn: "CR123456789",
      FirstPartyCRNAr: "س.ت ١٢٣٤٥٦٧٨٩",
      SecondPartyNameEn: "Second Company Ltd.",
      SecondPartyNameAr: "الشركة الثانية المحدودة",
      SecondPartyCRNEn: "CR987654321",
      SecondPartyCRNAr: "س.ت ٩٨٧٦٥٤٣٢١",
      PromoterNameEn: "John Doe",
      PromoterNameAr: "جون دو",
      PromoterIDEn: "ID12345678",
      PromoterIDAr: "هوية ١٢٣٤٥٦٧٨",
      ProductNameEn: "Sample Product",
      ProductNameAr: "منتج نموذجي",
      LocationNameEn: "Riyadh Mall",
      LocationNameAr: "مول الرياض",
      StartDateEn: "01/04/2023",
      StartDateAr: "٠١/٠٤/٢٠٢٣",
      EndDateEn: "01/04/2024",
      EndDateAr: "٠١/٠٤/٢٠٢٤"
    }
    
    // Create the worksheet with headers and sample data
    const ws = XLSX.utils.json_to_sheet([sampleData], { header: headers })
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Contract Data")
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, "contract_template.xlsx")
  }
  
  return (
    <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
      <Download className="h-3.5 w-3.5 mr-1.5" />
      Download Template
    </Button>
  )
}
