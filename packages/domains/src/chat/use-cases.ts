import { ChatRepository } from './repository'
import { AIService, VectorService } from './services'
import { Conversation, Message, MessageRole, RetrievalResult } from './schema'

export class ChatUseCases {
  constructor(
    private chatRepository: ChatRepository,
    private vectorService: VectorService,
    private aiService: AIService
  ) {}

  // Use case to create a new conversation
  async createConversation(title: string): Promise<Conversation> {
    return this.chatRepository.createConversation(title)
  }

  // Use case to retrieve a conversation by ID
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.chatRepository.getConversation(conversationId)
  }

  // Use case to list all conversations
  async listConversations(limit?: number): Promise<Conversation[]> {
    return this.chatRepository.listConversations(limit)
  }

  // Use case to delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    return this.chatRepository.deleteConversation(conversationId)
  }

  // Use case to add a message to a conversation
  async addMessage(conversationId: string, role: MessageRole, content: string): Promise<Message> {
    return this.chatRepository.addMessage(conversationId, { role, content })
  }

  // Use case for performing RAG-based chat generation
  async generateChatResponse(
    conversationId: string,
    message: string
  ): Promise<{
    assistantMessage: Message
  }> {
    const { messages, retrievalResults } = await this.addMessageAndRetrieveContext(
      conversationId,
      message
    )

    // Call AI and generate the response
    const assistantResponse = await this.aiService.generateCompletion(messages, retrievalResults)
    const assistantMessage = await this.chatRepository.addMessage(conversationId, {
      role: 'assistant',
      content: assistantResponse,
    })

    // Return the assistant message
    return {
      assistantMessage,
    }
  }

  // Use case for performing RAG-based chat streaming
  async *streamChatResponse(conversationId: string, message: string): AsyncGenerator<string> {
    const { messages, retrievalResults } = await this.addMessageAndRetrieveContext(
      conversationId,
      message
    )

    // Call AI and stream the response
    const assistantResponseGenerator = this.aiService.streamCompletion(messages, retrievalResults)

    for await (const chunk of assistantResponseGenerator) {
      yield chunk
    }
  }

  // Helper method to add user message and retrieve context
  async addMessageAndRetrieveContext(conversationId: string, message: string) {
    // 1. Add the user message
    await this.chatRepository.addMessage(conversationId, {
      role: 'user',
      content: message,
    })

    // 2. Get the conversation messages
    const conversation = await this.chatRepository.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`)
    }
    const messages = conversation.messages

    // 3. Retrieve context from vector store
    const retrievalResults = await this.vectorService.vectorSearch(message)
    return { messages, retrievalResults }
  }

  // Use case for adding documents to the vector store
  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.vectorService.addDocument(content, metadata)
  }
}
