import { FastifyInstance } from 'fastify'
import { healthRoutes } from '@/domains/health'
import { documentRoutes } from '@/domains/document'
import { chatRoutes } from '@/domains/chat'

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register API routes with prefix
  fastify.register(
    async app => {
      // Health domain routes
      app.register(healthRoutes, { prefix: '/health' })

      // Document domain routes
      app.register(documentRoutes, { prefix: '/documents' })

      // Chat domain routes
      app.register(chatRoutes, { prefix: '/chat' })

      // Add other domain routes here as your application grows
      // e.g., app.register(productRoutes, { prefix: '/products' })
    },
    { prefix: '/api' }
  )

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok' }
  })
}
