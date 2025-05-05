import { Message, RetrievalResult } from '../../domains/src/chat/schema'

/**
 * Service for interacting with AI models
 * This is a domain service that encapsulates AI functionality
 */

export interface AI {
  // Generate a completion based on messages and optional retrieval results
  generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string>

  // Stream a completion based on messages and optional retrieval results
  streamCompletion(messages: Message[], context?: RetrievalResult[]): AsyncGenerator<string>
  
  // Generate embeddings for text (used for RAG)
  generateEmbedding(text: string): Promise<number[]>
  
  // Generate embeddings for multiple texts in batch
  generateEmbeddings(texts: string[]): Promise<number[][]>
}
