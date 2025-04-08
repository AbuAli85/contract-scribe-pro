
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
}

const ContractPreview = ({ language, contractData }: ContractPreviewProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return format(new Date(year, month - 1, day), "PPP", {
      locale: language === "ar" ? ar : enUS,
    });
  };

  // Format reference number to match PAC-YYYYMMDD-XXXX format
  const formattedRefNumber = () => {
    if (!contractData.refNumber) return "PAC-20250406-9940";

    // Extract date parts from the existing reference number
    const parts = contractData.refNumber.split("-");
    if (parts.length >= 2) {
      const datePart = parts[1];
      const randomPart = parts[2] ? parts[2].padStart(4, "0") : "9940";
      return `PAC-${datePart}-${randomPart}`;
    }

    return `PAC-${contractData.refNumber}`;
  };

  return (
    <div className="contract-preview">
      <Button
        variant="outline"
        onClick={handlePrint}
        className="mb-6 print:hidden flex gap-2 items-center"
      >
        <Printer className="h-4 w-4" />
        <span>{language === "ar" ? "طباعة" : "Print"}</span>
      </Button>

      <div className="a4-page">
        {/* Letterhead background */}
        {contractData.letterhead && (
          <img
            src={contractData.letterhead}
            alt="Letterhead"
            className="letterhead-background"
          />
        )}
        
        <div className="contract-content">
          {/* Reference number with adjusted position */}
          <div className="reference-section">
            <div className="reference-number">
              Reference Number: {formattedRefNumber()}
            </div>
          </div>

          {/* ID Photo - with fixed width of 400px */}
          {contractData.promoterPhoto && (
            <div className="id-photo-container">
              <div className="id-photo-wrapper">
                <img
                  src={contractData.promoterPhoto}
                  alt="Promoter ID"
                  className="id-photo"
                />
              </div>
            </div>
          )}

          {/* Contract Title */}
          <div className="contract-title-area">
            <h1 className="contract-main-title">
              {language === "ar" ? "عقد تعيين المروج" : "Promoter Assignment Contract"}
            </h1>
          </div>

          {/* Two Column Layout - Ensuring they display side by side even in print */}
          <div className="two-column-layout print:!flex">
            {/* Left Column - English */}
            <div className="contract-column">
              <h2 className="contract-title">Contract Details</h2>

              <p className="contract-text">
                This contract is between{" "}
                <strong>
                  {contractData.firstParty?.name?.en || "Falcon Eye Management and Business SPC"} (First Party)
                </strong>{" "}
                having the C.R. No.: <strong>{contractData.firstParty?.crn?.en || "1410869"}</strong>
              </p>

              <p className="contract-text">
                <strong>{contractData.secondParty?.name?.en || "Al Madar Trading LLC"} (Second Party)</strong> having
                the C.R. No.: <strong>{contractData.secondParty?.crn?.en || "1234567"}</strong>
              </p>

              <p className="contract-text">
                The Second Party agrees to provide The First Party with a qualified promoter to sell ("
                <strong>{contractData.product?.en || "Electronics"}</strong>") products at{" "}
                <strong>{contractData.location?.en || "Muscat Grand Mall"}</strong>.
              </p>

              <div className="promoter-details">
                <div className="promoter-info">
                  <div className="info-row">
                    <strong>Name:</strong> {contractData.promoter?.name?.en || "Farzan Riyaz Munde"}
                  </div>
                  <div className="info-row">
                    <strong>ID NO:</strong> {contractData.promoter?.id?.en || "126208869"}
                  </div>
                  <div className="info-row">
                    <strong>From:</strong> {contractData.startDate?.en || "06/04/2025"} <strong>to:</strong>{" "}
                    {contractData.endDate?.en || "06/07/2025"}
                  </div>
                </div>
              </div>

              <div className="responsibilities">
                <h3 className="responsibilities-title">Financial and Administrative Responsibilities</h3>
                <p className="contract-text">
                  The Second Party will bear the entire financial and administrative responsibilities towards this
                  promoter.
                </p>
              </div>

              <p className="best-regards">Best Regards,</p>
            </div>

            {/* Right Column - Arabic */}
            <div className="contract-column rtl">
              <h2 className="contract-title">تفاصيل العقد</h2>

              <p className="contract-text">
                هذا العقد بين{" "}
                <strong>
                  {contractData.firstParty?.name?.ar || "عين الصقر للإدارة و الأعمال ش.م.و"} (الطرف الأول)
                </strong>{" "}
                التي لديها السجل التجاري: <strong>{contractData.firstParty?.crn?.ar || "1410869"}</strong>
              </p>

              <p className="contract-text">
                <strong>{contractData.secondParty?.name?.ar || "المدار للتجارة ش.م.م"} (الطرف الثاني)</strong> التي
                لديها السجل التجاري: <strong>{contractData.secondParty?.crn?.ar || "1234567"}</strong>
              </p>

              <p className="contract-text">
                الطرف الثاني يوافق على تزويد الطرف الأول بمروج مؤهل لبيع منتجات "
                <strong>{contractData.product?.ar || "الإلكترونيات"}</strong>" في{" "}
                <strong>{contractData.location?.ar || "مسقط جراند مول"}</strong>.
              </p>

              <div className="promoter-details">
                <div className="promoter-info">
                  <div className="info-row">
                    <strong>الاسم:</strong> {contractData.promoter?.name?.ar || "فرزان رياض موندي"}
                  </div>
                  <div className="info-row">
                    <strong>رقم الهوية:</strong> {contractData.promoter?.id?.ar || "126208869"}
                  </div>
                  <div className="info-row">
                    <strong>من:</strong> {contractData.startDate?.ar || "06/04/2025"} <strong>إلى:</strong>{" "}
                    {contractData.endDate?.ar || "06/06/2025"}
                  </div>
                </div>
              </div>

              <div className="responsibilities">
                <h3 className="responsibilities-title">المسؤوليات والالتزامات المالية</h3>
                <p className="contract-text">
                  الطرف الثاني سيتحمل كامل المسؤوليات المالية والإدارية تجاه هذا المروج.
                </p>
              </div>

              <p className="best-regards">و تفضلوا بقبول وافر الشكر و التقدير،</p>
            </div>
          </div>

          {/* Signature Area */}
          <div className="signature-area">
            <div className="signature-block">
              <div className="signature-line"></div>
              <div className="text-center text-sm">Client (عميل) الطرف الأول</div>
            </div>
            <div className="signature-block">
              <div className="signature-line"></div>
              <div className="text-center text-sm">Employer (مشغل) الطرف الثاني</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
