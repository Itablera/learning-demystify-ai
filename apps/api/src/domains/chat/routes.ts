import { Message, MessageRole } from '@workspace/domains'
import { chatUseCases } from '@workspace/use-cases'
import { RoutesProvider } from '@/index'
import { env } from '@/env'
import { ChatServiceFactory } from './service-factory'
import {
  CreateConversationRequestSchema,
  ConversationResponseSchema,
  ConversationsListResponseSchema,
  IdParamsSchema,
  MessagesListResponseSchema,
  AddMessageRequestSchema,
  MessageResponseSchema,
  ChatCompletionRequestSchema,
  AddDocumentRequestSchema,
  AddDocumentResponseSchema,
  BaseResponseSchema,
} from '@workspace/api'

export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  // Initialize services using the factory
  const { chatRepository, vectorService, aiService } = ChatServiceFactory.createServices()

  // Initialize the vector service
  await ChatServiceFactory.initializeVectorService(vectorService)

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
      const conversation = await chatUseCases.createConversation(chatRepository, title)

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
      const conversations = await chatUseCases.listConversations(chatRepository)

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
      const conversation = await chatUseCases.getConversation(chatRepository, id)

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
      await chatUseCases.deleteConversation(chatRepository, id)

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
      const conversation = await chatUseCases.getConversation(chatRepository, id)

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

      const message = await chatUseCases.addMessage(chatRepository, id, role, content)

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
          200: MessageResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { message } = request.body

      // Check if the client requested a streaming response
      const acceptHeader = request.headers.accept || ''
      const wantsStream = acceptHeader.includes('text/event-stream')

      const { messages, retrievalResults } = await chatUseCases.addMessageAndRetrieveContext(
        chatRepository,
        vectorService,
        id,
        message
      )

      // Add an empty assistant message as a placeholder
      const assistantMessage = await chatUseCases.addMessage(chatRepository, id, 'assistant', '')
      const resultMessageId = assistantMessage.id

      // If streaming is requested, set up SSE response
      if (wantsStream) {
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })

        // Start streaming the AI response
        const streamGenerator = aiService.streamCompletion(messages, retrievalResults)

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
      const aiResponse = await aiService.generateCompletion(messages, retrievalResults)

      // Update the assistant message with the full response
      await chatRepository.updateConversation(id, {
        messages: messages.map(m => (m.id === resultMessageId ? { ...m, content: aiResponse } : m)),
      })

      // Return the message ID and retrieval results
      return {
        data: {
          id: resultMessageId,
          content: aiResponse,
          role: 'assistant' as MessageRole,
          createdAt: new Date().toISOString(),
        },
        success: true,
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
      const id = await chatUseCases.addDocument(vectorService, content, metadata)

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
      const message: Message = {
        role: 'user',
        content,
        id: '1',
        createdAt: new Date().toISOString(),
      }
      const messages: Message[] = [message]
      const generation = await aiService.generateCompletion(messages)

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
      const messages: Message[] = [
        {
          role: 'user',
          content: 'Hi',
          id: '1',
          createdAt: new Date().toISOString(),
        },
      ]
      const generation = await aiService.generateCompletion(messages)

      return {
        success: true,
        message: generation,
        timestamp: new Date().toISOString(),
      }
    }
  )
}
