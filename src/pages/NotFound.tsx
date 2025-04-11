
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, FileText, ArrowLeft } from "lucide-react";

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
                Example: <code>/contracts/c1</code> for contract with ID "c1"
              </p>
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
