import { v4 as uuidv4 } from 'uuid'
import { 
  Chat, 
  Message, 
  ChatRepository, 
  MessageInput
} from '@workspace/common/domains'
import { ChatActor } from '@workspace/common/types'
import { LangChainService } from '@/services/langchain.service'

/**
 * Implementation of the ChatRepository interface for the backend
 */
export class ChatRepositoryImpl implements ChatRepository {
  private chats: Map<string, Chat> = new Map()
  
  constructor(private langChainService: LangChainService) {}

  async findById(id: string): Promise<Chat | null> {
    const chat = this.chats.get(id)
    return chat || null
  }

  async findPaginated(page: number, limit: number): Promise<{
    data: Chat[]
    total: number
    page: number
    limit: number
  }> {
    const allChats = Array.from(this.chats.values())
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedChats = allChats.slice(start, end)
    
    return {
      data: paginatedChats,
      total: allChats.length,
      page,
      limit
    }
  }

  async createChat(name: string): Promise<Chat> {
    const now = new Date()
    const id = uuidv4()
    
    const newChat: Chat = {
      id,
      name,
      messages: [],
      createdAt: now,
      updatedAt: now
    }
    
    this.chats.set(id, newChat)
    return newChat
  }

  async renameChat(id: string, name: string): Promise<Chat> {
    const chat = await this.findById(id)
    if (!chat) {
      throw new Error(`Chat with ID ${id} not found`)
    }
    
    const updatedChat: Chat = {
      ...chat,
      name,
      updatedAt: new Date()
    }
    
    this.chats.set(id, updatedChat)
    return updatedChat
  }

  async addMessage(chatId: string, message: MessageInput): Promise<Chat> {
    const chat = await this.findById(chatId)
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`)
    }
    if (!message.content) {
      throw new Error('Message content cannot be empty')
    }
    
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    }
    
    // If this is a user message, we might want to generate an AI response
    let aiResponseMessage: Message | null = null
    if (message.actor === ChatActor.USER) {
      try {
        const history = [...chat.messages]
        const aiResponse = await this.langChainService.generateChatResponse(
          newMessage.content,
          history
        )
        
        aiResponseMessage = {
          id: uuidv4(),
          content: aiResponse,
          actor: ChatActor.ASSISTANT,
          timestamp: new Date()
        }
      } catch (error) {
        console.error('Error generating AI response:', error)
      }
    }
    
    const updatedMessages = aiResponseMessage 
      ? [...chat.messages, newMessage, aiResponseMessage]
      : [...chat.messages, newMessage]
    
    const updatedChat: Chat = {
      ...chat,
      messages: updatedMessages,
      updatedAt: new Date()
    }
    
    this.chats.set(chatId, updatedChat)
    return updatedChat
  }

  async deleteChat(id: string): Promise<boolean> {
    return this.chats.delete(id)
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const chat = await this.findById(chatId)
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`)
    }
    
    return chat.messages
  }
}