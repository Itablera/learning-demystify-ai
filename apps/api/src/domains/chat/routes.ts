import { RoutesProvider } from '@/index'
import { DataResponseSchema } from '@workspace/api'
import config from '@workspace/env'
import { langchain } from '@workspace/integrations'
import { RAGChatDependencies, RAGChat, ChatDependencies, Chat } from '@workspace/use-cases'
import z from 'zod'

/**
 * Chat domain routes for the API
 */
export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  const chatDependencies: ChatDependencies = {
    aiService: new langchain.OllamaAIService(config.ollama.model, config.ollama.apiUrl),
  }
  const ragChatDependencies: RAGChatDependencies = {
    ...chatDependencies,
    vectorStore: new langchain.QdrantVectorStore(
      config.vectorDb.qdrantUrl,
      config.vectorDb.collectionName
    ),
  }

  // Simple chat route
  routes.post(
    '/chat',
    {
      schema: {
        body: z.object({
          query: z.string(),
        }),
        response: {
          200: DataResponseSchema(z.string()),
        },
      },
    },
    async request => {
      const { query } = request.body
      const response = await Chat(chatDependencies, query)
      return {
        data: response,
        success: true,
        message: 'Chat response generated successfully',
        timestamp: new Date().toISOString(),
      }
    }
  )
  // RAG chat route
  routes.post(
    '/rag-chat',
    {
      schema: {
        body: z.object({
          query: z.string(),
        }),
        response: {
          200: DataResponseSchema(z.string()),
        },
      },
    },
    async request => {
      const { query } = request.body
      const response = await RAGChat(ragChatDependencies, query)
      return {
        data: response,
        success: true,
        message: 'RAG chat response generated successfully',
        timestamp: new Date().toISOString(),
      }
    }
  )
}
