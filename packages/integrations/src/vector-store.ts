import { VectorSearchOptions, RetrievalResult } from '../../domains/src/chat/schema'

/**
 * Service for managing vector search operations
 * This is a domain service that encapsulates vector search functionality
 */

export interface VectorStore {
  // Vector search for RAG
  vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]>

  // Document management
  addDocument(content: string, metadata?: Record<string, unknown>): Promise<string>
}
