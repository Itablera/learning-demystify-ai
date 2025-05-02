import { Conversation, Message } from './schema'

/**
 * Repository for managing conversation persistence
 * Follows the repository pattern for aggregate root (Conversation)
 */
export interface ChatRepository {
  // Conversation management (aggregate root)
  getConversation(id: string): Promise<Conversation | null>
  listConversations(limit?: number): Promise<Conversation[]>
  createConversation(title: string): Promise<Conversation>
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>
  deleteConversation(id: string): Promise<void>

  // Message management (part of the conversation aggregate)
  addMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>
  getMessages(conversationId: string): Promise<Message[]>
}
