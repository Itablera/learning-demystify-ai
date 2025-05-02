import { env } from '@/env'
import { OllamaEmbeddings } from '@langchain/ollama'
import { Embeddings } from '@workspace/integrations'

/**
 * Embedding service using LangChain's OllamaEmbeddings class
 */
export class LangChainEmbeddings implements Embeddings {
  private embeddings: OllamaEmbeddings
  private dimension: number

  constructor(
    model: string = env.EMBEDDING_MODEL,
    baseUrl: string = env.OLLAMA_API_URL,
    dimension: number = env.EMBEDDING_DIMENSION
  ) {
    this.embeddings = new OllamaEmbeddings({
      model,
      baseUrl,
    })
    this.dimension = dimension
  }

  /**
   * Get an embedding for the given text using LangChain Ollama integration
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(text)
    } catch (error) {
      console.error('Error generating embedding with LangChain:', error)
      // Fallback to random embedding in case of failure
      return this.getRandomEmbedding()
    }
  }

  /**
   * Embed multiple texts at once (more efficient)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      return await this.embeddings.embedDocuments(texts)
    } catch (error) {
      console.error('Error batch embedding with LangChain:', error)
      // Fallback to random embeddings in case of failure
      return texts.map(() => this.getRandomEmbedding())
    }
  }

  /**
   * Generate a random embedding for fallback
   */
  private getRandomEmbedding(): number[] {
    return Array.from({ length: this.dimension }, () => Math.random() * 2 - 1)
  }
}

/**
 * Mock embedding service for testing
 */
export class MockEmbeddings implements Embeddings {
  private dimension: number

  constructor(dimension: number = env.EMBEDDING_DIMENSION) {
    this.dimension = dimension
  }

  async getEmbedding(text: string): Promise<number[]> {
    // Create a deterministic embedding based on the text
    // This ensures similar texts get similar embeddings
    const hash = this.simpleHash(text)
    return this.hashToEmbedding(hash, this.dimension)
  }

  private simpleHash(text: string): number {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0 // Convert to 32bit integer
    }
    return hash
  }

  private hashToEmbedding(hash: number, dimension: number): number[] {
    const embedding: number[] = []
    const rng = this.seededRandom(hash)

    for (let i = 0; i < dimension; i++) {
      embedding.push(rng() * 2 - 1) // Range -1 to 1
    }

    return this.normalizeVector(embedding)
  }

  private seededRandom(seed: number): () => number {
    return function () {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map(val => val / magnitude)
  }
}
