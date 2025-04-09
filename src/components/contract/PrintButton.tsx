
import React from "react";
import { Button } from "@/components/ui/button";
import { PrintButtonStatus } from "@/components/ui/print-button-status";
import { usePrintButton } from "@/hooks/usePrintButton";

interface PrintButtonProps {
  language: "ar" | "en";
  contractData?: any;
  selectedDocuments?: string[];
  contractId?: string;
  forceDirectPrint?: boolean;
}

const PrintButton = ({
  language,
  contractData,
  selectedDocuments = ["contract"],
  contractId = "default",
  forceDirectPrint = true
}: PrintButtonProps) => {
  const {
    documents,
    isLoading,
    isPrinting,
    contentReady,
    handlePrint
  } = usePrintButton({
    contractId,
    contractData,
    language,
    selectedDocuments,
    forceDirectPrint
  });

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className="mb-6 print:hidden flex gap-2 items-center"
      disabled={isPrinting || isLoading || !contentReady}
    >
      <PrintButtonStatus
        isPrinting={isPrinting}
        isLoading={isLoading}
        contentReady={contentReady}
        documentsCount={documents.length}
        language={language}
      />
    </Button>
  );
};

export default PrintButton;
