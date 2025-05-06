import { MockDocumentRepository } from './repository'
import {
  IngestDocumentRequestSchema,
  IngestDocumentResponseSchema,
  SearchDocumentsRequestSchema,
  SearchDocumentsResponseSchema,
} from '@workspace/api'
//import { documentUseCases } from '@workspace/use-cases'
import { RoutesProvider } from '@/index'
import { Embeddings, TextSplitter } from '@workspace/integrations'
import { ingestDocument, searchDocuments } from '@workspace/use-cases'

// Mock implementations of the integrations
// In a real app these would be proper implementations
class MockTextSplitter implements TextSplitter {
  async splitText(text: string, options: any) {
    const { chunkSize = 1000, chunkOverlap = 200 } = options
    // Simple implementation that splits by paragraph and then combines to reach chunk size
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)

    const chunks: string[] = []
    let currentChunk = ''

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length < chunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
      } else {
        // If current chunk has content, save it
        if (currentChunk) {
          chunks.push(currentChunk)
          // Start new chunk with overlap from previous chunk
          const words = currentChunk.split(' ')
          currentChunk = words.slice(-chunkOverlap / 10).join(' ') + '\n\n' + paragraph
        } else {
          // Edge case: paragraph larger than chunk size
          chunks.push(paragraph.slice(0, chunkSize))
          currentChunk = paragraph.slice(Math.max(0, chunkSize - chunkOverlap))
        }
      }
    }

    // Add the last chunk if there is one
    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return chunks
  }
}

class MockEmbeddings implements Embeddings {
  async getEmbedding(text: string) {
    // Generate mock embedding vector (normally this would call an embedding model)
    // For our mock, we'll just create a simple vector of random values
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1)
  }
}

export async function documentRoutes(routes: RoutesProvider) {
  const documentRepository = new MockDocumentRepository()
  const textSplitter = new MockTextSplitter()
  const embeddings = new MockEmbeddings()

  // POST /documents/search
  routes.post('/search', {
    schema: {
      body: SearchDocumentsRequestSchema,
      response: {
        200: SearchDocumentsResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { query, limit, threshold } = request.body

      const results = await searchDocuments(query, limit, threshold, { documentRepository })

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        data: results,
      }

      return reply.send(response)
    },
  })

  // POST /documents
  routes.post('/', {
    schema: {
      body: IngestDocumentRequestSchema,
      response: {
        200: IngestDocumentResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { content, metadata, chunkingOptions } = request.body

      const options = chunkingOptions || {
        chunkSize: 1000,
        chunkOverlap: 200,
      }

      const document = await ingestDocument(content, metadata || {}, options, {
        documentRepository,
        textSplitter,
        embeddings,
      })

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        data: document,
      }

      return reply.send(response)
    },
  })
}
