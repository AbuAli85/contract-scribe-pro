
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrint } from "@/hooks/usePrint";

interface PrintButtonProps {
  language: "ar" | "en";
}

const PrintButton = ({ language }: PrintButtonProps) => {
  const { isPrinting, handlePrint } = usePrint({ timeoutDuration: 15000 });

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting}
    >
      <Printer className="h-4 w-4" />
      <span>{language === "ar" ? "طباعة" : "Print"}</span>
    </Button>
  );
};

export default PrintButton;
