
import { useState, useEffect } from "react";
import { FileText, FileImage, FileBadge, File } from "lucide-react";
import { documentSystem, type AttachedDocument, type DocumentType } from "@/lib/documents";

interface DocumentPreviewProps {
  documentId: string;
  className?: string;
}

export function DocumentPreview({ documentId, className = "" }: DocumentPreviewProps) {
  const [document, setDocument] = useState<AttachedDocument | null>(null);

  useEffect(() => {
    const doc = documentSystem.getDocument(documentId);
    if (doc) {
      setDocument(doc);
    }
  }, [documentId]);

  if (!document) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border rounded-md ${className}`}>
        <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground mt-2">Document not found</p>
      </div>
    );
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "passport":
        return <FileBadge className="h-12 w-12 text-blue-500" />;
      case "id":
        return <FileImage className="h-12 w-12 text-green-500" />;
      case "visa":
        return <FileText className="h-12 w-12 text-amber-500" />;
      case "license":
        return <FileText className="h-12 w-12 text-purple-500" />;
      case "certificate":
        return <FileText className="h-12 w-12 text-red-500" />;
      default:
        return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "passport":
        return "Passport / جواز السفر";
      case "id":
        return "ID Card / بطاقة الهوية";
      case "visa":
        return "Visa / تأشيرة";
      case "license":
        return "License / رخصة";
      case "certificate":
        return "Certificate / شهادة";
      default:
        return "Other Document / مستند آخر";
    }
  };

  return (
    <div className={`document-preview ${className}`}>
      <div className="document-header border-b pb-2 mb-4">
        <div className="flex items-center gap-2">
          {getDocumentIcon(document.type)}
          <div>
            <h3 className="text-lg font-medium">{document.name}</h3>
            <p className="text-sm text-muted-foreground">
              {getDocumentTypeLabel(document.type)}
              {document.description && ` - ${document.description}`}
            </p>
          </div>
        </div>
      </div>

      <div className="document-content flex justify-center p-4">
        {document.file.startsWith("data:image") ? (
          <img
            src={document.file || "/placeholder.svg"}
            alt={document.name}
            className="max-w-full max-h-[500px] object-contain"
          />
        ) : document.file.startsWith("data:application/pdf") ? (
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-red-500" />
            <p className="text-sm mt-2">PDF Document</p>
            <p className="text-xs text-muted-foreground">PDF preview not available</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {getDocumentIcon(document.type)}
            <p className="text-sm mt-2">{getDocumentTypeLabel(document.type)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
