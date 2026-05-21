
import { generateUniqueId } from "./utils"
import { getSupabaseClient } from "./supabase"

export type DocumentType = "passport" | "id" | "visa" | "license" | "certificate" | "other"

export interface AttachedDocument {
  id: string
  contractId: string
  type: DocumentType
  name: string
  description?: string
  file: string // Base64 encoded file or URL
  createdAt: string
  includeInPrint: boolean
}

// Document operations using Supabase mock client
export const documentSystem = {
  // Add a new document
  addDocument: async (
    contractId: string,
    type: DocumentType,
    name: string,
    file: string,
    description?: string,
    includeInPrint = true,
  ) => {
    const supabase = getSupabaseClient()
    
    const newDocument: AttachedDocument = {
      id: generateUniqueId(),
      contractId,
      type,
      name,
      description,
      file,
      createdAt: new Date().toISOString(),
      includeInPrint,
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(newDocument)
      .select()
      .single()
      .execute()

    if (error) {
      console.error("Error adding document:", error)
      return null
    }

    return data
  },

  // Get all documents for a contract
  getDocuments: async (contractId: string) => {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('documents')
      .select()
      .eq('contractId', contractId)
      .execute()

    if (error) {
      console.error("Error getting documents:", error)
      return []
    }

    return data || []
  },

  // Get a document by ID
  getDocument: (id: string) => {
    const supabase = getSupabaseClient()
    
    // Using synchronous approach for compatibility with existing code
    try {
      const result = supabase
        .from('documents')
        .select()
        .eq('id', id)
        .single()
        .execute()

      return result.data
    } catch (error) {
      console.error("Error getting document:", error)
      return null
    }
  },

  // Update a document
  updateDocument: async (id: string, data: Partial<AttachedDocument>) => {
    const supabase = getSupabaseClient()
    
    const { data: updatedDoc, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', id)
      .select()
      .single()
      .execute()

    if (error) {
      console.error("Error updating document:", error)
      return null
    }

    return updatedDoc
  },

  // Delete a document
  deleteDocument: async (id: string) => {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .execute()

    if (error) {
      console.error("Error deleting document:", error)
      return false
    }

    return data && data.count > 0
  },

  // Toggle document print inclusion
  togglePrintInclusion: async (id: string) => {
    const supabase = getSupabaseClient()
    
    // First get the current document
    const { data: document, error: getError } = await supabase
      .from('documents')
      .select()
      .eq('id', id)
      .single()
      .execute()

    if (getError || !document) {
      console.error("Error getting document for toggle:", getError)
      return null
    }

    // Update the includeInPrint field
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({ includeInPrint: !document.includeInPrint })
      .eq('id', id)
      .select()
      .single()
      .execute()

    if (updateError) {
      console.error("Error toggling document print inclusion:", updateError)
      return null
    }

    return updatedDoc
  },

  // Get documents to be included in printing
  getDocumentsForPrinting: async (contractId: string) => {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('documents')
      .select()
      .eq('contractId', contractId)
      .eq('includeInPrint', true)
      .execute()

    if (error) {
      console.error("Error getting documents for printing:", error)
      return []
    }

    return data || []
  },
}
