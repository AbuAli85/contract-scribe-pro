
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { documentSystem, type DocumentType } from "@/lib/documents";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadDialogProps {
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentAdded: () => Promise<void>;
}

export function DocumentUploadDialog({ 
  contractId, 
  open, 
  onOpenChange, 
  onDocumentAdded 
}: DocumentUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>("passport");
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [includeInPrint, setIncludeInPrint] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setDocumentType("passport");
    setDocumentName("");
    setDocumentDescription("");
    setIncludeInPrint(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        // Generate a default name if none provided
        const finalName =
          documentName || `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} - ${file.name}`;

        // Add document to system
        await documentSystem.addDocument(
          contractId,
          documentType,
          finalName,
          event.target.result as string,
          documentDescription,
          includeInPrint,
        );

        // Reset form
        resetForm();

        // Close dialog and refresh documents
        onOpenChange(false);
        await onDocumentAdded();

        // Show success toast
        toast({
          title: "Document uploaded",
          description: `${finalName} has been attached to the contract`,
        });
      }
      setUploading(false);
    };

    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading the document",
        variant: "destructive",
      });
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Document</DialogTitle>
          <DialogDescription>
            Upload a document to attach to this contract. You can choose the document type and whether to include it
            when printing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport / جواز السفر</SelectItem>
                <SelectItem value="id">ID Card / بطاقة الهوية</SelectItem>
                <SelectItem value="visa">Visa / تأشيرة</SelectItem>
                <SelectItem value="license">License / رخصة</SelectItem>
                <SelectItem value="certificate">Certificate / شهادة</SelectItem>
                <SelectItem value="other">Other Document / مستند آخر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-name">Document Name (Optional)</Label>
            <Input
              id="document-name"
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-description">Description (Optional)</Label>
            <Textarea
              id="document-description"
              placeholder="Enter document description"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document-file">Document File</Label>
            <Input
              id="document-file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="include-in-print"
              type="checkbox"
              className="w-4 h-4"
              checked={includeInPrint}
              onChange={(e) => setIncludeInPrint(e.target.checked)}
            />
            <Label htmlFor="include-in-print">Include in contract printing</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
