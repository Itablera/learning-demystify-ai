import { ChatRepository } from './repository'
import { Conversation, Message, MessageRole, RetrievalResult } from './schema'

export class ChatUseCases {
  private repository: ChatRepository

  constructor(chatRepository: ChatRepository) {
    this.repository = chatRepository
  }

  // Use case to create a new conversation
  async createConversation(title: string): Promise<Conversation> {
    return this.repository.createConversation(title)
  }

  // Use case to retrieve a conversation by ID
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.repository.getConversation(conversationId)
  }

  // Use case to list all conversations
  async listConversations(limit?: number): Promise<Conversation[]> {
    return this.repository.listConversations(limit)
  }

  // Use case to delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    return this.repository.deleteConversation(conversationId)
  }

  // Use case to add a message to a conversation
  async addMessage(conversationId: string, role: MessageRole, content: string): Promise<Message> {
    return this.repository.addMessage(conversationId, { role, content })
  }

  // Use case for performing RAG-based chat generation
  async generateChatResponse(
    conversationId: string,
    message: string
  ): Promise<{
    retrievalResults: RetrievalResult[]
    messageId: string
  }> {
    // 1. Add the user message
    await this.repository.addMessage(conversationId, {
      role: 'user',
      content: message,
    })

    // 2. Retrieve context from vector store
    const retrievalResults = await this.repository.vectorSearch(message)

    // 3. Create assistant message placeholder (actual streaming happens at the API level)
    const assistantMessage = await this.repository.addMessage(conversationId, {
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
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.repository.addDocument(content, metadata)
  }
}
