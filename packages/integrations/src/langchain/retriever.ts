import { QdrantClient } from '@qdrant/js-client-rest'
import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { Retriever } from '../retriever'
import { Embeddings } from '../embeddings'
import { nanoid } from 'nanoid'

/**
 * LangChain implementation of the Retriever interface using Qdrant vector database
 */
export class QdrantRetriever implements Retriever {
  private client: QdrantClient
  private embeddings: Embeddings
  private collectionName: string

  constructor(
    embeddings: Embeddings,
    collectionName: string = 'documents',
    options: {
      qdrantUrl?: string
      qdrantApiKey?: string
    } = {}
  ) {
    const { qdrantUrl = 'http://localhost:6333', qdrantApiKey } = options

    this.client = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    })

    this.embeddings = embeddings
    this.collectionName = collectionName
  }

  /**
   * Initialize the retriever by ensuring the collection exists
   */
  async initialize(vectorSize: number = 768): Promise<void> {
    // Check if collection exists
    const collections = await this.client.getCollections()
    const exists = collections.collections.some(c => c.name === this.collectionName)

    if (!exists) {
      // Create collection if it doesn't exist
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine',
        },
      })
    }
  }

  /**
   * Retrieve documents based on a query
   */
  async retrieve(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    const limit = options?.limit ?? 5
    const scoreThreshold = options?.threshold ?? 0.7

    // Generate embedding for the query
    const embedding = await this.embeddings.getEmbedding(query)

    // Search for similar vectors
    const searchResult = await this.client.search(this.collectionName, {
      vector: embedding,
      limit,
      score_threshold: scoreThreshold,
    })

    // Map to RetrievalResult format
    return searchResult.map(hit => ({
      id: hit.id.toString(),
      content: hit.payload.content as string,
      metadata: hit.payload.metadata as Record<string, unknown> | undefined,
      score: hit.score,
    }))
  }

  /**
   * Add a document to the retriever's knowledge base
   */
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    const id = nanoid()
    const embedding = await this.embeddings.getEmbedding(content)

    // Add point to collection
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id,
          vector: embedding,
          payload: {
            content,
            metadata,
          },
        },
      ],
    })

    return id
  }
}
