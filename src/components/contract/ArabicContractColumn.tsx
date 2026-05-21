
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ArabicContractColumnProps {
  contractData: any;
}

const ArabicContractColumn = ({ contractData }: ArabicContractColumnProps) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    // Check if the date is in DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return format(new Date(year, month - 1, day), "PPP", {
        locale: ar,
      });
    }
    
    // Handle ISO format
    try {
      return format(new Date(dateStr), "PPP", {
        locale: ar,
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
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
        <strong>{contractData.location?.ar || "الخوير، مسقط"}</strong>.
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
            <strong>الجنسية:</strong> {contractData.promoter?.nationality?.ar || "هندي"}
          </div>
          <div className="info-row">
            <strong>من:</strong> {formatDate(contractData.startDate?.ar || "06/04/2025")} <strong>إلى:</strong>{" "}
            {formatDate(contractData.endDate?.ar || "06/06/2025")}
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
  );
};

export default ArabicContractColumn;
