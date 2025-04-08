
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const handlePrint = () => {
    // Force styles to be fully applied and ensure content is visible
    document.body.classList.add('printing');
    
    // Use a longer timeout to ensure complete rendering
    setTimeout(() => {
      window.print();
      // Remove the printing class after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('printing');
      }, 500);
    }, 500);
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
