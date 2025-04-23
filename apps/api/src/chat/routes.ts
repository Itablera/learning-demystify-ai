import { FastifyInstance } from 'fastify'
import { ChatController } from './controller'
import { ChatUseCases } from '@workspace/common/domains/chat'
import { ChatRepositoryImpl } from './repository'
import { LangChainService } from '../services/langchain.service'

/**
 * Chat routes registration
 */
export async function chatRoutes(fastify: FastifyInstance) {
  // Initialize services and repositories
  const langChainService = new LangChainService()
  const chatRepository = new ChatRepositoryImpl(langChainService)
  const chatUseCases = new ChatUseCases(chatRepository)
  const chatController = new ChatController(chatUseCases)
  
  // Get all chats with pagination
  fastify.get('/', async (request, reply) => {
    return chatController.getChats(request, reply)
  })
  
  // Create a new chat
  fastify.post('/', async (request, reply) => {
    return chatController.createChat(request, reply)
  })
  
  // Get a specific chat by ID
  fastify.get('/:id', async (request, reply) => {
    return chatController.getChat(request, reply)
  })
  
  // Rename a chat
  fastify.put('/:id/rename', async (request, reply) => {
    return chatController.renameChat(request, reply)
  })
  
  // Delete a chat
  fastify.delete('/:id', async (request, reply) => {
    return chatController.deleteChat(request, reply)
  })
  
  // Send a user message to a chat
  fastify.post('/:id/messages', async (request, reply) => {
    return chatController.sendMessage(request, reply)
  })
  
  // Get chat history
  fastify.get('/:id/messages', async (request, reply) => {
    return chatController.getChatHistory(request, reply)
  })
}