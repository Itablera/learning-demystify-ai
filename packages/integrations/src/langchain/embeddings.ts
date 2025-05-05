import { OllamaEmbeddings } from '@langchain/ollama'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Embeddings } from '../embeddings'

/**
 * LangChain implementation of the Embeddings interface
 * Supports different embedding providers (Ollama or OpenAI)
 */
export class LangChainEmbeddings implements Embeddings {
  private embeddingModel: OllamaEmbeddings | OpenAIEmbeddings
  
  constructor(
    providerType: 'ollama' | 'openai' = 'ollama',
    options: {
      modelName?: string
      apiKey?: string
    } = {}
  ) {
    const { modelName, apiKey } = options
    
    if (providerType === 'ollama') {
      this.embeddingModel = new OllamaEmbeddings({
        model: modelName || 'nomic-embed-text',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      })
    } else {
      this.embeddingModel = new OpenAIEmbeddings({
        modelName: modelName || 'text-embedding-3-small',
        openAIApiKey: apiKey || process.env.OPENAI_API_KEY
      })
    }
  }
  
  /**
   * Get embedding vector for a single text
   */
  async getEmbedding(text: string): Promise<number[]> {
    return this.embeddingModel.embedQuery(text)
  }
  
  /**
   * Get embedding vectors for multiple texts (batch processing)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    return this.embeddingModel.embedDocuments(texts)
  }
}