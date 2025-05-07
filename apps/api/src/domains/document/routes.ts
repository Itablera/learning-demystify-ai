import { ingestDocument, searchDocuments } from '@workspace/use-cases'
import {
  IngestDocumentRequestSchema,
  SearchDocumentsRequestSchema,
  DocumentListSchema,
  DocumentChunksSchema,
  SearchResultsSchema,
  BaseResponseSchema,
  DataResponseSchema,
  DataResponse,
  SearchResults,
} from '@workspace/api'
import { getDocumentRepository } from '@/repositories'
import { langchain } from '@workspace/integrations'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { RoutesProvider } from '@/index'
import { DocumentSchema } from '@workspace/domains'
import z from 'zod'
import config from '@workspace/env'

const docParam = z.object({
  id: z.string().uuid('Invalid document ID'),
})

/**
 * Document domain routes for the API
 */
export async function documentRoutes(routes: RoutesProvider): Promise<void> {
  // Initialize dependencies
  const embeddings = new langchain.LangChainEmbeddings()
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const documentRepository = getDocumentRepository(embeddings)
  const vectorStore = new langchain.QdrantVectorStore(
    config.vectorDb.qdrantUrl,
    'documents',
    embeddings
  )

  // Get a list of all documents
  routes.get('/', {
    schema: {
      tags: ['documents'],
      response: {
        200: DataResponseSchema(DocumentListSchema),
      },
    },
    handler: async () => {
      const documents = await documentRepository.listDocuments()
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: { documents },
      }
    },
  })

  // Get a single document by ID
  routes.get('/:id', {
    schema: {
      tags: ['documents'],
      params: docParam,
      response: {
        200: DataResponseSchema(DocumentSchema),
        404: BaseResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params
      const document = await documentRepository.getDocument(id)

      if (!document) {
        return reply.code(404).send({
          success: false,
          message: 'Document not found',
          timestamp: new Date().toISOString(),
        })
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: document,
      }
    },
  })

  // Get document chunks by document ID
  routes.get('/:id/chunks', {
    schema: {
      tags: ['documents'],
      params: docParam,
      response: {
        200: DataResponseSchema(DocumentChunksSchema),
        404: BaseResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params
      const document = await documentRepository.getDocument(id)

      if (!document) {
        return reply.code(404).send({
          success: false,
          message: 'Document not found',
          timestamp: new Date().toISOString(),
        })
      }

      const chunks = await documentRepository.getDocumentChunks(id)
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: { chunks },
      }
    },
  })

  // Ingest a new document
  routes.post('/', {
    schema: {
      tags: ['documents'],
      body: IngestDocumentRequestSchema,
      response: {
        200: DataResponseSchema(DocumentSchema),
        500: BaseResponseSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { content, metadata, chunkingOptions } = request.body as {
          content: string
          metadata?: Record<string, unknown>
          chunkingOptions?: { chunkSize: number; chunkOverlap: number }
        }

        const document = await ingestDocument(
          content,
          metadata || {},
          chunkingOptions || { chunkSize: 1000, chunkOverlap: 200 },
          { documentRepository, textSplitter, embeddings, vectorStore }
        )

        return {
          success: true,
          timestamp: new Date().toISOString(),
          data: document,
        }
      } catch (error) {
        routes.log.error(error)
        return reply.code(500).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to ingest document',
          timestamp: new Date().toISOString(),
        })
      }
    },
  })

  // Delete a document
  routes.delete('/:id', {
    schema: {
      tags: ['documents'],
      params: docParam,
      response: {
        200: BaseResponseSchema,
        404: BaseResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params
      const document = await documentRepository.getDocument(id)

      if (!document) {
        return reply.code(404).send({
          success: false,
          message: 'Document not found',
          timestamp: new Date().toISOString(),
        })
      }

      await documentRepository.deleteDocument(id)
      return {
        success: true,
        message: 'Document deleted successfully',
        timestamp: new Date().toISOString(),
      }
    },
  })

  // Search documents
  routes.post('/search', {
    schema: {
      tags: ['documents'],
      body: SearchDocumentsRequestSchema,
      response: {
        200: DataResponseSchema(SearchResultsSchema),
        500: BaseResponseSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const {
          query,
          limit = 10,
          threshold = 0.5,
        } = request.body as {
          query: string
          limit?: number
          threshold?: number
        }

        const results = await searchDocuments(query, { limit, threshold }, { vectorStore })
        const response: DataResponse<SearchResults> = {
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            results,
            count: results.length,
          },
        }

        return response
      } catch (error) {
        routes.log.error(error)
        return reply.code(500).send({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to search documents',
          timestamp: new Date().toISOString(),
        })
      }
    },
  })
}
