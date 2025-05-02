import { env } from '@/env'
import { ChatRepository, VectorService, AIService, ChatUseCases } from '@workspace/domains'
import { InMemoryChatRepository } from './chat-repository'
import { QdrantVectorService, InMemoryVectorService } from './vector-service'
import { OllamaAIService } from './ai-service'
import { LangChainEmbeddingService } from './embedding-service'

/**
 * Factory class for creating services used in the chat domain
 */
export class ChatServiceFactory {
  /**
   * Create all services required for the chat domain
   */
  static createServices(): {
    chatUseCases: ChatUseCases
    chatRepository: ChatRepository
    vectorService: VectorService
    aiService: AIService
  } {
    // Create embedding service with LangChain
    const embeddingService = new LangChainEmbeddingService(
      env.EMBEDDING_MODEL,
      env.OLLAMA_API_URL,
      env.EMBEDDING_DIMENSION
    )

    // Create repository and service instances
    const chatRepository = new InMemoryChatRepository()
    const vectorService = new QdrantVectorService(env.QDRANT_URL, 'documents', embeddingService)
    const aiService = new OllamaAIService(env.OLLAMA_MODEL, env.OLLAMA_API_URL)

    // Create use-cases with repository and services
    const chatUseCases = new ChatUseCases(chatRepository, vectorService, aiService)

    return {
      chatUseCases,
      chatRepository,
      vectorService,
      aiService,
    }
  }

  /**
   * Initialize the vector service
   */
  static async initializeVectorService(vectorService: VectorService): Promise<VectorService> {
    try {
      if (vectorService instanceof QdrantVectorService) {
        await vectorService.initialize()
        console.log('Qdrant vector service initialized successfully')
        return vectorService
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant vector service:', error)
      console.warn('Falling back to in-memory vector service')

      // Create embedding service with LangChain
      const embeddingService = new LangChainEmbeddingService(
        env.EMBEDDING_MODEL,
        env.OLLAMA_API_URL,
        env.EMBEDDING_DIMENSION
      )

      // Create fallback in-memory service
      return new InMemoryVectorService(embeddingService)
    }

    return vectorService
  }
}
