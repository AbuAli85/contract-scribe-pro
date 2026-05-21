import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DocumentSelectionList } from "./DocumentSelectionList"
import { DocumentForm } from "./DocumentForm"

interface DocumentsPanelProps {
  contractId: string
  documents: any[]
  onDocumentsChange: (documents: any[]) => void
}

export function DocumentsPanel({ contractId, documents, onDocumentsChange }: DocumentsPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAddDocument = async (newDocumentData: any) => {
    // Validate inputs
    if (!newDocumentData.name || !newDocumentData.type || !newDocumentData.file) {
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

      // Create file URL from preview
      const reader = new FileReader()
      reader.onload = async (event) => {
        if (!event.target?.result) return
        
        const fileUrl = event.target.result as string

        // Create document object
        const documentObj = {
          id,
          contract_id: contractId,
          type: newDocumentData.type,
          name: newDocumentData.name,
          description: newDocumentData.description || null,
          file_url: fileUrl,
          include_in_print: newDocumentData.includeInPrint,
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

        toast({
          title: "Document added",
          description: `${newDocumentData.name} has been added to the contract.`,
        })
      }
      
      reader.readAsDataURL(newDocumentData.file)
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

  const handleUpdateDocument = async (id: string) => {
    // This would normally update the document, but for now it just refreshes the documents
    // This keeps the same functionality as the original component
    const updatedDocuments = [...documents]
    onDocumentsChange(updatedDocuments)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Attached documents for this contract</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentSelectionList 
            documents={documents} 
            onDocumentRemoved={handleRemoveDocument}
            onDocumentUpdated={handleUpdateDocument}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Document</CardTitle>
          <CardDescription>Upload a document related to this contract</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentForm 
            onSubmit={handleAddDocument}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
