import { v4 as uuidv4 } from 'uuid'
import { Document, DocumentChunk, DocumentRepository } from '@workspace/domains'
import { Embeddings } from '@workspace/integrations'

/**
 * In-memory implementation of DocumentRepository
 * This is used for development and testing purposes
 */
export class InMemoryDocumentRepository implements DocumentRepository {
  private documents: Map<string, Document> = new Map()
  private chunks: Map<string, DocumentChunk[]> = new Map()
  private embeddings: Embeddings

  constructor(embeddings: Embeddings) {
    this.embeddings = embeddings
  }

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

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    return this.chunks.get(documentId) || []
  }

  async createDocumentChunks(
    documentId: string,
    chunks: Omit<DocumentChunk, 'id' | 'documentId'>[]
  ): Promise<DocumentChunk[]> {
    const documentChunks: DocumentChunk[] = chunks.map(chunk => ({
      id: uuidv4(),
      documentId,
      ...chunk,
    }))

    this.chunks.set(documentId, documentChunks)
    return documentChunks
  }

  async similaritySearch(
    query: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<DocumentChunk[]> {
    // Get all chunks from all documents
    const allChunks: DocumentChunk[] = Array.from(this.chunks.values()).flat()

    // If no chunks or no embeddings, return empty array
    if (allChunks.length === 0) {
      return []
    }

    // Get query embedding
    const queryEmbedding = await this.embeddings.getEmbedding(query)

    // Calculate cosine similarity for each chunk
    const chunksWithSimilarities = await Promise.all(
      allChunks.map(async chunk => {
        if (!chunk.embedding) {
          // If chunk doesn't have embedding, generate it
          chunk.embedding = await this.embeddings.getEmbedding(chunk.content)
        }

        // Calculate cosine similarity
        const similarity = this.calculateCosineSimilarity(queryEmbedding, chunk.embedding)
        return { chunk, similarity }
      })
    )

    // Filter by threshold and sort by similarity (highest first)
    return chunksWithSimilarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.chunk)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] || 0 * (vecB[i] || 0)
      normA += (vecA[i] || 0) * (vecA[i] || 0)
      normB += (vecB[i] || 0) * (vecB[i] || 0)
    }

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
