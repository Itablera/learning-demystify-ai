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

  // Vector search for RAG
  vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]>

  // Embedding management
  addDocument(content: string, metadata?: Record<string, any>): Promise<string>
}
