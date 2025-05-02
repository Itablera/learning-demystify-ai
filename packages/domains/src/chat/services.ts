import { Message, RetrievalResult, VectorSearchOptions } from './schema'

/**
 * Service for interacting with AI models
 * This is a domain service that encapsulates AI functionality
 */
export interface AIService {
  // Generate a completion based on messages and optional retrieval results
  generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string>

  // Stream a completion based on messages and optional retrieval results
  streamCompletion(messages: Message[], context?: RetrievalResult[]): AsyncGenerator<string>
}

/**
 * Service for managing vector search operations
 * This is a domain service that encapsulates vector search functionality
 */
export interface VectorService {
  // Vector search for RAG
  vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]>

  // Document management
  addDocument(content: string, metadata?: Record<string, unknown>): Promise<string>
}

/**
 * Service for generating embeddings from text
 * This is a domain service for creating vector representations of text
 */
export interface EmbeddingService {
  /**
   * Convert text to a vector embedding
   */
  getEmbedding(text: string): Promise<number[]>

  /**
   * Convert multiple texts to vector embeddings (optional batch processing)
   */
  embedBatch?(texts: string[]): Promise<number[][]>
}
