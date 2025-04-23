import { Chat, Message } from './schema'
import { ChatRepository } from './repository'
import { ChatActor } from '../../types'

/**
 * Use cases for the chat domain
 */
export class ChatUseCases {
  constructor(private repository: ChatRepository) {}

  /**
   * Get a chat by ID
   */
  async getChat(id: string): Promise<Chat | null> {
    return this.repository.findById(id)
  }

  /**
   * Get paginated list of chats
   */
  async getChats(page = 1, limit = 10): Promise<{
    data: Chat[]
    total: number
    page: number
    limit: number
  }> {
    return this.repository.findPaginated(page, limit)
  }

  /**
   * Create a new chat
   */
  async createChat(name: string): Promise<Chat> {
    return this.repository.createChat(name)
  }

  /**
   * Rename a chat
   */
  async renameChat(id: string, name: string): Promise<Chat> {
    return this.repository.renameChat(id, name)
  }

  /**
   * Delete a chat
   */
  async deleteChat(id: string): Promise<boolean> {
    return this.repository.deleteChat(id)
  }

  /**
   * Add a user message to a chat
   */
  async addUserMessage(chatId: string, content: string): Promise<Chat> {
    return this.repository.addMessage(chatId, {
      content,
      actor: ChatActor.USER
    })
  }

  /**
   * Add an assistant message to a chat
   */
  async addAssistantMessage(chatId: string, content: string): Promise<Chat> {
    return this.repository.addMessage(chatId, {
      content,
      actor: ChatActor.ASSISTANT
    })
  }

  /**
   * Add a system message to a chat
   */
  async addSystemMessage(chatId: string, content: string): Promise<Chat> {
    return this.repository.addMessage(chatId, {
      content,
      actor: ChatActor.SYSTEM
    })
  }

  /**
   * Get the history of a chat
   */
  async getChatHistory(chatId: string): Promise<Message[]> {
    return this.repository.getMessages(chatId)
  }

  /**
   * Create a new chat with an initial system message
   */
  async createChatWithSystemPrompt(name: string, systemPrompt: string): Promise<Chat> {
    const chat = await this.repository.createChat(name)
    await this.repository.addMessage(chat.id, {
      content: systemPrompt,
      actor: ChatActor.SYSTEM
    })
    return this.repository.findById(chat.id) as Promise<Chat>
  }
}