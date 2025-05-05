import { QdrantVectorStore } from '@langchain/qdrant'
import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { Retriever } from '../retriever'
import { Embeddings } from '../embeddings'
import { nanoid } from 'nanoid'

/**
 * LangChain implementation of the Retriever interface using Qdrant vector database
 */
export class QdrantRetriever implements Retriever {
  private vectorStore: QdrantVectorStore
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

    this.embeddings = embeddings
    this.collectionName = collectionName

    // Create LangChain's QdrantVectorStore with a compatible embeddings interface
    const langchainEmbeddings = {
      embedQuery: async (text: string) => this.embeddings.getEmbedding(text),
      embedDocuments: async (texts: string[]) => {
        // Use batch embedding if available, otherwise fallback to sequential
        if (this.embeddings.embedBatch) {
          return this.embeddings.embedBatch(texts)
        }
        return Promise.all(texts.map(text => this.embeddings.getEmbedding(text)))
      },
    }

    this.vectorStore = new QdrantVectorStore(langchainEmbeddings, {
      url: qdrantUrl,
      collectionName,
    })
  }

  /**
   * Initialize the retriever by ensuring the collection exists
   */
  async initialize(vectorSize: number = 768): Promise<void> {
    try {
      // Use LangChain's method to ensure collection exists or create it
      await this.vectorStore.ensureCollection()
    } catch (error) {
      console.error('Error initializing QdrantVectorStore:', error)
      throw error
    }
  }

  /**
   * Retrieve documents based on a query
   */
  async retrieve(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    const limit = options?.limit ?? 5
    const scoreThreshold = options?.threshold ?? 0.7

    // Use LangChain's similaritySearchWithScore to retrieve documents
    try {
      const results = await this.vectorStore.similaritySearchWithScore(query, limit)

      // Transform to match our RetrievalResult interface
      return results.map(([doc, score]) => ({
        id: doc.metadata?.id?.toString() || nanoid(),
        content: doc.pageContent,
        metadata: doc.metadata as Record<string, unknown>,
        score,
      }))
    } catch (error) {
      console.error('Error retrieving documents:', error)
      throw error
    }
  }

  /**
   * Add a document to the retriever's knowledge base
   */
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    const id = nanoid()

    try {
      // Use LangChain's addDocuments method to add a document with metadata
      await this.vectorStore.addDocuments([
        {
          pageContent: content,
          metadata: {
            ...metadata,
            id,
          },
        },
      ])

      return id
    } catch (error) {
      console.error('Error adding document:', error)
      throw error
    }
  }
}
