import { Conversation, Message, RetrievalResult, VectorSearchOptions } from './schema'

export interface ChatRepository {
  // Conversation management
  getConversation(id: string): Promise<Conversation | null>
  listConversations(limit?: number): Promise<Conversation[]>
  createConversation(title: string): Promise<Conversation>
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>
  deleteConversation(id: string): Promise<void>

  // Message management
  addMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>
  getMessages(conversationId: string): Promise<Message[]>
}

export interface VectorRepository {
  // Vector search for RAG
  vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]>

  // Document management
  addDocument(content: string, metadata?: Record<string, unknown>): Promise<string>
}

export interface AIRepository {
  // Generate a completion based on messages and optional retrieval results
  generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string>

  // Stream a completion based on messages and optional retrieval results
  streamCompletion(messages: Message[], context?: RetrievalResult[]): AsyncGenerator<string>
}

/**
 * Service for generating embeddings from text
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
