import { FastifyInstance } from 'fastify'
import { ChatController } from '../controllers/chat.controller.js'

export async function chatRoutes(fastify: FastifyInstance) {
  const chatController = new ChatController(fastify)
  
  // GET /users - Get all users with pagination (admin only)
  fastify.get('/health', async () => {
    return { status: 'ok' }
  })
}
