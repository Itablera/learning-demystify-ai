import { ChatRepository, Conversation, Message } from '@workspace/domains'
import { randomUUID } from 'crypto'

/**
 * In-memory implementation of ChatRepository for testing
 */
export class MockChatRepository implements ChatRepository {
  private conversations: Map<string, Conversation> = new Map()

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null
  }

  async listConversations(limit?: number): Promise<Conversation[]> {
    const conversations = Array.from(this.conversations.values())
    return limit ? conversations.slice(0, limit) : conversations
  }

  async createConversation(title: string): Promise<Conversation> {
    const id = randomUUID()
    const now = new Date().toISOString()

    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }

    this.conversations.set(id, conversation)
    return conversation
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id)
    if (!conversation) {
      throw new Error(`Conversation with ID ${id} not found`)
    }

    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.conversations.set(id, updatedConversation)
    return updatedConversation
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id)
  }

  async addMessage(
    conversationId: string,
    message: Omit<Message, 'id' | 'createdAt'>
  ): Promise<Message> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`)
    }

    const newMessage: Message = {
      id: randomUUID(),
      ...message,
      createdAt: new Date().toISOString(),
    }

    conversation.messages.push(newMessage)
    conversation.updatedAt = new Date().toISOString()

    return newMessage
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`)
    }

    return conversation.messages
  }

  // Test helper methods
  setConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, conversation)
  }
}
