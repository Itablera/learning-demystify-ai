import { env } from '@/env'
import { ChatRepository } from '@workspace/domains'
import { AI, VectorStore } from '@workspace/integrations'
import { InMemoryChatRepository } from './chat-repository'
import { QdrantVectorStore, InMemoryVectorService } from '../../integrations/vector-store'
import { OllamaAI } from '../../integrations/ai'
import { LangChainEmbeddings } from '../../integrations/embeddings'

/**
 * Factory class for creating services used in the chat domain
 */
export class ChatServiceFactory {
  /**
   * Create all services required for the chat domain
   */
  static createServices(): {
    chatRepository: ChatRepository
    vectorStore: VectorStore
    ai: AI
  } {
    // Create embedding service with LangChain
    const embeddingService = new LangChainEmbeddings(
      env.EMBEDDING_MODEL,
      env.OLLAMA_API_URL,
      env.EMBEDDING_DIMENSION
    )

    // Create repository and service instances
    const chatRepository = new InMemoryChatRepository()
    const vectorStore = new QdrantVectorStore(env.QDRANT_URL, 'documents', embeddingService)
    const ai = new OllamaAI(env.OLLAMA_MODEL, env.OLLAMA_API_URL)

    return {
      chatRepository,
      vectorStore,
      ai,
    }
  }

  /**
   * Initialize the vector service
   */
  static async initializeVectorService(vectorStore: VectorStore): Promise<VectorStore> {
    try {
      if (vectorStore instanceof QdrantVectorStore) {
        await vectorStore.initialize()
        console.log('Qdrant vector service initialized successfully')
        return vectorStore
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant vector service:', error)
      console.warn('Falling back to in-memory vector service')

      // Create embedding service with LangChain
      const embeddingService = new LangChainEmbeddings(
        env.EMBEDDING_MODEL,
        env.OLLAMA_API_URL,
        env.EMBEDDING_DIMENSION
      )

      // Create fallback in-memory service
      return new InMemoryVectorService(embeddingService)
    }

    return vectorStore
  }
}
