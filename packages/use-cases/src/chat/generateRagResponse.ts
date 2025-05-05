import { 
  Message, 
  Conversation, 
  ChatRepository, 
  RetrievalResult,
  VectorSearchOptions 
} from '@workspace/domains'
import { AI, Retriever } from '@workspace/integrations'

interface GenerateRagResponseDependencies {
  chatRepository: ChatRepository
  retriever: Retriever
  ai: AI
}

/**
 * Generate a RAG-enhanced response to a user message
 * This process:
 * 1. Retrieves relevant information based on the latest message
 * 2. Combines message history with retrieved context
 * 3. Generates an AI response and stores it in the conversation
 */
export const generateRagResponse = async (
  conversationId: string,
  userMessage: string,
  retrievalOptions?: VectorSearchOptions,
  { chatRepository, retriever, ai }: GenerateRagResponseDependencies
): Promise<Message> => {
  // Get conversation history
  const conversation = await chatRepository.getConversation(conversationId)
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`)
  }

  // Add user message to conversation
  const newUserMessage = await chatRepository.addMessage(conversationId, {
    role: 'user',
    content: userMessage
  })

  // Retrieve relevant information (RAG)
  const retrievalResults = await retriever.retrieve(userMessage, retrievalOptions)

  // Generate response with context
  const messages = await chatRepository.getMessages(conversationId)
  const completion = await ai.generateCompletion(messages, retrievalResults)

  // Store assistant response
  const assistantMessage = await chatRepository.addMessage(conversationId, {
    role: 'assistant',
    content: completion
  })

  return assistantMessage
}

/**
 * Stream a RAG-enhanced response to a user message
 * Similar to generateRagResponse but streams the response
 */
export const streamRagResponse = async function* (
  conversationId: string,
  userMessage: string,
  retrievalOptions?: VectorSearchOptions,
  { chatRepository, retriever, ai }: GenerateRagResponseDependencies
): AsyncGenerator<string> {
  // Get conversation history
  const conversation = await chatRepository.getConversation(conversationId)
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`)
  }

  // Add user message to conversation
  const newUserMessage = await chatRepository.addMessage(conversationId, {
    role: 'user',
    content: userMessage
  })

  // Retrieve relevant information (RAG)
  const retrievalResults = await retriever.retrieve(userMessage, retrievalOptions)

  // Get all messages for the conversation
  const messages = await chatRepository.getMessages(conversationId)
  
  // Stream response with context
  let fullResponse = ''
  for await (const chunk of ai.streamCompletion(messages, retrievalResults)) {
    fullResponse += chunk
    yield chunk
  }

  // Store complete assistant response once streaming is complete
  await chatRepository.addMessage(conversationId, {
    role: 'assistant',
    content: fullResponse
  })
}