// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/chat/message.ts
import { ChatRepository, Message, MessageRole } from '@workspace/domains'

/**
 * Adds a message to a conversation
 */
export async function addMessage(
  chatRepository: ChatRepository,
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  return chatRepository.addMessage(conversationId, { role, content })
}

/**
 * Gets all messages for a conversation
 */
export async function getMessages(
  chatRepository: ChatRepository,
  conversationId: string
): Promise<Message[]> {
  return chatRepository.getMessages(conversationId)
}
