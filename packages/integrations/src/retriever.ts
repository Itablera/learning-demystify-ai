import { RetrievalResult, VectorSearchOptions } from '../../domains/src/chat/schema'

/**
 * Service for retrieving relevant information from a knowledge base
 * Core component of RAG (Retrieval Augmented Generation)
 */
export interface Retriever {
  /**
   * Retrieve relevant information based on a query
   * @param query The search query
   * @param options Optional vector search configuration
   */
  retrieve(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]>

  /**
   * Add a document to the retriever's knowledge base
   * @param content Document content
   * @param metadata Optional metadata
   */
  addDocument(content: string, metadata?: Record<string, unknown>): Promise<string>
}
