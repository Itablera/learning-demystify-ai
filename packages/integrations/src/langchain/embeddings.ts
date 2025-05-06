import { OllamaEmbeddings } from '@langchain/ollama'
import { Embeddings } from '../embeddings'
import { ollamaConfig, embeddingsConfig } from '@workspace/env'

/**
 * LangChain implementation of the Embeddings interface
 */
export class LangChainEmbeddings implements Embeddings {
  private embeddingModel: OllamaEmbeddings

  constructor(
    options: {
      modelName?: string
    } = {}
  ) {
    const { modelName } = options

    this.embeddingModel = new OllamaEmbeddings({
      model: modelName || embeddingsConfig.model,
      baseUrl: ollamaConfig.apiUrl,
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
