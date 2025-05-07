import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { VectorStore } from '../'
import { v4 as uuidv4 } from 'uuid'
import config from '@workspace/env'
import { QdrantVectorStore as LangChainQdrantVectorStore } from '@langchain/qdrant'
import { Document } from '@langchain/core/documents'
import { Embeddings } from '@langchain/core/embeddings'
import { OllamaEmbeddings } from '@langchain/ollama'

export class QdrantVectorStore implements VectorStore {
  private connectionString: string
  private collectionName: string
  private embeddings: Embeddings
  private vectorStore: LangChainQdrantVectorStore | null = null

  constructor(
    connectionString: string = config.vectorDb.qdrantUrl,
    collectionName: string = config.vectorDb.collectionName,
    embeddings?: Embeddings
  ) {
    this.connectionString = connectionString
    this.collectionName = collectionName
    this.embeddings =
      embeddings ||
      new OllamaEmbeddings({
        model: config.embeddings.model,
      })
  }

  /**
   * Initialize the Qdrant collection if it doesn't exist
   * and setup the LangChain vector store
   */
  async initialize(): Promise<void> {
    try {
      this.vectorStore = await LangChainQdrantVectorStore.fromExistingCollection(this.embeddings, {
        url: this.connectionString,
        collectionName: this.collectionName,
      })
      if (!this.vectorStore) {
        throw new Error('Failed to initialize Qdrant vector store')
      }
    } catch (error) {
      console.error('Failed to initialize Qdrant collection:', error)
      throw new Error(
        `Failed to initialize Qdrant: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async getVectorStore(): Promise<LangChainQdrantVectorStore> {
    if (!this.vectorStore) {
      await this.initialize()
    }
    if (!this.vectorStore) {
      throw new Error('Vector store is not initialized')
    }
    return this.vectorStore
  }

  /**
   * Search for documents similar to the query
   */
  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    try {
      const vectorStore = await this.getVectorStore()

      // Set defaults for options
      const limit = options?.limit || 5
      const scoreThreshold = options?.threshold || 0.7

      const results = await vectorStore.similaritySearchWithScore(query, limit)

      return results
        .filter(([_, score]) => score >= scoreThreshold)
        .map(([doc, score]) => ({
          id: doc.metadata.id || 'unknown',
          content: doc.pageContent,
          metadata: doc.metadata,
          score,
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
      const vectorStore = await this.getVectorStore()

      // Generate a unique ID for the document if not provided
      const id = metadata?.id ? String(metadata.id) : uuidv4()
      const documentMetadata = { ...metadata, id }

      const document = new Document({
        pageContent: content,
        metadata: documentMetadata,
      })

      await vectorStore.addDocuments([document])

      return id
    } catch (error) {
      console.error('Error adding document:', error)
      throw new Error(
        `Failed to add document: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
