
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrintContainer from "@/components/contract/PrintContainer";
import ContractPage from "@/components/contract/ContractPage";
import ContractContent from "@/components/contract/ContractContent";
import PrintErrorPage from "@/components/contract/PrintErrorPage";
import ContractError from "@/components/contract/ContractError";
import { supabase } from "@/integrations/supabase/client";
import PrintButton from "@/components/contract/PrintButton";
import { isValidUUID } from "@/lib/utils";
import { exportToPDF } from "@/utils/pdf/pdfExport";

const ContractDetail = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) return;
      
      setLoading(true);
      try {
        // Validate if the ID is a valid UUID
        if (!isValidUUID(contractId)) {
          throw new Error(`The contract ID format is invalid. Please use a valid UUID format instead of "${contractId}".`);
        }
        
        // Fetch contract data
        const { data: contract, error: contractError } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contractId)
          .maybeSingle();
        
        if (contractError) {
          throw new Error(contractError.message);
        }
        
        if (!contract) {
          throw new Error(`Contract with ID "${contractId}" not found`);
        }
        
        // Fetch signatures
        const { data: signaturesData, error: signaturesError } = await supabase
          .from("signatories")
          .select("*")
          .eq("contract_id", contractId);
        
        if (signaturesError) {
          console.error("Error fetching signatures:", signaturesError);
        }
        
        setContractData(contract);
        setSignatures(signaturesData || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching contract:", error);
        setError(error instanceof Error ? error.message : "Failed to load contract");
        
        // We'll show the error in the ContractError component instead of a toast
        // to avoid duplicate error messages
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractData();
  }, [contractId]);

  // Handle downloading PDF
  const handleDownloadPDF = async () => {
    if (!contractData || !contractId) {
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "Contract data is missing or invalid",
      });
      return;
    }

    // Validate contract ID format again before export
    if (!isValidUUID(contractId)) {
      toast({
        variant: "destructive",
        title: "Invalid Contract ID",
        description: `The contract ID format is invalid. Please use a valid UUID format instead of "${contractId}".`,
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF({
        selector: '.print-container',
        filename: `contract-${contractData.ref_number || contractId}.pdf`,
        language: contractData?.language || "en",
        contractData,
        includePassport: true
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle error states - use the dedicated ContractError component
  if (error) {
    return <ContractError errorMessage={error} invalidId={contractId} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="mb-4">
              <div className="h-16 w-16 border-4 border-t-primary animate-spin rounded-full mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold">Loading contract...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Determine the language
  const language = contractData?.language || "en";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            {language === "ar" ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "تفاصيل العقد" : "Contract Details"}
        </h1>
        <div className="flex gap-2">
          <PrintButton
            language={language as "ar" | "en"}
            contractData={contractData}
            contractId={contractId}
          />
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <span className="h-4 w-4 border-2 border-t-primary animate-spin rounded-full"></span>
                {language === "ar" ? "جارٍ التصدير..." : "Exporting..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {language === "ar" ? "تنزيل PDF" : "Download PDF"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border rounded p-4">
            <h3 className="font-medium text-gray-500 mb-1">
              {language === "ar" ? "رقم المرجع" : "Reference Number"}
            </h3>
            <p className="font-bold">{contractData.ref_number}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-medium text-gray-500 mb-1">
              {language === "ar" ? "الحالة" : "Status"}
            </h3>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              contractData.status === "draft" ? "bg-yellow-100 text-yellow-800" : 
              contractData.status === "active" ? "bg-green-100 text-green-800" : 
              "bg-gray-100 text-gray-800"
            }`}>
              {contractData.status === "draft" ? (language === "ar" ? "مسودة" : "Draft") : 
               contractData.status === "active" ? (language === "ar" ? "نشط" : "Active") : 
               contractData.status}
            </div>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-medium text-gray-500 mb-1">
              {language === "ar" ? "تاريخ العقد" : "Contract Date"}
            </h3>
            <p>{new Date(contractData.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === "ar" ? "معاينة العقد" : "Contract Preview"}
          </h2>
          
          <PrintContainer>
            <ContractPage contractData={contractData}>
              <ContractContent 
                language={language as "ar" | "en"} 
                contractData={contractData} 
                signatures={signatures} 
              />
            </ContractPage>
          </PrintContainer>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
