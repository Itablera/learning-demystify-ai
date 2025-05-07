import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { Embeddings, VectorStore } from '../'
import { QdrantClient } from '@qdrant/js-client-rest'
import { v4 as uuidv4 } from 'uuid'
import config from '@workspace/env'
import { LangChainEmbeddings } from './embeddings'
import { QdrantVectorStore as QdrantVectorStoreType } from '@langchain/qdrant'
import { Document } from '@langchain/core/documents'

export class QdrantVectorStore implements VectorStore {
  private client: QdrantClient
  private collectionName: string
  private embeddings: Embeddings
  private vectorStore: QdrantVectorStoreType | null = null

  constructor(
    connectionString: string = config.vectorDb.qdrantUrl,
    collectionName: string = 'documents',
    embeddingService?: Embeddings
  ) {
    this.client = new QdrantClient({ url: connectionString })
    this.collectionName = collectionName
    this.embeddings = embeddingService || new LangChainEmbeddings()
  }

  /**
   * Initialize the Qdrant collection if it doesn't exist
   * and setup the LangChain vector store
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
            size: config.embeddings.dimension,
            distance: 'Cosine',
          },
        })
        console.log(`Created Qdrant collection: ${this.collectionName}`)
      } else {
        console.log(`Qdrant collection already exists: ${this.collectionName}`)
      }

      // Setup LangChain vectorstore if embedding service is LangChain-based
      if (this.embeddings instanceof LangChainEmbeddings) {
        this.vectorStore = await QdrantVectorStoreType.fromExistingCollection(
          // @ts-expect-error - The LangChain type expects a specific property not easily accessible
          this.embeddings.embeddings,
          {
            url: config.vectorDb.qdrantUrl,
            collectionName: this.collectionName,
          }
        )
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
      // Set defaults for options
      const limit = options?.limit || 5
      const scoreThreshold = options?.threshold || 0.7

      // If we have a LangChain vectorstore instance, use it for more efficient search
      if (this.vectorStore && this.embeddings instanceof LangChainEmbeddings) {
        const results = await this.vectorStore.similaritySearchWithScore(query, limit)

        return results
          .filter(([_, score]) => score >= scoreThreshold)
          .map(([doc, score]) => ({
            id: doc.metadata.id || 'unknown',
            content: doc.pageContent,
            metadata: doc.metadata,
            score,
          }))
      }

      // Fallback to direct Qdrant client if LangChain vectorstore isn't available
      const queryEmbedding = await this.embeddings.getEmbedding(query)

      const searchResults = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
        score_threshold: scoreThreshold,
      })

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
      // Generate a unique ID for the document if not provided
      const id = metadata?.id ? String(metadata.id) : uuidv4()
      const documentMetadata = { ...metadata, id }

      // If we have a LangChain vectorstore, use it
      if (this.vectorStore && this.embeddings instanceof LangChainEmbeddings) {
        const document = new Document({
          pageContent: content,
          metadata: documentMetadata,
        })

        await this.vectorStore.addDocuments([document])
      } else {
        // Fallback to direct Qdrant client
        const embedding = await this.embeddings.getEmbedding(content)

        await this.client.upsert(this.collectionName, {
          points: [
            {
              id,
              vector: embedding,
              payload: {
                content,
                metadata: documentMetadata,
                timestamp: new Date().toISOString(),
              },
            },
          ],
        })
      }

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
export class InMemoryVectorService implements VectorStore {
  private documents: Map<string, { content: string; metadata?: Record<string, unknown> }> =
    new Map()
  private embeddings: Embeddings

  constructor(embeddings: Embeddings) {
    this.embeddings = embeddings
  }

  // Simple vector search implementation that uses the mock embedding service
  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    if (this.documents.size === 0) {
      return []
    }

    try {
      // Get the query embedding
      const queryEmbedding = await this.embeddings.getEmbedding(query)
      const results: RetrievalResult[] = []

      // Calculate similarity for each document
      for (const [id, doc] of this.documents.entries()) {
        const docEmbedding = await this.embeddings.getEmbedding(doc.content)
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
    const id = uuidv4()
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
      dotProduct += (a[i] || 0) * (b[i] || 0)
      magnitudeA += (a[i] || 0) * (a[i] || 0)
      magnitudeB += (b[i] || 0) * (b[i] || 0)
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
  }
}
