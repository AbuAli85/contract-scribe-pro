
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PaperclipIcon } from "lucide-react"
import { type AttachedDocument } from "@/lib/documents"
import { DocumentTypeGroup } from "./DocumentTypeGroup"

interface DocumentSelectionListProps {
  documents: AttachedDocument[]
  onDocumentRemoved: (id: string) => Promise<void>
  onDocumentUpdated: (id: string) => Promise<void>
}

export function DocumentSelectionList({ 
  documents, 
  onDocumentRemoved, 
  onDocumentUpdated 
}: DocumentSelectionListProps) {
  // Group documents by type
  const documentsByType = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    },
    {} as Record<string, AttachedDocument[]>
  );

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <PaperclipIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground">No documents attached yet</p>
        <p className="text-sm text-muted-foreground">Add documents below</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {Object.entries(documentsByType).map(([type, docs]) => (
        <DocumentTypeGroup
          key={type}
          type={type as any}
          documents={docs}
          onDocumentDeleted={onDocumentRemoved}
          onDocumentUpdated={onDocumentUpdated}
        />
      ))}
    </div>
  );
}
