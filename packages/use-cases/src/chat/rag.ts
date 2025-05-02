// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/chat/rag.ts
import {
  AIService,
  ChatRepository,
  Message,
  RetrievalResult,
  VectorService,
} from '@workspace/domains/src/chat'
import { addMessage } from './message'
import { getConversation } from './conversation'

/**
 * Helper function to add message and retrieve context
 */
export async function addMessageAndRetrieveContext(
  chatRepository: ChatRepository,
  vectorService: VectorService,
  conversationId: string,
  message: string
): Promise<{ messages: Message[]; retrievalResults: RetrievalResult[] }> {
  // 1. Add the user message
  await addMessage(chatRepository, conversationId, 'user', message)

  // 2. Get the conversation messages
  const conversation = await getConversation(chatRepository, conversationId)
  if (!conversation) {
    throw new Error(`Conversation with ID ${conversationId} not found`)
  }

  // 3. Retrieve context from vector store
  const retrievalResults = await vectorService.vectorSearch(message)
  return { messages: conversation.messages, retrievalResults }
}

/**
 * Generate a chat response with RAG
 */
export async function generateChatResponse(
  chatRepository: ChatRepository,
  vectorService: VectorService,
  aiService: AIService,
  conversationId: string,
  message: string
): Promise<{
  assistantMessage: Message
}> {
  const { messages, retrievalResults } = await addMessageAndRetrieveContext(
    chatRepository,
    vectorService,
    conversationId,
    message
  )

  // Call AI and generate the response
  const assistantResponse = await aiService.generateCompletion(messages, retrievalResults)
  const assistantMessage = await addMessage(
    chatRepository,
    conversationId,
    'assistant',
    assistantResponse
  )

  // Return the assistant message
  return {
    assistantMessage,
  }
}

/**
 * Stream a chat response with RAG
 */
export async function* streamChatResponse(
  chatRepository: ChatRepository,
  vectorService: VectorService,
  aiService: AIService,
  conversationId: string,
  message: string
): AsyncGenerator<string> {
  const { messages, retrievalResults } = await addMessageAndRetrieveContext(
    chatRepository,
    vectorService,
    conversationId,
    message
  )

  // Call AI and stream the response
  const assistantResponseGenerator = aiService.streamCompletion(messages, retrievalResults)

  for await (const chunk of assistantResponseGenerator) {
    yield chunk
  }
}

/**
 * Add a document to the vector store
 */
export async function addDocument(
  vectorService: VectorService,
  content: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  return vectorService.addDocument(content, metadata)
}
