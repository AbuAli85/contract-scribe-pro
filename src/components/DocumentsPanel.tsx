
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaperclipIcon, Trash2, Eye, Upload } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface DocumentsPanelProps {
  contractId: string
  documents: any[]
  onDocumentsChange: (documents: any[]) => void
}

export function DocumentsPanel({ contractId, documents, onDocumentsChange }: DocumentsPanelProps) {
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "passport",
    description: "",
    file: null as File | null,
    includeInPrint: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Document must be less than 2MB. Please compress the file before uploading.",
        variant: "destructive",
      })
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
      toast({
        title: "Error reading file",
        description: "There was an error reading the file. Please try again with a different file.",
        variant: "destructive",
      })
      e.target.value = "" // Clear the input
    }
    reader.readAsDataURL(file)
  }

  const handleAddDocument = async () => {
    // Validate inputs
    if (!newDocument.name || !newDocument.type || !newDocument.file) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and upload a file.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const supabase = getSupabaseClient()

    try {
      // Generate a unique ID
      const id = Math.random().toString(36).substring(2, 9)

      // Use the file preview as the file URL for this demo
      // In a real app, you would upload to storage and get a URL
      const fileUrl = filePreview

      // Create document object
      const documentObj = {
        id,
        contract_id: contractId,
        type: newDocument.type,
        name: newDocument.name,
        description: newDocument.description || null,
        file_url: fileUrl,
        include_in_print: newDocument.includeInPrint,
        created_at: new Date().toISOString(),
      }

      // Insert into database
      const { error } = await supabase.from("documents").insert([documentObj])

      if (error) {
        throw error
      }

      // Update local state
      const updatedDocuments = [...documents, documentObj]
      onDocumentsChange(updatedDocuments)

      // Reset form
      setNewDocument({
        name: "",
        type: "passport",
        description: "",
        file: null,
        includeInPrint: true,
      })
      setFilePreview(null)

      toast({
        title: "Document added",
        description: `${newDocument.name} has been added to the contract.`,
      })
    } catch (error: any) {
      console.error("Error adding document:", error)
      toast({
        title: "Error adding document",
        description: error.message || "There was an error adding the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveDocument = async (id: string) => {
    const supabase = getSupabaseClient()

    try {
      // Delete from database
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      const updatedDocuments = documents.filter((d) => d.id !== id)
      onDocumentsChange(updatedDocuments)

      toast({
        title: "Document removed",
        description: "The document has been removed from the contract.",
      })
    } catch (error: any) {
      console.error("Error removing document:", error)
      toast({
        title: "Error removing document",
        description: error.message || "There was an error removing the document. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Attached documents for this contract</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <PaperclipIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">No documents attached yet</p>
              <p className="text-sm text-muted-foreground">Add documents below</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {document.file_url ? (
                      <img
                        src={document.file_url || "/placeholder.svg"}
                        alt={document.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <PaperclipIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{document.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{document.type}</p>
                        {document.description && <p className="text-sm mt-1">{document.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Document</CardTitle>
          <CardDescription>Upload a document related to this contract</CardDescription>
        </CardHeader>
        <CardContent>
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
                  onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
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
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAddDocument}
            disabled={isSubmitting || !newDocument.file}
            className="flex items-center gap-1"
          >
            <PaperclipIcon className="h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add Document"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
