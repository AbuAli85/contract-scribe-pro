
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Link, useSearchParams } from "react-router-dom"
import { Home, Printer, AlertCircle, RefreshCw } from "lucide-react"

interface PrintErrorPageProps {
  language?: "en" | "ar";
  redirectUrl?: string;
  errorMessage?: string;
}

const PrintErrorPage: React.FC<PrintErrorPageProps> = ({ 
  language = "en",
  redirectUrl = "/", 
  errorMessage: propErrorMessage
}) => {
  const [searchParams] = useSearchParams();
  const errorFromUrl = searchParams.get('error');
  const redirectFromUrl = searchParams.get('redirect');
  
  // Use URL params if available, otherwise use props
  const finalErrorMessage = errorFromUrl || propErrorMessage;
  const finalRedirectUrl = redirectFromUrl || redirectUrl;
  
  // Log details for debugging
  useEffect(() => {
    console.log("Print error page loaded with:", {
      errorMessage: finalErrorMessage,
      redirectUrl: finalRedirectUrl
    });
  }, [finalErrorMessage, finalRedirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {language === "ar" ? "نظام طباعة العقود" : "Contract Print System"}
        </h1>
        
        {finalErrorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">
              {language === "ar" ? "خطأ:" : "Error:"} {finalErrorMessage}
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          {language === "ar" 
            ? "حدث خطأ أثناء محاولة طباعة العقد."
            : "An error occurred while trying to print your contract."}
        </p>
        
        <p className="text-gray-600 mb-4">
          {language === "ar"
            ? "يمكنك محاولة الطباعة مرة أخرى أو التحقق من إعدادات الطابعة والمتصفح."
            : "You can try printing again or check your printer and browser settings."}
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-blue-700 mb-2">
            {language === "ar" ? "نصائح لحل المشكلة:" : "Tips to resolve the issue:"}
          </h3>
          <ul className="list-disc pl-5 text-blue-700">
            <li className="mb-1">
              {language === "ar" 
                ? "تأكد من تشغيل الطابعة وتوصيلها بشكل صحيح"
                : "Make sure your printer is on and properly connected"}
            </li>
            <li className="mb-1">
              {language === "ar"
                ? "تأكد من السماح للنوافذ المنبثقة في المتصفح"
                : "Ensure pop-ups are allowed in your browser"}
            </li>
            <li className="mb-1">
              {language === "ar"
                ? "حاول تحديث الصفحة قبل الطباعة"
                : "Try refreshing the page before printing"}
            </li>
            <li>
              {language === "ar"
                ? "جرب استخدام متصفح آخر"
                : "Try using a different browser"}
            </li>
          </ul>
        </div>
        
        <div className="flex justify-between">
          <Link to={finalRedirectUrl}>
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {language === "ar" ? "العودة إلى الصفحة السابقة" : "Return to Previous Page"}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {language === "ar" ? "المحاولة مرة أخرى" : "Try Again"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrintErrorPage
