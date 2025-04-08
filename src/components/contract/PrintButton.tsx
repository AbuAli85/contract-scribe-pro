
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
      // Set up content for printing
      const contractElements = document.querySelectorAll('.contract-content, .a4-page, .letterhead-background');
      contractElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'block';
          element.style.visibility = 'visible';
        }
      });
      
      // Trigger print dialog
      window.print();
      
      // Remove the printing class after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('printing');
      }, 2000);
    }, 2000); // Increased timeout for better rendering
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
