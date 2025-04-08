
import { generateUniqueId } from "./utils"

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

// In-memory storage for documents (would be replaced with a real database)
let documents: AttachedDocument[] = []

// Load documents from localStorage if available (browser-only)
const loadDocuments = () => {
  if (typeof window !== "undefined") {
    const savedDocuments = localStorage.getItem("attachedDocuments")
    if (savedDocuments) {
      documents = JSON.parse(savedDocuments)
    }
  }
}

// Save documents to localStorage (browser-only)
const saveDocuments = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("attachedDocuments", JSON.stringify(documents))
  }
}

// Initialize documents
loadDocuments()

// Document operations
export const documentSystem = {
  // Add a new document
  addDocument: (
    contractId: string,
    type: DocumentType,
    name: string,
    file: string,
    description?: string,
    includeInPrint = true,
  ) => {
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

    documents.push(newDocument)
    saveDocuments()

    return newDocument
  },

  // Get all documents for a contract
  getDocuments: (contractId: string) => {
    return documents.filter((doc) => doc.contractId === contractId)
  },

  // Get a document by ID
  getDocument: (id: string) => {
    return documents.find((doc) => doc.id === id)
  },

  // Update a document
  updateDocument: (id: string, data: Partial<AttachedDocument>) => {
    const index = documents.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      documents[index] = { ...documents[index], ...data }
      saveDocuments()
      return documents[index]
    }
    return null
  },

  // Delete a document
  deleteDocument: (id: string) => {
    const index = documents.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      documents.splice(index, 1)
      saveDocuments()
      return true
    }
    return false
  },

  // Toggle document print inclusion
  togglePrintInclusion: (id: string) => {
    const index = documents.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      documents[index].includeInPrint = !documents[index].includeInPrint
      saveDocuments()
      return documents[index]
    }
    return null
  },

  // Get documents to be included in printing
  getDocumentsForPrinting: (contractId: string) => {
    return documents.filter((doc) => doc.contractId === contractId && doc.includeInPrint)
  },
}
