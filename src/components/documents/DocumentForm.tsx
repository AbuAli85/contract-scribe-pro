
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardFooter } from "@/components/ui/card"
import { PaperclipIcon, Upload } from "lucide-react"
import { type DocumentType } from "@/lib/documents"

interface DocumentFormProps {
  onSubmit: (documentData: {
    name: string;
    type: DocumentType;
    description: string;
    file: File | null;
    includeInPrint: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function DocumentForm({ onSubmit, isSubmitting }: DocumentFormProps) {
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "passport" as DocumentType,
    description: "",
    file: null as File | null,
    includeInPrint: true,
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large! Please compress the file before uploading (max 2MB).");
      e.target.value = "" // Clear the input
      return
    }

    setNewDocument({ ...newDocument, file })

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string)
    }
    reader.onerror = () => {
      alert("Error reading file. Please try again with a different file.");
      e.target.value = "" // Clear the input
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    await onSubmit(newDocument);
    // Reset form
    setNewDocument({
      name: "",
      type: "passport",
      description: "",
      file: null,
      includeInPrint: true,
    });
    setFilePreview(null);
  };

  return (
    <>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              placeholder="Enter document name"
              value={newDocument.name}
              onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select
              value={newDocument.type}
              onValueChange={(value) => setNewDocument({ ...newDocument, type: value as DocumentType })}
            >
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="id">ID Card</SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc-description">Description (Optional)</Label>
          <Textarea
            id="doc-description"
            placeholder="Enter a brief description of the document"
            value={newDocument.description}
            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc-file">Upload Document</Label>
          <div className="flex items-center gap-4">
            <Input id="doc-file" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("doc-file")?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            {filePreview && (
              <div className="border rounded-md overflow-hidden w-20 h-20">
                <img
                  src={filePreview || "/placeholder.svg"}
                  alt="Document preview"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF. Maximum size: 2MB.</p>
        </div>
      </div>
      <CardFooter className="px-0">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !newDocument.file}
          className="flex items-center gap-1"
        >
          <PaperclipIcon className="h-4 w-4" />
          {isSubmitting ? "Adding..." : "Add Document"}
        </Button>
      </CardFooter>
    </>
  );
}
