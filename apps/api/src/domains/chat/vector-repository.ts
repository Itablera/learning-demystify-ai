import { VectorRepository, RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { QdrantClient } from '@qdrant/js-client-rest'
import { randomUUID } from 'crypto'
import { env } from '@/env'
import { EmbeddingService, OllamaEmbeddingService, MockEmbeddingService } from './embedding-service'

export class QdrantVectorRepository implements VectorRepository {
  private client: QdrantClient
  private collectionName: string
  private embeddingService: EmbeddingService

  constructor(
    connectionString: string = env.QDRANT_URL,
    collectionName: string = 'documents',
    embeddingService?: EmbeddingService
  ) {
    this.client = new QdrantClient({ url: connectionString })
    this.collectionName = collectionName
    this.embeddingService = embeddingService || new OllamaEmbeddingService()
  }

  /**
   * Initialize the Qdrant collection if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections()
      const collectionExists = collections.collections.some(
        collection => collection.name === this.collectionName
      )

      // Create collection if it doesn't exist
      if (!collectionExists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: env.EMBEDDING_DIMENSION,
            distance: 'Cosine',
          },
        })
        console.log(`Created Qdrant collection: ${this.collectionName}`)
      } else {
        console.log(`Qdrant collection already exists: ${this.collectionName}`)
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant collection:', error)
      throw new Error(
        `Failed to initialize Qdrant: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Search for documents similar to the query
   */
  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    try {
      // Get the embedding for the query
      const queryEmbedding = await this.embeddingService.getEmbedding(query)

      // Default limit if not specified
      const limit = options?.limit || 5

      // Search Qdrant for similar vectors
      const searchResults = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: options?.threshold || 0.7, // Only return results above this score
      })

      // Map Qdrant results to RetrievalResults
      return searchResults.map(result => ({
        id: String(result.id),
        content: result.payload?.content as string,
        metadata: (result.payload?.metadata as Record<string, unknown>) || {},
        score: result.score,
      }))
    } catch (error) {
      console.error('Error searching vectors:', error)
      return []
    }
  }

  /**
   * Add a document to the vector store
   */
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    try {
      // Generate a unique ID for the document
      const id = randomUUID()

      // Get the embedding for the document
      const embedding = await this.embeddingService.getEmbedding(content)

      // Add the document to Qdrant
      await this.client.upsert(this.collectionName, {
        points: [
          {
            id,
            vector: embedding,
            payload: {
              content,
              metadata: metadata || {},
              timestamp: new Date().toISOString(),
            },
          },
        ],
      })

      return id
    } catch (error) {
      console.error('Error adding document:', error)
      throw new Error(
        `Failed to add document: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}

// Export an in-memory implementation for testing or when Qdrant is not available
export class InMemoryVectorRepository implements VectorRepository {
  private documents: Map<string, { content: string; metadata?: Record<string, unknown> }> =
    new Map()
  private embeddingService: EmbeddingService

  constructor(embeddingService?: EmbeddingService) {
    // Use the mock embedding service to simulate vector similarity
    this.embeddingService = embeddingService || new MockEmbeddingService()
  }

  // Simple vector search implementation that uses the mock embedding service
  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    if (this.documents.size === 0) {
      return []
    }

    try {
      // Get the query embedding
      const queryEmbedding = await this.embeddingService.getEmbedding(query)
      const results: RetrievalResult[] = []

      // Calculate similarity for each document
      for (const [id, doc] of this.documents.entries()) {
        const docEmbedding = await this.embeddingService.getEmbedding(doc.content)
        const score = this.cosineSimilarity(queryEmbedding, docEmbedding)

        // Only include results above threshold (if specified)
        const threshold = options?.threshold || 0
        if (score > threshold) {
          results.push({
            id,
            content: doc.content,
            metadata: doc.metadata,
            score,
          })
        }
      }

      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score)

      // Limit results if specified
      if (options?.limit && options.limit > 0) {
        return results.slice(0, options.limit)
      }

      return results
    } catch (error) {
      console.error('Error in in-memory vector search:', error)
      return []
    }
  }

  // Add a document to the vector store
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    const id = randomUUID()
    this.documents.set(id, { content, metadata })
    return id
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions')
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] || 0) * (b[i] || 0) // Updated to ensure b[i] is also handled
      magnitudeA += (a[i] || 0) * (a[i] || 0) // Updated to ensure a[i] is handled
      magnitudeB += (b[i] || 0) * (b[i] || 0) // Updated to ensure b[i] is handled
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
  }
}
