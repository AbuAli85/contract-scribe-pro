
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const handlePrint = () => {
    // Force contract content to be visible
    document.body.classList.add('printing');
    
    // Wait for content to be fully rendered with a longer timeout
    setTimeout(() => {
      // Trigger print dialog
      window.print();
      
      // Remove the printing class after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('printing');
      }, 1000);
    }, 1000); // Increased timeout for better rendering
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="mb-6 print:hidden flex gap-2 items-center"
    >
      <Printer className="h-4 w-4" />
      <span>{language === "ar" ? "طباعة" : "Print"}</span>
    </Button>
  );
};

export default PrintButton;
