
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const handlePrint = () => {
    window.print();
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
