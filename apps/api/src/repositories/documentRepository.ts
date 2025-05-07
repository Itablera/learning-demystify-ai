import { v4 as uuidv4 } from 'uuid'
import { Document, DocumentChunk, DocumentRepository } from '@workspace/domains'

/**
 * In-memory implementation of DocumentRepository
 * This is used for development and testing purposes
 */
export class InMemoryDocumentRepository implements DocumentRepository {
  private documents: Map<string, Document> = new Map()
  private chunks: Map<string, DocumentChunk[]> = new Map()

  constructor() {}

  async getDocument(id: string): Promise<Document | null> {
    const document = this.documents.get(id)
    return document || null
  }

  async listDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
  }

  async createDocument(content: string, metadata: Record<string, unknown> = {}): Promise<Document> {
    const id = uuidv4()
    const document: Document = {
      id,
      content,
      metadata,
      createdAt: new Date().toISOString(),
    }

    this.documents.set(id, document)
    return document
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const document = await this.getDocument(id)
    if (!document) {
      throw new Error(`Document with id ${id} not found`)
    }

    const updatedDocument = {
      ...document,
      ...updates,
    }

    this.documents.set(id, updatedDocument)
    return updatedDocument
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id)
    this.chunks.delete(id)
  }
}
