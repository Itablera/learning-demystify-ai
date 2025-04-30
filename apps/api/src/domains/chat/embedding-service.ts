import fetch from 'node-fetch'
import { env } from '@/env'

export interface EmbeddingService {
  getEmbedding(text: string): Promise<number[]>
}

/**
 * Embedding service using Ollama's embedding endpoint
 */
export class OllamaEmbeddingService implements EmbeddingService {
  private model: string
  private baseUrl: string
  private dimension: number

  constructor(
    model: string = env.EMBEDDING_MODEL,
    baseUrl: string = env.OLLAMA_API_URL,
    dimension: number = env.EMBEDDING_DIMENSION
  ) {
    this.model = model
    this.baseUrl = baseUrl
    this.dimension = dimension
  }

  /**
   * Get an embedding for the given text using Ollama
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = (await response.json()) as { embedding: number[] }
      return data.embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Fallback to random embedding in case of failure
      return this.getRandomEmbedding()
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
export class MockEmbeddingService implements EmbeddingService {
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
