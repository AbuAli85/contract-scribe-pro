import { FileBadge, FileImage, FileText, File } from "lucide-react";
import { type AttachedDocument, type DocumentType } from "@/lib/documents";
import { DocumentItem } from "./DocumentItem";

interface DocumentTypeGroupProps {
  type: DocumentType;
  documents: AttachedDocument[];
  onDocumentDeleted: (id: string) => Promise<void>;
  onDocumentUpdated: (id: string) => Promise<void>;
}

export function DocumentTypeGroup({ type, documents, onDocumentDeleted, onDocumentUpdated }: DocumentTypeGroupProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-md flex items-center gap-2">
        {getDocumentIcon(type)}
        {getDocumentTypeLabel(type)}
        <span className="text-sm text-muted-foreground">({documents.length})</span>
      </h4>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentItem 
            key={doc.id} 
            document={doc} 
            onDelete={() => onDocumentDeleted(doc.id)} 
            onUpdate={() => onDocumentUpdated(doc.id)} 
          />
        ))}
      </div>
    </div>
  );
}

export function getDocumentIcon(type: DocumentType) {
  switch (type) {
    case "passport":
      return <FileBadge className="h-6 w-6 text-blue-500" />;
    case "id":
      return <FileImage className="h-6 w-6 text-green-500" />;
    case "visa":
      return <FileText className="h-6 w-6 text-amber-500" />;
    case "license":
      return <FileText className="h-6 w-6 text-purple-500" />;
    case "certificate":
      return <FileText className="h-6 w-6 text-red-500" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
}

export function getDocumentTypeLabel(type: DocumentType) {
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
}
