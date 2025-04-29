import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ChatUseCases } from '@workspace/common/domains'
import { ChatRepositoryImpl } from './repository'
import { LangChainService } from '@/services/langchain.service'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { 
  ParamsSchema, 
  QuerySchema, 
  BodySchema, 
  PageSchema,
  ChatIdParams,
  PaginationQuery,
  CreateChatBody,
  RenameChatBody,
  SendMessageBody,
  Page,
  ChatsResponseSchema
} from '@workspace/api/domains/chat/schema'

/**
 * Chat routes registration with schema validation
 */
export async function chatRoutes(fastify: FastifyInstance) {
  // Initialize services and repositories
  const langChainService = new LangChainService()
  const chatRepository = new ChatRepositoryImpl(langChainService)
  const chatUseCases = new ChatUseCases(chatRepository)

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  // Get instance with type provider for zod
  const server = fastify.withTypeProvider<ZodTypeProvider>()
  
  // Get all chats with pagination
  server.get('/', {
    schema: {
      querystring: PageSchema,
      response: {
        200: ChatsResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Querystring: Page }>, reply: FastifyReply) => {
    const { page, limit } = request.query
    
    try {
      const result = await chatUseCases.getChats(page, limit)
      return reply.code(200).send(result)
    } catch (error) {
      console.error('Error fetching chats:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Create a new chat
  server.post('/', {
    schema: {
      body: BodySchema.createChat
    }
  }, async (request: FastifyRequest<{ Body: CreateChatBody }>, reply: FastifyReply) => {
    try {
      const { name, systemPrompt } = request.body
      
      let chat
      
      if (systemPrompt) {
        chat = await chatUseCases.createChatWithSystemPrompt(name, systemPrompt)
      } else {
        chat = await chatUseCases.createChat(name)
      }
      
      return reply.code(201).send(chat)
    } catch (error) {
      console.error('Error creating chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Get a specific chat by ID
  server.get('/:id', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request: FastifyRequest<{ Params: ChatIdParams }>, reply: FastifyReply) => {
    const { id } = request.params
    
    try {
      const chat = await chatUseCases.getChat(id)
      
      if (!chat) {
        return reply.code(404).send({ error: 'Chat not found' })
      }
      
      return reply.code(200).send(chat)
    } catch (error) {
      console.error('Error fetching chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Rename a chat
  server.put('/:id/rename', {
    schema: {
      params: ParamsSchema.id,
      body: BodySchema.renameChat
    }
  }, async (request: FastifyRequest<{
    Params: ChatIdParams,
    Body: RenameChatBody
  }>, reply: FastifyReply) => {
    const { id } = request.params
    const { name } = request.body
    
    try {
      const chat = await chatUseCases.renameChat(id, name)
      
      return reply.code(200).send(chat)
    } catch (error) {
      console.error('Error renaming chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Delete a chat
  server.delete('/:id', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request: FastifyRequest<{ Params: ChatIdParams }>, reply: FastifyReply) => {
    const { id } = request.params
    
    try {
      const success = await chatUseCases.deleteChat(id)
      
      if (!success) {
        return reply.code(404).send({ error: 'Chat not found' })
      }
      
      return reply.code(204).send()
    } catch (error) {
      console.error('Error deleting chat:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Send a user message to a chat
  server.post('/:id/messages', {
    schema: {
      params: ParamsSchema.id,
      body: BodySchema.sendMessage
    }
  }, async (request: FastifyRequest<{
    Params: ChatIdParams,
    Body: SendMessageBody
  }>, reply: FastifyReply) => {
    const { id } = request.params
    const { message } = request.body
    
    try {
      // Add the user message to the chat
      const updatedChat = await chatUseCases.addUserMessage(id, message)
      
      return reply.code(200).send(updatedChat)
    } catch (error) {
      console.error('Error sending message:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
  
  // Get chat history
  server.get('/:id/messages', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request: FastifyRequest<{ Params: ChatIdParams }>, reply: FastifyReply) => {
    const { id } = request.params
    
    try {
      const messages = await chatUseCases.getChatHistory(id)
      return reply.code(200).send(messages)
    } catch (error) {
      console.error('Error fetching chat history:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}