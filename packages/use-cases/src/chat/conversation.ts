// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/chat/conversation.ts
import { ChatRepository, Conversation } from '@workspace/domains'

/**
 * Creates a new conversation
 */
export async function createConversation(
  chatRepository: ChatRepository,
  title: string
): Promise<Conversation> {
  return chatRepository.createConversation(title)
}

/**
 * Retrieves a conversation by ID
 */
export async function getConversation(
  chatRepository: ChatRepository,
  conversationId: string
): Promise<Conversation | null> {
  return chatRepository.getConversation(conversationId)
}

/**
 * Lists all conversations
 */
export async function listConversations(
  chatRepository: ChatRepository,
  limit?: number
): Promise<Conversation[]> {
  return chatRepository.listConversations(limit)
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(
  chatRepository: ChatRepository,
  conversationId: string
): Promise<void> {
  return chatRepository.deleteConversation(conversationId)
}
