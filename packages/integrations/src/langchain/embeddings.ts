import { OllamaEmbeddings } from '@langchain/ollama'
import { Embeddings } from '../embeddings'

/**
 * LangChain implementation of the Embeddings interface
 */
export class LangChainEmbeddings implements Embeddings {
  private embeddingModel: OllamaEmbeddings

  constructor(
    options: {
      modelName?: string
      apiKey?: string
    } = {}
  ) {
    const { modelName, apiKey } = options

    this.embeddingModel = new OllamaEmbeddings({
      model: modelName || 'nomic-embed-text',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    })
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
