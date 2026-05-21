
import { useState, useEffect } from "react"
import { FileText, FileImage, FileBadge, File } from "lucide-react"
import { documentSystem, type AttachedDocument, type DocumentType } from "@/lib/documents"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

interface DocumentPreviewProps {
  documentId: string
  className?: string
  onDelete?: (id: string) => void
}

export function DocumentPreview({ documentId, className = "", onDelete }: DocumentPreviewProps) {
  const [document, setDocument] = useState<AttachedDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDocument() {
      setIsLoading(true)
      try {
        const doc = await Promise.resolve(documentSystem.getDocument(documentId))
        setDocument(doc)
      } catch (error) {
        console.error("Error loading document:", error)
        toast({
          title: "Error",
          description: "Failed to load document",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [documentId, toast])

  const handleTogglePrintInclusion = async () => {
    if (!document) return
    
    try {
      const updatedDoc = await documentSystem.togglePrintInclusion(document.id)
      if (updatedDoc) {
        setDocument(updatedDoc)
        toast({
          title: updatedDoc.includeInPrint ? "Added to print" : "Removed from print",
          description: updatedDoc.includeInPrint 
            ? "This document will be included when printing" 
            : "This document will be excluded when printing",
        })
      }
    } catch (error) {
      console.error("Error toggling print inclusion:", error)
      toast({
        title: "Error",
        description: "Failed to update document print settings",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!document || !onDelete) return
    
    try {
      const success = await documentSystem.deleteDocument(document.id)
      if (success) {
        toast({
          title: "Document deleted",
          description: "The document has been removed",
        })
        onDelete(document.id)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "passport":
        return <FileBadge className="h-12 w-12 text-blue-500" />
      case "id":
        return <FileImage className="h-12 w-12 text-green-500" />
      case "visa":
        return <FileText className="h-12 w-12 text-amber-500" />
      case "license":
        return <FileText className="h-12 w-12 text-purple-500" />
      case "certificate":
        return <FileText className="h-12 w-12 text-red-500" />
      default:
        return <File className="h-12 w-12 text-gray-500" />
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

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border rounded-md ${className}`}>
        <div className="h-12 w-12 rounded-full border-2 border-t-transparent border-primary animate-spin" />
        <p className="text-sm text-muted-foreground mt-2">Loading document...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border rounded-md ${className}`}>
        <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground mt-2">Document not found</p>
      </div>
    )
  }

  return (
    <div className={`document-preview border rounded-md overflow-hidden ${className}`}>
      <div className="document-header border-b p-4">
        <div className="flex items-center gap-2">
          {getDocumentIcon(document.type)}
          <div className="flex-1">
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

      <div className="document-actions p-4 border-t flex justify-between">
        <Button 
          variant={document.includeInPrint ? "outline" : "default"}
          size="sm"
          onClick={handleTogglePrintInclusion}
        >
          {document.includeInPrint ? "Exclude from print" : "Include in print"}
        </Button>
        
        {onDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
