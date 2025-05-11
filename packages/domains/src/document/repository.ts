import { Document } from './schema'

/**
 * Repository for managing document persistence and retrieval
 * Used for RAG (Retrieval Augmented Generation)
 */
export interface DocumentRepository {
  // Document CRUD operations
  getDocument(id: string): Promise<Document | null>
  listDocuments(): Promise<Document[]>
  createDocument(content: string, metadata?: Record<string, unknown>): Promise<Document>
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>
  deleteDocument(id: string): Promise<void>
}
