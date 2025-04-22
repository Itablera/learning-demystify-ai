import { FastifyInstance } from 'fastify'
import { chatRoutes } from '@/domains/chat/routes/chat.routes.js'

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register API routes with prefix
  fastify.register(async (app) => {

    // Chat domain routes
    app.register(chatRoutes, { prefix: '/chat' })
    
    // Add other domain routes here as your application grows
    // e.g., app.register(productRoutes, { prefix: '/products' })
  }, { prefix: '/api' })
  
  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok' }
  })
}
