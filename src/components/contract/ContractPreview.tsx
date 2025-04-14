
"use client"

import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface ContractPreviewProps {
  clientName: string
  promoterName: string
  productName: string
  locationName: string
  referenceNumber: string
  letterheadUrl?: string
  promoterPhotoUrl?: string
  startDate?: string
  endDate?: string
}

export default function ContractPreview({
  clientName,
  promoterName,
  productName,
  locationName,
  referenceNumber,
  letterheadUrl,
  promoterPhotoUrl,
  startDate,
  endDate,
}: ContractPreviewProps) {
  const contractRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!contractRef.current) return

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`contract_${referenceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contract Preview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={generatePDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none">
        <div
          ref={contractRef}
          className="w-full aspect-[1/1.414] bg-white relative overflow-hidden"
          style={{
            backgroundImage: letterheadUrl ? `url(${letterheadUrl})` : "none",
            backgroundSize: "contain",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Contract Header */}
          <div className="p-8 pt-16">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Promoter Agreement</h1>
                <h2 className="text-xl font-bold text-right mb-1 rtl">اتفاقية مروج</h2>
                <p className="text-sm">Reference: {referenceNumber}</p>
              </div>

              {promoterPhotoUrl && (
                <div className="w-24 h-32 border border-gray-300">
                  <img
                    src={promoterPhotoUrl || "/placeholder.svg"}
                    alt="Promoter"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Contract Body - Bilingual */}
            <div className="mt-8 space-y-6">
              {/* English Section */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-1">Agreement Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">First Party:</p>
                    <p>{clientName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Second Party:</p>
                    <p>{promoterName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Product:</p>
                    <p>{productName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location:</p>
                    <p>{locationName || "N/A"}</p>
                  </div>
                  {startDate && endDate && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Duration:</p>
                      <p>
                        From {startDate} to {endDate}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm">
                    This agreement is made between the First Party and the Second Party for the promotion of the
                    specified product at the designated location. The Second Party agrees to promote the product
                    according to the terms and conditions set forth in this agreement.
                  </p>
                </div>
              </div>

              {/* Arabic Section */}
              <div className="space-y-4 text-right rtl">
                <h3 className="font-bold border-b pb-1">تفاصيل الاتفاقية</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">الطرف الأول:</p>
                    <p>{clientName || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">الطرف الثاني:</p>
                    <p>{promoterName || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">المنتج:</p>
                    <p>{productName || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">الموقع:</p>
                    <p>{locationName || "غير متوفر"}</p>
                  </div>
                  {startDate && endDate && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">المدة:</p>
                      <p>
                        من {startDate} إلى {endDate}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm">
                    تم إبرام هذه الاتفاقية بين الطرف الأول والطرف الثاني لترويج المنتج المحدد في الموقع المعين. يوافق
                    الطرف الثاني على ترويج المنتج وفقًا للشروط والأحكام المنصوص عليها في هذه الاتفاقية.
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <p className="font-medium">First Party Signature:</p>
                  <div className="h-16 border-b border-dashed border-gray-400 mt-8"></div>
                </div>
                <div className="text-right">
                  <p className="font-medium rtl">توقيع الطرف الأول:</p>
                  <div className="h-16 border-b border-dashed border-gray-400 mt-8"></div>
                </div>
                <div>
                  <p className="font-medium">Second Party Signature:</p>
                  <div className="h-16 border-b border-dashed border-gray-400 mt-8"></div>
                </div>
                <div className="text-right">
                  <p className="font-medium rtl">توقيع الطرف الثاني:</p>
                  <div className="h-16 border-b border-dashed border-gray-400 mt-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
