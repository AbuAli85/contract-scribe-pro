
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText, ArrowLeft, Info, Database } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if the user was trying to access a contract
  const isContractPath = location.pathname.includes('/contract');
  
  // Check if there's a specific ID pattern that looks like a non-UUID format
  const contractIdMatch = location.pathname.match(/\/contracts\/([^\/]+)/);
  const invalidContractId = contractIdMatch ? contractIdMatch[1] : null;
  const isLikelyInvalidUuid = invalidContractId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invalidContractId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
          <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
          
          {isContractPath && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <p className="text-blue-700 mb-2">
                <strong>Looking for a contract?</strong>
              </p>
              <p className="text-blue-600 text-sm mb-2">
                Make sure you're using the correct format: <code>/contracts/[contract-id]</code>
              </p>
              <p className="text-blue-600 text-sm">
                Contract IDs must be in valid UUID format
              </p>
            </div>
          )}
          
          {isLikelyInvalidUuid && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-amber-700 mb-2 font-medium">
                    Invalid Contract ID Format
                  </p>
                  <p className="text-amber-600 text-sm mb-2">
                    The contract ID <code>"{invalidContractId}"</code> is not in the required UUID format.
                  </p>
                  <p className="text-amber-600 text-sm">
                    Contract IDs must be valid UUIDs, for example: <br />
                    <code className="bg-white px-1 py-0.5 rounded border border-amber-200">
                      123e4567-e89b-12d3-a456-426614174000
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLikelyInvalidUuid && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-blue-700 mb-2 font-medium">
                    Why UUIDs?
                  </p>
                  <p className="text-blue-600 text-sm mb-2">
                    Our database requires UUID format for security and consistency reasons.
                  </p>
                  <p className="text-blue-600 text-sm">
                    You can access contracts from the dashboard where all valid IDs are properly formatted.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Link to="/">
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </Link>
            
            {isContractPath && (
              <Link to="/">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  View All Contracts
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
