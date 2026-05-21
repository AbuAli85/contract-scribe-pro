
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DocumentUploader, DocumentsPanel } from "@/components/documents";

interface DocumentsSectionProps {
  contractId: string;
  documents: any[];
  useNewDocumentsPanel: boolean;
  language: "ar" | "en";
  onDocumentsChange: (docs: any[]) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  contractId,
  documents,
  useNewDocumentsPanel,
  language,
  onDocumentsChange
}) => {
  if (useNewDocumentsPanel) {
    return (
      <DocumentsPanel 
        contractId={contractId} 
        documents={documents}
        onDocumentsChange={onDocumentsChange}
      />
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>
          {language === "ar" ? "المستندات" : "Documents"}
        </CardTitle>
        <CardDescription>
          {language === "ar" ? "قم بتحميل المستندات ذات الصلة بهذا العقد" : "Upload relevant documents for this contract"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DocumentUploader contractId={contractId} />
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
