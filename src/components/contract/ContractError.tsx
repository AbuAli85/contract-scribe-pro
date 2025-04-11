
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, FileText } from "lucide-react";

interface ContractErrorProps {
  errorTitle?: string;
  errorMessage: string;
  invalidId?: string;
}

const ContractError: React.FC<ContractErrorProps> = ({
  errorTitle = "Contract Error",
  errorMessage,
  invalidId
}) => {
  const navigate = useNavigate();

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
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">{errorTitle}</h3>
            <div className="mt-2 text-red-700">
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">What might be wrong?</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>The contract ID might be invalid (must be a UUID format)</li>
          {invalidId && (
            <li>
              You tried to access: <code className="bg-gray-100 px-2 py-1 rounded">{invalidId}</code> which is not a valid UUID
            </li>
          )}
          <li>The contract might have been deleted</li>
          <li>You might not have permission to view this contract</li>
        </ul>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button variant="default" onClick={() => navigate('/')} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default ContractError;
