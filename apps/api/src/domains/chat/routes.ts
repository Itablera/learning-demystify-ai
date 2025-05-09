import { RoutesProvider } from '@/index'
import { DataResponseSchema } from '@workspace/api'
import config from '@workspace/env'
import { langchain } from '@workspace/integrations'
import { ChatDependencies } from '@workspace/use-cases'
import z from 'zod'

/**
 * Chat domain routes for the API
 */
export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  // Initialize dependencies
  const dependencies: ChatDependencies = {
    aiService: new langchain.OllamaAIService(config.ollama.model, config.ollama.apiUrl),
    vectorStore: new langchain.QdrantVectorStore(
      config.vectorDb.qdrantUrl,
      config.vectorDb.collectionName
    ),
  }

  // Non streaming completion
  routes.get('/', {
    schema: {
      tags: ['chat'],
      response: {
        200: DataResponseSchema(z.string()),
      },
    },
    handler: async () => {
      const response = await dependencies.aiService.generateResponse(
        'What is the capital of France?'
      )

      return {
        data: response,
        success: true,
        message: 'Response generated successfully',
        timestamp: new Date().toISOString(),
      }
    },
  })

  routes.post('/chat', {
    schema: {
      tags: ['chat'],
      body: z.object({
        query: z.string(),
      }),
      response: {
        200: DataResponseSchema(z.string()),
      },
    },
    handler: async request => {
      const { query } = request.body

      const context = await dependencies.vectorStore.vectorSearch(query)
      const response = await dependencies.aiService.generateResponse(query, context)

      return {
        data: response,
        success: true,
        message: 'Response generated successfully',
        timestamp: new Date().toISOString(),
      }
    },
  })
}
