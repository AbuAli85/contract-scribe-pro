
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface EnglishContractColumnProps {
  contractData: any;
}

const EnglishContractColumn = ({ contractData }: EnglishContractColumnProps) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    const [day, month, year] = dateStr.split('/').map(Number);
    return format(new Date(year, month - 1, day), "PPP", {
      locale: enUS,
    });
  };

  return (
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
  );
};

export default EnglishContractColumn;
