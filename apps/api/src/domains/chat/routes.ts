import { FastifyInstance } from 'fastify'
import { ChatController } from './controller.js'
import { ChatUseCases } from '@workspace/common/domains'
import { ChatRepositoryImpl } from './repository'
import { LangChainService } from '@/services/langchain.service'
import { ParamsSchema, QuerySchema, BodySchema, PageSchema } from './schema'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

/**
 * Chat routes registration with schema validation
 */
export async function chatRoutes(fastify: FastifyInstance) {
  // Initialize services and repositories
  const langChainService = new LangChainService()
  const chatRepository = new ChatRepositoryImpl(langChainService)
  const chatUseCases = new ChatUseCases(chatRepository)
  const chatController = new ChatController(chatUseCases)

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Get instance with type provider for zod
  const server = fastify.withTypeProvider<ZodTypeProvider>()
  
  // Get all chats with pagination using chatController.getChats
  server.get('/', {
      schema: {
        querystring: PageSchema,
      }
    },
    chatController.getChats
  )

  
  // Create a new chat
  server.post('/', {
    schema: {
      body: BodySchema.createChat
    }
  }, async (request, reply) => {
    return chatController.createChat(request as any, reply)
  })
  
  // Get a specific chat by ID
  fastify.get('/:id', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request, reply) => {
    return chatController.getChat(request as any, reply)
  })
  
  // Rename a chat
  fastify.put('/:id/rename', {
    schema: {
      params: ParamsSchema.id,
      body: BodySchema.renameChat
    }
  }, async (request, reply) => {
    return chatController.renameChat(request as any, reply)
  })
  
  // Delete a chat
  fastify.delete('/:id', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request, reply) => {
    return chatController.deleteChat(request as any, reply)
  })
  
  // Send a user message to a chat
  fastify.post('/:id/messages', {
    schema: {
      params: ParamsSchema.id,
      body: BodySchema.sendMessage
    }
  }, async (request, reply) => {
    return chatController.sendMessage(request as any, reply)
  })
  
  // Get chat history
  fastify.get('/:id/messages', {
    schema: {
      params: ParamsSchema.id
    }
  }, async (request, reply) => {
    return chatController.getChatHistory(request as any, reply)
  })
}