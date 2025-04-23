import { FastifyRequest, FastifyReply } from 'fastify'
import { ChatUseCases } from '@workspace/common/domains'
import { 
  ParamsSchema, 
  QuerySchema, 
  BodySchema,
  ChatIdParams,
  PaginationQuery,
  CreateChatBody,
  RenameChatBody,
  SendMessageBody,
  Page
} from './schema.js'

/**
 * Controller for handling chat-related HTTP requests
 */
export class ChatController {
  constructor(private useCases: ChatUseCases) {}

  /**
   * Get a chat by ID
   */
  async getChat(
    request: FastifyRequest<{
      Params: ChatIdParams
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    
    try {
      const chat = await this.useCases.getChat(id)
      
      if (!chat) {
        return reply.code(404).send({ error: 'Chat not found' })
      }
      
      return reply.code(200).send(chat)
    } catch (error) {
      console.error('Error fetching chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Get paginated list of chats
   */
  async getChats(
    request: FastifyRequest< { Querystring: Page }>,
    reply: FastifyReply
  ) {
    const { page, limit } = request.query
    
    try {
      const result = await this.useCases.getChats(page, limit)
      return reply.code(200).send(result)
    } catch (error) {
      console.error('Error fetching chats:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Create a new chat
   */
  async createChat(
    request: FastifyRequest<{
      Body: CreateChatBody
    }>,
    reply: FastifyReply
  ) {
    try {
      const { name, systemPrompt } = request.body
      
      let chat
      
      if (systemPrompt) {
        chat = await this.useCases.createChatWithSystemPrompt(name, systemPrompt)
      } else {
        chat = await this.useCases.createChat(name)
      }
      
      return reply.code(201).send(chat)
    } catch (error) {
      console.error('Error creating chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Rename a chat
   */
  async renameChat(
    request: FastifyRequest<{
      Params: ChatIdParams,
      Body: RenameChatBody
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const { name } = request.body
    
    try {
      const chat = await this.useCases.renameChat(id, name)
      
      return reply.code(200).send(chat)
    } catch (error) {
      console.error('Error renaming chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Delete a chat
   */
  async deleteChat(
    request: FastifyRequest<{
      Params: ChatIdParams
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    
    try {
      const success = await this.useCases.deleteChat(id)
      
      if (!success) {
        return reply.code(404).send({ error: 'Chat not found' })
      }
      
      return reply.code(204).send()
    } catch (error) {
      console.error('Error deleting chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Send a user message and get AI response
   */
  async sendMessage(
    request: FastifyRequest<{
      Params: ChatIdParams,
      Body: SendMessageBody
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const { message } = request.body
    
    try {
      // Add the user message to the chat
      const updatedChat = await this.useCases.addUserMessage(id, message)
      
      return reply.code(200).send(updatedChat)
    } catch (error) {
      console.error('Error sending message:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(
    request: FastifyRequest<{
      Params: ChatIdParams
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    
    try {
      const messages = await this.useCases.getChatHistory(id)
      return reply.code(200).send(messages)
    } catch (error) {
      console.error('Error fetching chat history:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  }
}