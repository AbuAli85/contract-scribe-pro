
import { type AttachedDocument, type DocumentType } from "@/lib/documents";
import { DocumentTypeGroup } from "./DocumentTypeGroup";

interface DocumentListProps {
  documents: AttachedDocument[];
  onDocumentDeleted: () => Promise<void>;
  onDocumentUpdated: () => Promise<void>;
}

export function DocumentList({ documents, onDocumentDeleted, onDocumentUpdated }: DocumentListProps) {
  // Group documents by type
  const documentsByType = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    },
    {} as Record<DocumentType, AttachedDocument[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(documentsByType).map(([type, docs]) => (
        <DocumentTypeGroup
          key={type}
          type={type as DocumentType}
          documents={docs}
          onDocumentDeleted={onDocumentDeleted}
          onDocumentUpdated={onDocumentUpdated}
        />
      ))}
    </div>
  );
}
