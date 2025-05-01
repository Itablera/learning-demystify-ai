import { env } from '@/env'
import { ChatRepository, VectorRepository, AIRepository, ChatUseCases } from '@workspace/domains'
import { InMemoryChatRepository } from './chat-repository'
import { QdrantVectorRepository, InMemoryVectorRepository } from './vector-repository'
import { OllamaAIRepository } from './ai-repository'
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
    vectorRepository: VectorRepository
    aiRepository: AIRepository
  } {
    // Create embedding service with LangChain
    const embeddingService = new LangChainEmbeddingService(
      env.EMBEDDING_MODEL,
      env.OLLAMA_API_URL,
      env.EMBEDDING_DIMENSION
    )

    // Create repository instances
    const chatRepository = new InMemoryChatRepository()
    const vectorRepository = new QdrantVectorRepository(
      env.QDRANT_URL,
      'documents',
      embeddingService
    )
    const aiRepository = new OllamaAIRepository(env.OLLAMA_MODEL, env.OLLAMA_API_URL)

    // Create use-cases with repositories
    const chatUseCases = new ChatUseCases(chatRepository, vectorRepository, aiRepository)

    return {
      chatUseCases,
      chatRepository,
      vectorRepository,
      aiRepository,
    }
  }

  /**
   * Initialize the vector repository
   */
  static async initializeVectorRepository(
    vectorRepository: VectorRepository
  ): Promise<VectorRepository> {
    try {
      if (vectorRepository instanceof QdrantVectorRepository) {
        await vectorRepository.initialize()
        console.log('Qdrant vector repository initialized successfully')
        return vectorRepository
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant vector repository:', error)
      console.warn('Falling back to in-memory vector repository')

      // Create embedding service with LangChain
      const embeddingService = new LangChainEmbeddingService(
        env.EMBEDDING_MODEL,
        env.OLLAMA_API_URL,
        env.EMBEDDING_DIMENSION
      )

      // Create fallback in-memory repository
      return new InMemoryVectorRepository(embeddingService)
    }

    return vectorRepository
  }
}
