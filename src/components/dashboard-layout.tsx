
import React, { useState } from 'react';
import LanguageToggle from "@/components/LanguageToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [language, setLanguage] = useState<"ar" | "en">("en");
  
  const handleLanguageChange = (lang: "ar" | "en") => {
    setLanguage(lang);
    // Store language preference
    localStorage.setItem("preferredLanguage", lang);
    
    // Update document direction for RTL support
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("rtl");
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-end">
        <LanguageToggle 
          language={language} 
          onChange={handleLanguageChange} 
        />
      </div>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
