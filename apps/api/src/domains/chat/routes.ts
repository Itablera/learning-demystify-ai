import { ChatUseCases } from '@workspace/domains'
import { InMemoryChatRepository } from './chat-repository'
import { QdrantVectorRepository } from './vector-repository'
import { OllamaAIRepository } from './ai-repository'
import { OllamaEmbeddingService } from './embedding-service'
import { RoutesProvider } from '@/index'
import { env } from '@/env'
import {
  CreateConversationRequestSchema,
  ConversationResponseSchema,
  ConversationsListResponseSchema,
  IdParamsSchema,
  MessagesListResponseSchema,
  AddMessageRequestSchema,
  MessageResponseSchema,
  ChatCompletionRequestSchema,
  ChatCompletionResponseSchema,
  AddDocumentRequestSchema,
  AddDocumentResponseSchema,
  BaseResponseSchema,
} from '@workspace/api'

// Create embedding service
const embeddingService = new OllamaEmbeddingService(
  env.EMBEDDING_MODEL,
  env.OLLAMA_API_URL,
  env.EMBEDDING_DIMENSION
)

// Create repository and service instances to be used across all routes
const chatRepository = new InMemoryChatRepository()
const vectorRepository = new QdrantVectorRepository(env.QDRANT_URL, 'documents', embeddingService)
const aiRepository = new OllamaAIRepository(env.OLLAMA_MODEL, env.OLLAMA_API_URL)

// Create an instance of the ChatUseCases with all dependencies
const chatUseCases = new ChatUseCases(chatRepository, vectorRepository, aiRepository)

export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  // Initialize the Qdrant collection
  try {
    await vectorRepository.initialize()
    console.log('Qdrant vector repository initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Qdrant vector repository:', error)
    console.warn('Using in-memory vector repository as fallback would happen here in production')
    // In a production app, you might want to fall back to InMemoryVectorRepository here
  }

  // Create a new conversation
  routes.post(
    '/conversations',
    {
      schema: {
        body: CreateConversationRequestSchema,
        response: {
          200: ConversationResponseSchema,
        },
      },
    },
    async request => {
      const { title } = request.body
      const conversation = await chatUseCases.createConversation(title)

      return {
        success: true,
        data: conversation,
      }
    }
  )

  // List all conversations
  routes.get(
    '/conversations',
    {
      schema: {
        response: {
          200: ConversationsListResponseSchema,
        },
      },
    },
    async () => {
      const conversations = await chatUseCases.listConversations()

      return {
        success: true,
        data: conversations,
      }
    }
  )

  // Get a specific conversation by ID
  routes.get(
    '/conversations/:id',
    {
      schema: {
        params: IdParamsSchema,
        response: {
          200: ConversationResponseSchema,
        },
      },
    },
    async request => {
      const { id } = request.params
      const conversation = await chatUseCases.getConversation(id)

      if (!conversation) {
        throw new Error(`Conversation with ID ${id} not found`)
      }

      return {
        success: true,
        data: conversation,
      }
    }
  )

  // Delete a conversation
  routes.delete(
    '/conversations/:id',
    {
      schema: {
        params: IdParamsSchema,
        response: {
          200: BaseResponseSchema,
        },
      },
    },
    async request => {
      const { id } = request.params
      await chatUseCases.deleteConversation(id)

      return {
        success: true,
        message: `Conversation with ID ${id} deleted successfully`,
        timestamp: new Date().toISOString(),
      }
    }
  )

  // Get messages for a conversation
  routes.get(
    '/conversations/:id/messages',
    {
      schema: {
        params: IdParamsSchema,
        response: {
          200: MessagesListResponseSchema,
        },
      },
    },
    async request => {
      const { id } = request.params
      const conversation = await chatUseCases.getConversation(id)

      if (!conversation) {
        throw new Error(`Conversation with ID ${id} not found`)
      }

      return {
        success: true,
        data: conversation.messages,
      }
    }
  )

  // Add a message to a conversation
  routes.post(
    '/conversations/:id/messages',
    {
      schema: {
        params: IdParamsSchema,
        body: AddMessageRequestSchema,
        response: {
          200: MessageResponseSchema,
        },
      },
    },
    async request => {
      const { id } = request.params
      const { content, role } = request.body

      const message = await chatUseCases.addMessage(id, role, content)

      return {
        success: true,
        data: message,
      }
    }
  )

  // Generate a chat completion with RAG and streaming
  routes.post(
    '/conversations/:id/completions',
    {
      schema: {
        params: IdParamsSchema,
        body: ChatCompletionRequestSchema,
        response: {
          200: ChatCompletionResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { message } = request.body

      // Check if the client requested a streaming response
      const acceptHeader = request.headers.accept || ''
      const wantsStream = acceptHeader.includes('text/event-stream')

      const { retrievalResults, messages } = await chatUseCases.addMessageAndRetrieveContext(
        id,
        message
      )
      const { id: resultMessageId } = await chatUseCases.addMessage(id, 'assistant', '')

      // If streaming is requested, set up SSE response
      if (wantsStream) {
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })

        // Start streaming the AI response
        const streamGenerator = aiRepository.streamCompletion(messages, retrievalResults)

        let fullResponse = ''
        let lastUpdateTime = Date.now()
        const updateInterval = 500 // Update repository every 500ms instead of every chunk

        try {
          // Stream each chunk with improved batching
          for await (const chunk of streamGenerator) {
            fullResponse += chunk

            // Send the chunk to the client immediately
            const event = `data: ${JSON.stringify({
              id,
              content: chunk,
              done: false,
            })}\n\n`

            reply.raw.write(event)

            // Update the message in the repository periodically rather than per chunk
            const currentTime = Date.now()
            if (currentTime - lastUpdateTime >= updateInterval) {
              await chatRepository.updateConversation(id, {
                messages: messages.map(m =>
                  m.id === resultMessageId ? { ...m, content: fullResponse } : m
                ),
              })
              lastUpdateTime = currentTime
            }
          }

          // Final update to the repository
          await chatRepository.updateConversation(id, {
            messages: messages.map(m =>
              m.id === resultMessageId ? { ...m, content: fullResponse } : m
            ),
          })

          // Send the final chunk with done: true
          const finalEvent = `data: ${JSON.stringify({
            id: resultMessageId,
            content: '',
            done: true,
          })}\n\n`

          reply.raw.write(finalEvent)
          reply.raw.end()
        } catch (error) {
          console.error('Streaming error:', error)

          // Send error event to client
          const errorEvent = `data: ${JSON.stringify({
            id: resultMessageId,
            error: error instanceof Error ? error.message : 'Unknown streaming error',
            done: true,
          })}\n\n`

          reply.raw.write(errorEvent)
          reply.raw.end()

          // Save partial response in the repository
          if (fullResponse) {
            await chatRepository.updateConversation(id, {
              messages: messages.map(m =>
                m.id === resultMessageId
                  ? { ...m, content: `${fullResponse} [Streaming interrupted]` }
                  : m
              ),
            })
          }
        }

        return reply
      }

      // For non-streaming responses, generate the full response
      const aiResponse = await aiRepository.generateCompletion(messages, retrievalResults)

      // Update the assistant message with the full response
      await chatRepository.updateConversation(id, {
        messages: messages.map(m => (m.id === resultMessageId ? { ...m, content: aiResponse } : m)),
      })

      // Return the message ID and retrieval results
      return {
        success: true,
        data: {
          messageId: resultMessageId,
          retrievalResults,
        },
      }
    }
  )

  // Add a document to the vector store for RAG
  routes.post(
    '/documents',
    {
      schema: {
        body: AddDocumentRequestSchema,
        response: {
          200: AddDocumentResponseSchema,
        },
      },
    },
    async request => {
      const { content, metadata } = request.body
      const id = await chatUseCases.addDocument(content, metadata)

      return {
        success: true,
        data: { id },
      }
    }
  )

  // Simple chat message test route
  routes.post(
    '/simple-chat',
    {
      schema: {
        body: AddMessageRequestSchema,
        response: {
          200: BaseResponseSchema,
        },
      },
    },
    async request => {
      const { content } = request.body
      const generation = await aiRepository.simpleChat(content)

      return {
        success: true,
        message: generation,
        timestamp: new Date().toISOString(),
      }
    }
  )

  // Simple chat message test route
  routes.get(
    '/hi',
    {
      schema: {
        response: {
          200: BaseResponseSchema,
        },
      },
    },
    async () => {
      const generation = await aiRepository.sayHi()

      return {
        success: true,
        message: generation,
        timestamp: new Date().toISOString(),
      }
    }
  )
}
