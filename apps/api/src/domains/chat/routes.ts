import { RoutesProvider } from '@/index'
import config from '@workspace/env'
import { langchain } from '@workspace/integrations'
import { RAGChatDependencies, RAGChat, RAGChatStream } from '@workspace/use-cases'
import { DataResponseSchema, ErrorResponseSchema } from '@workspace/api'
import { RetrievalResultSchema } from '@workspace/domains'
import { z } from 'zod'

// Define schemas for request and response validation
const ChatRequestSchema = z.object({
  query: z.string().min(1),
})

// Schema for standard non-streaming response
const ChatResponseSchema = DataResponseSchema(
  z.object({
    response: z.string(),
    retrievedDocs: z.array(RetrievalResultSchema).optional(),
  })
)

// Schema for streaming chunk response used in SSE data events
const StreamChunkSchema = z.object({
  chunk: z.string(),
})

/**
 * Chat domain routes for the API
 */
export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  const chatDependencies: RAGChatDependencies = {
    aiService: new langchain.OllamaChatBot(config.ollama.model, config.ollama.apiUrl),
    vectorStore: new langchain.QdrantVectorStore(
      config.vectorDb.qdrantUrl,
      config.vectorDb.collectionName
    ),
  }

  // Route for RAG Chat - returns complete response
  routes.post('/rag', {
    schema: {
      body: ChatRequestSchema,
      response: {
        200: ChatResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { query } = request.body

        const response = await RAGChat(chatDependencies, query)

        return reply.send({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            response,
            retrievedDocs: [], // If you want to include the retrieved docs, modify RAGChat to return them
          },
        })
      } catch (error: unknown) {
        request.log.error('Error in RAGChat route:', error)
        const errorResponse = {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Failed to process chat request',
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            details: { message: error instanceof Error ? error.message : 'Unknown error' },
          },
        }
        return reply.status(500).send(errorResponse)
      }
    },
  })

  // Route for RAG Chat Stream - returns streaming response
  routes.post('/rag/stream', {
    schema: {
      body: ChatRequestSchema,
    },
    handler: async (request, reply) => {
      try {
        const { query } = request.body

        // Set headers for Server-Sent Events (SSE)
        reply.raw.setHeader('Content-Type', 'text/event-stream')
        reply.raw.setHeader('Cache-Control', 'no-cache')
        reply.raw.setHeader('Connection', 'keep-alive')

        const responseStream = await RAGChatStream(chatDependencies, query)

        // Keep the connection open
        reply.raw.flushHeaders()

        // Process the stream
        for await (const chunk of responseStream) {
          // Send each chunk as an SSE event
          const chunkData: z.infer<typeof StreamChunkSchema> = { chunk }
          const data = `data: ${JSON.stringify(chunkData)}\n\n`
          reply.raw.write(data)
        }

        // End the stream with a done message
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()
      } catch (error: unknown) {
        request.log.error('Error in RAGChatStream route:', error)

        // Handle errors based on whether headers have been sent
        if (!reply.sent) {
          const errorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            message: 'Failed to process streaming chat request',
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              details: { message: error instanceof Error ? error.message : 'Unknown error' },
            },
          }
          return reply.status(500).send(errorResponse)
        } else {
          // Send error as SSE event if streaming has already started
          const errorData = `data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`
          reply.raw.write(errorData)
          reply.raw.end()
        }
      }
    },
  })
}
