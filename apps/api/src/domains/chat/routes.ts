import { 
  addDocument, 
  addMessage, 
  createConversation, 
  deleteConversation, 
  generateChatResponse, 
  getConversation, 
  listConversations 
} from '@workspace/common/domains'
import { InMemoryChatRepository } from './repository'
import { MockAIServiceAdapter } from './service'
import { RoutesProvider } from '@/index'
import { CreateConversationRequestSchema, ConversationResponseSchema, ConversationsListResponseSchema, IdParamsSchema, MessagesListResponseSchema, AddMessageRequestSchema, MessageResponseSchema, ChatCompletionRequestSchema, ChatCompletionResponseSchema, AddDocumentRequestSchema, AddDocumentResponseSchema } from '@workspace/api/domains'
import { BaseResponseSchema } from '@workspace/api/domains/http/schema'

// Create a single repository instance to be used across all routes
const chatRepository = new InMemoryChatRepository()
const aiService = new MockAIServiceAdapter()

export async function chatRoutes(routes: RoutesProvider): Promise<void> {
  
  // Create a new conversation
  routes.post(
    '/conversations',
    {
      schema: {
        body: CreateConversationRequestSchema,
        response: {
          200: ConversationResponseSchema
        }
      }
    },
    async (request) => {
      const { title } = request.body
      const conversation = await createConversation(chatRepository, title)
      
      return {
        success: true,
        data: conversation
      }
    }
  )
  
  // List all conversations
  routes.get(
    '/conversations',
    {
      schema: {
        response: {
          200: ConversationsListResponseSchema
        }
      }
    },
    async () => {
      const conversations = await listConversations(chatRepository)
      
      return {
        success: true,
        data: conversations
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
          200: ConversationResponseSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      const conversation = await getConversation(chatRepository, id)
      
      if (!conversation) {
        throw new Error(`Conversation with ID ${id} not found`)
      }
      
      return {
        success: true,
        data: conversation
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
          200: BaseResponseSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      await deleteConversation(chatRepository, id)
      
        return {
            success: true,
            message: `Conversation with ID ${id} deleted successfully`,
            timestamp: new Date().toISOString()
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
          200: MessagesListResponseSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      const conversation = await getConversation(chatRepository, id)
      
      if (!conversation) {
        throw new Error(`Conversation with ID ${id} not found`)
      }
      
      return {
        success: true,
        data: conversation.messages
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
          200: MessageResponseSchema
        }
      }
    },
    async (request) => {
      const { id } = request.params
      const { content, role } = request.body
      
      const message = await addMessage(chatRepository, id, role, content)
      
      return {
        success: true,
        data: message
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
          200: ChatCompletionResponseSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params
      const { message, systemPrompt } = request.body
      
      // Check if the client requested a streaming response
      const acceptHeader = request.headers.accept || ''
      const wantsStream = acceptHeader.includes('text/event-stream')
      
      // Generate the chat response with RAG
      const { retrievalResults, messageId } = await generateChatResponse(
        chatRepository,
        id,
        message,
        systemPrompt
      )
      
      // Get the conversation to access all messages for context
      const conversation = await chatRepository.getConversation(id)
      if (!conversation) {
        throw new Error(`Conversation with ID ${id} not found`)
      }
      
      // If streaming is requested, set up SSE response
      if (wantsStream) {
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        })
        
        // Start streaming the AI response
        const streamGenerator = aiService.streamCompletion(conversation.messages, retrievalResults)
        let fullResponse = ''
        
        // Stream each chunk
        for await (const chunk of streamGenerator) {
          fullResponse += chunk
          
          // Send the chunk to the client
          const event = `data: ${JSON.stringify({
            id: messageId,
            content: chunk,
            done: false
          })}\n\n`
          
          reply.raw.write(event)
          
          // Update the message content in the repository
          await chatRepository.updateConversation(id, {
            messages: conversation.messages.map(m => 
              m.id === messageId ? { ...m, content: fullResponse } : m
            )
          })
        }
        
        // Send the final chunk with done: true
        const finalEvent = `data: ${JSON.stringify({
          id: messageId,
          content: '',
          done: true
        })}\n\n`
        
        reply.raw.write(finalEvent)
        reply.raw.end()
        
        return reply
      }
      
      // For non-streaming responses, generate the full response
      const aiResponse = await aiService.generateCompletion(conversation.messages, retrievalResults)
      
      // Update the assistant message with the full response
      await chatRepository.updateConversation(id, {
        messages: conversation.messages.map(m => 
          m.id === messageId ? { ...m, content: aiResponse } : m
        )
      })
      
      // Return the message ID and retrieval results
      return {
        success: true,
        data: {
          messageId,
          retrievalResults
        }
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
          200: AddDocumentResponseSchema
        }
      }
    },
    async (request) => {
      const { content, metadata } = request.body
      const id = await addDocument(chatRepository, content, metadata)
      
      return {
        success: true,
        data: { id }
      }
    }
  )
}