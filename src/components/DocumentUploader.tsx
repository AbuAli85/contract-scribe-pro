
import { useState, useRef, useEffect } from "react"
import { Upload, X, FileText, FileImage, FileBadge, File, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { documentSystem, type DocumentType, type AttachedDocument } from "@/lib/documents"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploaderProps {
  contractId: string
  onDocumentsChange?: () => void
}

export function DocumentUploader({ contractId, onDocumentsChange }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<AttachedDocument[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType>("passport")
  const [documentName, setDocumentName] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [includeInPrint, setIncludeInPrint] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      const docs = await documentSystem.getDocuments(contractId)
      setDocuments(docs)
    }
    loadDocuments()
  }, [contractId])

  // Group documents by type
  const documentsByType = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = []
      }
      acc[doc.type].push(doc)
      return acc
    },
    {} as Record<DocumentType, AttachedDocument[]>,
  )

  const refreshDocuments = async () => {
    const docs = await documentSystem.getDocuments(contractId)
    setDocuments(docs)
    if (onDocumentsChange) {
      onDocumentsChange()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      if (event.target?.result) {
        // Generate a default name if none provided
        const finalName =
          documentName || `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} - ${file.name}`

        // Add document to system
        await documentSystem.addDocument(
          contractId,
          documentType,
          finalName,
          event.target.result as string,
          documentDescription,
          includeInPrint,
        )

        // Reset form
        setDocumentType("passport")
        setDocumentName("")
        setDocumentDescription("")
        setIncludeInPrint(true)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Close dialog and refresh documents
        setDialogOpen(false)
        await refreshDocuments()

        // Show success toast
        toast({
          title: "Document uploaded",
          description: `${finalName} has been attached to the contract`,
        })
      }
      setUploading(false)
    }

    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading the document",
        variant: "destructive",
      })
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteDocument = async (id: string) => {
    // Use an alert dialog instead of window.confirm in a real application
    const confirmed = window.confirm("Are you sure you want to delete this document?")
    if (confirmed) {
      const success = await documentSystem.deleteDocument(id)
      if (success) {
        await refreshDocuments()
        toast({
          title: "Document deleted",
          description: "The document has been removed from the contract",
        })
      }
    }
  }

  const handleTogglePrintInclusion = async (id: string) => {
    const updatedDoc = await documentSystem.togglePrintInclusion(id)
    if (updatedDoc) {
      await refreshDocuments()

      toast({
        title: updatedDoc.includeInPrint ? "Document included in print" : "Document excluded from print",
        description: updatedDoc.includeInPrint
          ? "This document will be included when printing"
          : "This document will not be included when printing",
      })
    }
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "passport":
        return <FileBadge className="h-6 w-6 text-blue-500" />
      case "id":
        return <FileImage className="h-6 w-6 text-green-500" />
      case "visa":
        return <FileText className="h-6 w-6 text-amber-500" />
      case "license":
        return <FileText className="h-6 w-6 text-purple-500" />
      case "certificate":
        return <FileText className="h-6 w-6 text-red-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "passport":
        return "Passport / جواز السفر"
      case "id":
        return "ID Card / بطاقة الهوية"
      case "visa":
        return "Visa / تأشيرة"
      case "license":
        return "License / رخصة"
      case "certificate":
        return "Certificate / شهادة"
      default:
        return "Other Document / مستند آخر"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Attached Documents</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No documents attached yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Document" to attach documents to this contract
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group documents by type */}
          {Object.entries(documentsByType).map(([type, docs]) => (
            <div key={type} className="space-y-2">
              <h4 className="font-medium text-md flex items-center gap-2">
                {getDocumentIcon(type as DocumentType)}
                {getDocumentTypeLabel(type as DocumentType)}
                <span className="text-sm text-muted-foreground">({docs.length})</span>
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => (
                  <Card key={doc.id} className={doc.includeInPrint ? "" : "opacity-70"}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {doc.description && <CardDescription>{doc.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mt-2 border rounded-md overflow-hidden h-32 bg-muted/20 flex items-center justify-center">
                        {doc.file.startsWith("data:image") ? (
                          <img
                            src={doc.file || "/placeholder.svg"}
                            alt={doc.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-1"
                        onClick={() => handleTogglePrintInclusion(doc.id)}
                      >
                        {doc.includeInPrint ? (
                          <>
                            <Check className="h-4 w-4" />
                            Include in print
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Excluded from print
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
