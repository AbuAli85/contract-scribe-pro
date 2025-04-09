
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { documentSystem, type AttachedDocument } from "@/lib/documents";
import { DocumentList } from "./DocumentList";
import { DocumentUploadDialog } from "./DocumentUploadDialog";

interface DocumentUploaderProps {
  contractId: string;
  onDocumentsChange?: () => void;
}

export function DocumentUploader({ contractId, onDocumentsChange }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      const docs = await documentSystem.getDocuments(contractId);
      setDocuments(docs);
    };
    loadDocuments();
  }, [contractId]);

  const refreshDocuments = async () => {
    const docs = await documentSystem.getDocuments(contractId);
    setDocuments(docs);
    if (onDocumentsChange) {
      onDocumentsChange();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Attached Documents</h3>
        <DocumentUploadDialog
          contractId={contractId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onDocumentAdded={refreshDocuments}
        />
      </div>

      {documents.length === 0 ? (
        <EmptyDocumentsPlaceholder onAddClick={() => setDialogOpen(true)} />
      ) : (
        <DocumentList 
          documents={documents} 
          onDocumentDeleted={refreshDocuments}
          onDocumentUpdated={refreshDocuments}
        />
      )}
    </div>
  );
}

function EmptyDocumentsPlaceholder({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-8 border rounded-md bg-muted/20">
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
      <p className="text-sm text-muted-foreground">No documents attached yet</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        Click "Add Document" to attach documents to this contract
      </p>
      <Button size="sm" onClick={onAddClick}>Add Document</Button>
    </div>
  );
}
