
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"
import type { ContractData } from "@/types/contract"
import { ExcelTemplate } from "@/components/excel-template"

interface ContractFormProps {
  language: "ar" | "en"
  contractData: ContractData
  onUpdateContractData: (data: Partial<ContractData>) => void
  onGenerateContract: () => void
  onReset: () => void
}

export default function ContractForm({
  language,
  contractData,
  onUpdateContractData,
  onGenerateContract,
  onReset,
}: ContractFormProps) {
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null)
  const [promoterPhotoFile, setPromoterPhotoFile] = useState<File | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)

  // Handle Excel file upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExcelFile(file)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

        if (jsonData.length > 0) {
          const firstRow = jsonData[0]

          // Update contract data based on Excel columns
          const updatedData: Partial<ContractData> = {
            firstParty: { ...contractData.firstParty },
            secondParty: { ...contractData.secondParty },
            promoter: { ...contractData.promoter },
            product: { ...contractData.product },
            location: { ...contractData.location },
            dates: { ...contractData.dates },
          }

          // First Party
          if (firstRow.FirstPartyNameEn) updatedData.firstParty!.nameEn = firstRow.FirstPartyNameEn
          if (firstRow.FirstPartyNameAr) updatedData.firstParty!.nameAr = firstRow.FirstPartyNameAr
          if (firstRow.FirstPartyCRNEn) updatedData.firstParty!.crnEn = firstRow.FirstPartyCRNEn
          if (firstRow.FirstPartyCRNAr) updatedData.firstParty!.crnAr = firstRow.FirstPartyCRNAr

          // Second Party
          if (firstRow.SecondPartyNameEn) updatedData.secondParty!.nameEn = firstRow.SecondPartyNameEn
          if (firstRow.SecondPartyNameAr) updatedData.secondParty!.nameAr = firstRow.SecondPartyNameAr
          if (firstRow.SecondPartyCRNEn) updatedData.secondParty!.crnEn = firstRow.SecondPartyCRNEn
          if (firstRow.SecondPartyCRNAr) updatedData.secondParty!.crnAr = firstRow.SecondPartyCRNAr

          // Promoter
          if (firstRow.PromoterNameEn) updatedData.promoter!.nameEn = firstRow.PromoterNameEn
          if (firstRow.PromoterNameAr) updatedData.promoter!.nameAr = firstRow.PromoterNameAr
          if (firstRow.PromoterIDEn) updatedData.promoter!.idEn = firstRow.PromoterIDEn
          if (firstRow.PromoterIDAr) updatedData.promoter!.idAr = firstRow.PromoterIDAr

          // Product
          if (firstRow.ProductNameEn) updatedData.product!.nameEn = firstRow.ProductNameEn
          if (firstRow.ProductNameAr) updatedData.product!.nameAr = firstRow.ProductNameAr

          // Location
          if (firstRow.LocationNameEn) updatedData.location!.nameEn = firstRow.LocationNameEn
          if (firstRow.LocationNameAr) updatedData.location!.nameAr = firstRow.LocationNameAr

          // Dates
          if (firstRow.StartDateEn) updatedData.dates!.startEn = firstRow.StartDateEn
          if (firstRow.StartDateAr) updatedData.dates!.startAr = firstRow.StartDateAr
          if (firstRow.EndDateEn) updatedData.dates!.endEn = firstRow.EndDateEn
          if (firstRow.EndDateAr) updatedData.dates!.endAr = firstRow.EndDateAr

          onUpdateContractData(updatedData)
        }
      } catch (error) {
        console.error("Error processing Excel file:", error)
      }
    }
    reader.readAsBinaryString(file)
  }

  // Handle letterhead file upload
  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLetterheadFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateContractData({ letterheadUrl: event.target.result as string })
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle promoter photo upload
  const handlePromoterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPromoterPhotoFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateContractData({ promoterPhotoUrl: event.target.result as string })
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle first party input
  const handleFirstPartyInput = (field: string, value: string) => {
    onUpdateContractData({
      firstParty: {
        ...contractData.firstParty,
        [field]: value,
      },
    })
  }

  // Handle second party input
  const handleSecondPartyInput = (field: string, value: string) => {
    onUpdateContractData({
      secondParty: {
        ...contractData.secondParty,
        [field]: value,
      },
    })
  }

  // Handle promoter input
  const handlePromoterInput = (field: string, value: string) => {
    onUpdateContractData({
      promoter: {
        ...contractData.promoter,
        [field]: value,
      },
    })
  }

  // Handle product input
  const handleProductInput = (field: string, value: string) => {
    onUpdateContractData({
      product: {
        ...contractData.product,
        [field]: value,
      },
    })
  }

  // Handle location input
  const handleLocationInput = (field: string, value: string) => {
    onUpdateContractData({
      location: {
        ...contractData.location,
        [field]: value,
      },
    })
  }

  // Handle dates input
  const handleDatesInput = (field: string, value: string) => {
    onUpdateContractData({
      dates: {
        ...contractData.dates,
        [field]: value,
      },
    })
  }

  // Generate reference number
  useEffect(() => {
    if (contractData.firstParty.nameEn && contractData.secondParty.nameEn) {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      // Extract initials
      const firstPartyInitial = contractData.firstParty.nameEn.charAt(0).toUpperCase()
      const secondPartyInitial = contractData.secondParty.nameEn.charAt(0).toUpperCase()

      // Generate random 4-digit number
      const randomNum = Math.floor(1000 + Math.random() * 9000)

      onUpdateContractData({
        referenceNumber: `${firstPartyInitial}${secondPartyInitial}-${year}${month}${day}-${randomNum}`,
      })
    }
  }, [contractData.firstParty.nameEn, contractData.secondParty.nameEn, onUpdateContractData])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">{language === "ar" ? "بيانات العقد" : "Contract Data"}</h2>

          {/* Excel Upload */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="excelUpload">{language === "ar" ? "تحميل ملف Excel:" : "Upload Excel File:"}</Label>
                <ExcelTemplate />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="excelUpload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="flex-1"
                />
                <Button type="button" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "قم بتحميل ملف Excel يحتوي على بيانات العقد"
                  : "Upload an Excel file containing contract data"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reference Number */}
            <div className="space-y-2">
              <Label>{language === "ar" ? "رقم المرجع:" : "Reference Number:"}</Label>
              <div className="p-2 bg-muted rounded-md font-bold text-primary">
                {contractData.referenceNumber || "-"}
              </div>
            </div>

            {/* First Party */}
            <div className="space-y-2">
              <Label htmlFor="firstPartyNameEn">
                {language === "ar" ? "اسم الطرف الأول (بالإنجليزية):" : "First Party Name (English):"}
              </Label>
              <Input
                id="firstPartyNameEn"
                value={contractData.firstParty.nameEn}
                onChange={(e) => handleFirstPartyInput("nameEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstPartyNameAr">
                {language === "ar" ? "اسم الطرف الأول (بالعربية):" : "First Party Name (Arabic):"}
              </Label>
              <Input
                id="firstPartyNameAr"
                value={contractData.firstParty.nameAr}
                onChange={(e) => handleFirstPartyInput("nameAr", e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstPartyCRN">
                {language === "ar" ? "رقم السجل التجاري (بالإنجليزية):" : "Commercial Registration No. (English):"}
              </Label>
              <Input
                id="firstPartyCRN"
                value={contractData.firstParty.crnEn}
                onChange={(e) => handleFirstPartyInput("crnEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstPartyCRNAr">
                {language === "ar" ? "رقم السجل التجاري (بالعربية):" : "Commercial Registration No. (Arabic):"}
              </Label>
              <Input
                id="firstPartyCRNAr"
                value={contractData.firstParty.crnAr}
                onChange={(e) => handleFirstPartyInput("crnAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Second Party */}
            <div className="space-y-2">
              <Label htmlFor="secondPartyNameEn">
                {language === "ar" ? "اسم الطرف الثاني (بالإنجليزية):" : "Second Party Name (English):"}
              </Label>
              <Input
                id="secondPartyNameEn"
                value={contractData.secondParty.nameEn}
                onChange={(e) => handleSecondPartyInput("nameEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondPartyNameAr">
                {language === "ar" ? "اسم الطرف الثاني (بالعربية):" : "Second Party Name (Arabic):"}
              </Label>
              <Input
                id="secondPartyNameAr"
                value={contractData.secondParty.nameAr}
                onChange={(e) => handleSecondPartyInput("nameAr", e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondPartyCRN">
                {language === "ar" ? "رقم السجل التجاري (بالإنجليزية):" : "Commercial Registration No. (English):"}
              </Label>
              <Input
                id="secondPartyCRN"
                value={contractData.secondParty.crnEn}
                onChange={(e) => handleSecondPartyInput("crnEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondPartyCRNAr">
                {language === "ar" ? "رقم السجل التجاري (بالعربية):" : "Commercial Registration No. (Arabic):"}
              </Label>
              <Input
                id="secondPartyCRNAr"
                value={contractData.secondParty.crnAr}
                onChange={(e) => handleSecondPartyInput("crnAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Promoter */}
            <div className="space-y-2">
              <Label htmlFor="promoterNameEn">
                {language === "ar" ? "اسم المروج (بالإنجليزية):" : "Promoter Name (English):"}
              </Label>
              <Input
                id="promoterNameEn"
                value={contractData.promoter.nameEn}
                onChange={(e) => handlePromoterInput("nameEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoterNameAr">
                {language === "ar" ? "اسم المروج (بالعربية):" : "Promoter Name (Arabic):"}
              </Label>
              <Input
                id="promoterNameAr"
                value={contractData.promoter.nameAr}
                onChange={(e) => handlePromoterInput("nameAr", e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoterIDEn">
                {language === "ar" ? "رقم الهوية (بالإنجليزية):" : "ID Number (English):"}
              </Label>
              <Input
                id="promoterIDEn"
                value={contractData.promoter.idEn}
                onChange={(e) => handlePromoterInput("idEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoterIDAr">
                {language === "ar" ? "رقم الهوية (بالعربية):" : "ID Number (Arabic):"}
              </Label>
              <Input
                id="promoterIDAr"
                value={contractData.promoter.idAr}
                onChange={(e) => handlePromoterInput("idAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="productNameEn">
                {language === "ar" ? "اسم المنتج (بالإنجليزية):" : "Product Name (English):"}
              </Label>
              <Input
                id="productNameEn"
                value={contractData.product.nameEn}
                onChange={(e) => handleProductInput("nameEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productNameAr">
                {language === "ar" ? "اسم المنتج (بالعربية):" : "Product Name (Arabic):"}
              </Label>
              <Input
                id="productNameAr"
                value={contractData.product.nameAr}
                onChange={(e) => handleProductInput("nameAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="locationNameEn">
                {language === "ar" ? "اسم الموقع (بالإنجليزية):" : "Location Name (English):"}
              </Label>
              <Input
                id="locationNameEn"
                value={contractData.location.nameEn}
                onChange={(e) => handleLocationInput("nameEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationNameAr">
                {language === "ar" ? "اسم الموقع (بالعربية):" : "Location Name (Arabic):"}
              </Label>
              <Input
                id="locationNameAr"
                value={contractData.location.nameAr}
                onChange={(e) => handleLocationInput("nameAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Contract Dates */}
            <div className="space-y-2">
              <Label htmlFor="startDateEn">
                {language === "ar" ? "تاريخ البدء (بالإنجليزية):" : "Start Date (English):"}
              </Label>
              <Input
                id="startDateEn"
                value={contractData.dates.startEn}
                onChange={(e) => handleDatesInput("startEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDateAr">
                {language === "ar" ? "تاريخ البدء (بالعربية):" : "Start Date (Arabic):"}
              </Label>
              <Input
                id="startDateAr"
                value={contractData.dates.startAr}
                onChange={(e) => handleDatesInput("startAr", e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDateEn">
                {language === "ar" ? "تاريخ الانتهاء (بالإنجليزية):" : "End Date (English):"}
              </Label>
              <Input
                id="endDateEn"
                value={contractData.dates.endEn}
                onChange={(e) => handleDatesInput("endEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDateAr">
                {language === "ar" ? "تاريخ الانتهاء (بالعربية):" : "End Date (Arabic):"}
              </Label>
              <Input
                id="endDateAr"
                value={contractData.dates.endAr}
                onChange={(e) => handleDatesInput("endAr", e.target.value)}
                className="text-right"
              />
            </div>

            {/* Letterhead Upload */}
            <div className="space-y-2">
              <Label htmlFor="letterheadUpload">{language === "ar" ? "صورة الخلفية:" : "Letterhead Image:"}</Label>
              <Input id="letterheadUpload" type="file" accept="image/*" onChange={handleLetterheadUpload} />
              {contractData.letterheadUrl && (
                <div className="mt-2 border rounded p-2">
                  <img
                    src={contractData.letterheadUrl || "/placeholder.svg"}
                    alt="Letterhead"
                    className="max-h-40 mx-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Promoter Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="promoterPhotoUpload">{language === "ar" ? "صورة المروج:" : "Promoter Photo:"}</Label>
              <Input id="promoterPhotoUpload" type="file" accept="image/*" onChange={handlePromoterPhotoUpload} />
              {contractData.promoterPhotoUrl && (
                <div className="mt-2 border rounded p-2">
                  <img
                    src={contractData.promoterPhotoUrl || "/placeholder.svg"}
                    alt="Promoter Photo"
                    className="max-h-40 mx-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={onGenerateContract} className="min-w-[150px]">
          {language === "ar" ? "توليد العقد" : "Generate Contract"}
        </Button>
        <Button variant="outline" onClick={onReset} className="min-w-[150px]">
          {language === "ar" ? "إعادة تعيين" : "Reset"}
        </Button>
      </div>
    </div>
  )
}
