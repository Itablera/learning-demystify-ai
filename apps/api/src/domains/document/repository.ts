import { Document, DocumentChunk, DocumentRepository } from '@workspace/domains'
import { v4 as uuidv4 } from 'uuid'

/**
 * In-memory implementation of DocumentRepository for demonstration
 * In a real-world application, this would be replaced with persistence 
 * to a vector database like Qdrant, Pinecone, etc.
 */
export class MockDocumentRepository implements DocumentRepository {
  private documents: Map<string, Document> = new Map()
  private documentChunks: Map<string, DocumentChunk[]> = new Map()

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null
  }

  async listDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
  }

  async createDocument(content: string, metadata?: Record<string, unknown>): Promise<Document> {
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
    const document = this.documents.get(id)
    if (!document) {
      throw new Error(`Document with id ${id} not found`)
    }
    const updatedDocument = { ...document, ...updates }
    this.documents.set(id, updatedDocument)
    return updatedDocument
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id)
    this.documentChunks.delete(id)
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    return this.documentChunks.get(documentId) || []
  }

  async createDocumentChunks(
    documentId: string,
    chunks: Omit<DocumentChunk, 'id' | 'documentId'>[]
  ): Promise<DocumentChunk[]> {
    const document = this.documents.get(documentId)
    if (!document) {
      throw new Error(`Document with id ${documentId} not found`)
    }

    const documentChunks = chunks.map(chunk => ({
      id: uuidv4(),
      documentId,
      ...chunk,
    }))

    this.documentChunks.set(documentId, documentChunks)
    return documentChunks
  }

  async similaritySearch(query: string, limit = 5, threshold = 0.7): Promise<DocumentChunk[]> {
    // In a real application, this would use vector similarity search
    // For this mock implementation, we'll do a naive text search
    const allChunks = Array.from(this.documentChunks.values()).flat()
    
    // Simple keyword match with simulated scoring
    // This is just for demonstration - real vector search would be more sophisticated
    const results = allChunks
      .map(chunk => {
        // Calculate a mock relevance score
        const queryTokens = query.toLowerCase().split(/\s+/)
        const contentLower = chunk.content.toLowerCase()
        
        let score = 0
        queryTokens.forEach(token => {
          if (contentLower.includes(token)) {
            // Simple frequency scoring
            const matches = contentLower.split(token).length - 1
            score += matches / contentLower.length
          }
        })
        
        return { ...chunk, score }
      })
      .filter(result => result.score > threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    return results
  }
}