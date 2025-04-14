
import React from 'react';
import LanguageToggle from "@/components/LanguageToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-end">
        <LanguageToggle 
          language="en" 
          onChange={(lang) => console.log("Language changed to:", lang)} 
        />
      </div>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
