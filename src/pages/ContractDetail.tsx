
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrintContainer from "@/components/contract/PrintContainer";
import ContractPage from "@/components/contract/ContractPage";
import ContractContent from "@/components/contract/ContractContent";
import PrintErrorPage from "@/components/contract/PrintErrorPage";
import { supabase } from "@/integrations/supabase/client";
import PrintButton from "@/components/contract/PrintButton";

const ContractDetail = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [signatures, setSignatures] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractId) return;
      
      setLoading(true);
      try {
        // Validate if the ID is a valid UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contractId);
        
        if (!isUuid) {
          // For non-UUID IDs, use a different query approach or display a user-friendly error
          console.log(`Non-UUID contract ID format detected: ${contractId}`);
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
        toast({
          variant: "destructive",
          title: "Error loading contract",
          description: error instanceof Error ? error.message : "Failed to load contract",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractData();
  }, [contractId, toast]);

  // Handle error states
  if (error) {
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
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Contract Error</h3>
              <div className="mt-2 text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="bg-white p-3 rounded border border-red-200">
                  <h4 className="font-semibold text-gray-800 mb-1">What might be wrong?</h4>
                  <ul className="list-disc ml-4 text-sm text-gray-700">
                    <li>The contract ID might be invalid (must be a UUID format)</li>
                    <li>The contract might have been deleted</li>
                    <li>You might not have permission to view this contract</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate('/')} variant="default">
            Go to Dashboard
          </Button>
          <Button onClick={() => window.history.back()} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
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
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تنزيل PDF" : "Download PDF"}
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
