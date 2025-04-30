import { ChatRepository } from './repository'
import { Conversation, Message, MessageRole, RetrievalResult } from './schema'

// Use case to create a new conversation
export async function createConversation(
  chatRepository: ChatRepository,
  title: string
): Promise<Conversation> {
  return chatRepository.createConversation(title)
}

// Use case to retrieve a conversation by ID
export async function getConversation(
  chatRepository: ChatRepository,
  conversationId: string
): Promise<Conversation | null> {
  return chatRepository.getConversation(conversationId)
}

// Use case to list all conversations
export async function listConversations(
  chatRepository: ChatRepository,
  limit?: number
): Promise<Conversation[]> {
  return chatRepository.listConversations(limit)
}

// Use case to delete a conversation
export async function deleteConversation(
  chatRepository: ChatRepository,
  conversationId: string
): Promise<void> {
  return chatRepository.deleteConversation(conversationId)
}

// Use case to add a message to a conversation
export async function addMessage(
  chatRepository: ChatRepository,
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  return chatRepository.addMessage(conversationId, { role, content })
}

// Use case for performing RAG-based chat generation
export async function generateChatResponse(
  chatRepository: ChatRepository,
  conversationId: string,
  message: string,
  systemPrompt?: string
): Promise<{
  retrievalResults: RetrievalResult[]
  messageId: string
}> {
  // 1. Add the user message
  await chatRepository.addMessage(conversationId, {
    role: 'user',
    content: message,
  })

  // 2. Retrieve context from vector store
  const retrievalResults = await chatRepository.vectorSearch(message)

  // 3. Create assistant message placeholder (actual streaming happens at the API level)
  const assistantMessage = await chatRepository.addMessage(conversationId, {
    role: 'assistant',
    content: '', // Will be filled in by the streaming process
  })

  // Return the retrieval results and message ID for streaming
  return {
    retrievalResults,
    messageId: assistantMessage.id,
  }
}

// Use case for adding documents to the vector store
export async function addDocument(
  chatRepository: ChatRepository,
  content: string,
  metadata?: Record<string, any>
): Promise<string> {
  return chatRepository.addDocument(content, metadata)
}
