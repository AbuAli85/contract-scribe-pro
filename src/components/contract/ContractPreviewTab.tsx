
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Printer, Download } from "lucide-react";
import type { ContractData } from "@/types/contract";

interface ContractPreviewTabProps {
  language: "ar" | "en";
  contractData: ContractData;
  contractId: string;
  isPrinting: boolean;
  onEditClick: () => void;
}

const ContractPreviewTab: React.FC<ContractPreviewTabProps> = ({
  language,
  contractData,
  isPrinting,
  onEditClick,
}) => {
  // Handle print function
  const handlePrint = () => {
    window.print();
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    // This would be implemented with html2canvas and jsPDF
    alert("Download PDF feature will be implemented here");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === "ar" ? "معاينة العقد" : "Contract Preview"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            {language === "ar" ? "طباعة" : "Print"}
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            {language === "ar" ? "تنزيل PDF" : "Download PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="contract-container print-container">
            <div className="a4-page relative bg-white shadow-md rounded-md overflow-hidden" style={{ width: '210mm', height: '297mm' }}>
              {/* Letterhead Background */}
              {contractData.letterheadUrl && (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${contractData.letterheadUrl})`,
                    backgroundSize: "100% auto",
                    backgroundPosition: "top center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.1,
                  }}
                ></div>
              )}

              {/* Contract Content */}
              <div className="relative z-10 p-10">
                {/* Reference Number */}
                <div className="absolute top-8 left-10 text-sm font-bold">
                  Ref: {contractData.referenceNumber}
                </div>

                <div className="mt-20">
                  {/* Promoter Photo */}
                  {contractData.promoterPhotoUrl && (
                    <div className="flex justify-center mb-8">
                      <img
                        src={contractData.promoterPhotoUrl}
                        alt="Promoter ID"
                        className="max-w-[80%] max-h-[150px] object-contain border border-gray-300 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Contract Table */}
                  <table className="w-full border-collapse">
                    <tbody>
                      {/* Contract Title */}
                      <tr>
                        <td className="border border-gray-300 p-2 w-1/2 text-left font-bold bg-gray-50">
                          Promoter Assignment Contract
                        </td>
                        <td className="border border-gray-300 p-2 w-1/2 text-right font-bold bg-gray-50" dir="rtl">
                          عقد تعيين المروج
                        </td>
                      </tr>

                      {/* First Party */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          This contract is between <strong>{contractData.firstParty.nameEn} (First Party)</strong> having the C.R. No.: <strong>{contractData.firstParty.crnEn}</strong>
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          هذا العقد بين <strong>{contractData.firstParty.nameAr} (الطرف الأول)</strong> التي لديها السجل التجاري: <strong>{contractData.firstParty.crnAr}</strong>
                        </td>
                      </tr>

                      {/* Second Party */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          <strong>{contractData.secondParty.nameEn} (Second Party)</strong> having the C.R. No.: <strong>{contractData.secondParty.crnEn}</strong>
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          <strong>{contractData.secondParty.nameAr} (الطرف الثاني)</strong> التي لديها السجل التجاري: <strong>{contractData.secondParty.crnAr}</strong>
                        </td>
                      </tr>

                      {/* Agreement */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          The Second Party agrees to provide The First Party with a qualified promoter to sell ("<strong>{contractData.product.nameEn}</strong>") products at <strong>{contractData.location.nameEn}</strong>.
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          الطرف الثاني يوافق على تزويد الطرف الأول بمروج مؤهل لبيع منتجات "<strong>{contractData.product.nameAr}</strong>" في <strong>{contractData.location.nameAr}</strong>.
                        </td>
                      </tr>

                      {/* Promoter Details */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          <p>
                            <strong>Name:</strong> {contractData.promoter.nameEn}<br/>
                            <strong>ID No:</strong> {contractData.promoter.idEn}<br/>
                            <strong>From:</strong> {contractData.dates.startEn} <strong>to:</strong> {contractData.dates.endEn}
                          </p>
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          <p>
                            <strong>الاسم:</strong> {contractData.promoter.nameAr}<br/>
                            <strong>رقم الهوية:</strong> {contractData.promoter.idAr}<br/>
                            <strong>من:</strong> {contractData.dates.startAr} <strong>إلى:</strong> {contractData.dates.endAr}
                          </p>
                        </td>
                      </tr>

                      {/* Responsibilities */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          <h3 className="font-bold mb-1">Financial and Administrative Responsibilities</h3>
                          <p>
                            The Second Party will bear the entire financial and administrative responsibilities towards this promoter.
                          </p>
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          <h3 className="font-bold mb-1">المسؤوليات والالتزامات المالية</h3>
                          <p>
                            الطرف الثاني سيتحمل كامل المسؤوليات المالية والإدارية تجاه هذا المروج.
                          </p>
                        </td>
                      </tr>

                      {/* Regards */}
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">
                          <p>
                            Best Regards,
                          </p>
                        </td>
                        <td className="border border-gray-300 p-2 text-right" dir="rtl">
                          <p>
                            و تفضلوا بقبول وافر الشكر و التقدير،
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signature Area */}
                <div className="mt-12 flex justify-between">
                  <div className="w-[45%] text-center">
                    <div className="border-b border-gray-300 border-dashed h-10 mb-2"></div>
                    <p className="font-medium">{language === "ar" ? "الطرف الأول" : "First Party"}</p>
                  </div>
                  <div className="w-[45%] text-center">
                    <div className="border-b border-gray-300 border-dashed h-10 mb-2"></div>
                    <p className="font-medium">{language === "ar" ? "الطرف الثاني" : "Second Party"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractPreviewTab;
