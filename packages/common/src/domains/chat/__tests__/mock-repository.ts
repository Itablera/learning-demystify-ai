import { v4 as uuidv4 } from 'uuid'
import { Chat, Message } from '../schema'
import { ChatRepository } from '../repository'

/**
 * In-memory implementation of ChatRepository for testing
 */
export class MockChatRepository implements ChatRepository {
  private chats: Chat[] = []
  
  constructor(initialChats: Chat[] = []) {
    this.chats = initialChats
  }

  async findById(id: string): Promise<Chat | null> {
    const chat = this.chats.find(chat => chat.id === id)
    return chat || null
  }

  async findPaginated(page: number, limit: number): Promise<{
    data: Chat[]
    total: number
    page: number
    limit: number
  }> {
    const start = (page - 1) * limit
    const end = start + limit
    const data = this.chats.slice(start, end)
    
    return {
      data,
      total: this.chats.length,
      page,
      limit
    }
  }

  async createChat(name: string): Promise<Chat> {
    const now = new Date()
    const newChat: Chat = {
      id: uuidv4(),
      name,
      messages: [],
      createdAt: now,
      updatedAt: now
    }
    
    this.chats.push(newChat)
    return newChat
  }

  async renameChat(id: string, name: string): Promise<Chat> {
    const chat = await this.findById(id)
    if (!chat) {
      throw new Error(`Chat with ID ${id} not found`)
    }
    
    const updatedChat = {
      ...chat,
      name,
      updatedAt: new Date()
    }
    
    const index = this.chats.findIndex(c => c.id === id)
    this.chats[index] = updatedChat
    
    return updatedChat
  }

  async addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Chat> {
    const chat = await this.findById(chatId)
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`)
    }
    
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    }
    
    const updatedMessages = [...chat.messages, newMessage]
    const updatedChat = {
      ...chat,
      messages: updatedMessages,
      updatedAt: new Date()
    }
    
    const index = this.chats.findIndex(c => c.id === chatId)
    this.chats[index] = updatedChat
    
    return updatedChat
  }

  async deleteChat(id: string): Promise<boolean> {
    const initialLength = this.chats.length
    this.chats = this.chats.filter(chat => chat.id !== id)
    return this.chats.length < initialLength
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const chat = await this.findById(chatId)
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`)
    }
    
    return chat.messages
  }
}