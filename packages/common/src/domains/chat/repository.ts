import { Chat, Message } from './schema'

export interface ChatRepository {
  /**
   * Find a chat by its ID
   */
  findById(id: string): Promise<Chat | null>

  /**
   * Find all chats with pagination
   */
  findPaginated(page: number, limit: number): Promise<{
    data: Chat[]
    total: number
    page: number
    limit: number
  }>

  /**
   * Create a new chat
   */
  createChat(name: string): Promise<Chat>

  /**
   * Rename an existing chat
   */
  renameChat(id: string, name: string): Promise<Chat>

  /**
   * Add a message to a chat
   */
  addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Chat>

  /**
   * Delete a chat by its ID
   */
  deleteChat(id: string): Promise<boolean>
  
  /**
   * Get all messages in a chat
   */
  getMessages(chatId: string): Promise<Message[]>
}