
import React from 'react'
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Home, Printer, AlertCircle } from "lucide-react"

interface PrintErrorPageProps {
  language?: "en" | "ar";
  redirectUrl?: string;
  errorMessage?: string;
}

const PrintErrorPage: React.FC<PrintErrorPageProps> = ({ 
  language = "en",
  redirectUrl = "/", 
  errorMessage
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {language === "ar" ? "نظام طباعة العقود" : "Contract Print System"}
        </h1>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">
              {language === "ar" ? "خطأ:" : "Error:"} {errorMessage}
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          {language === "ar" 
            ? "تم استبدال هذه الصفحة بطريقة طباعة أكثر موثوقية."
            : "This page has been replaced with a more reliable printing method."}
        </p>
        
        <p className="text-gray-600 mb-4">
          {language === "ar"
            ? "يرجى استخدام زر الطباعة في صفحة العقد لطباعة العقد الخاص بك."
            : "Please use the Print button on the contract page to print your contract."}
        </p>
        
        <p className="text-gray-600 mb-6">
          {language === "ar"
            ? "إذا كنت ترى هذه الصفحة، فهذا يعني أنك تستخدم رابطًا قديمًا أو حدث خطأ في عملية الطباعة."
            : "If you're seeing this page, it means you're using an outdated link or there was an error in the printing process."}
        </p>
        
        <div className="flex justify-between">
          <Link to={redirectUrl}>
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {language === "ar" ? "العودة إلى لوحة التحكم" : "Return to Dashboard"}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {language === "ar" ? "محاولة الطباعة مرة أخرى" : "Try Printing Again"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrintErrorPage
