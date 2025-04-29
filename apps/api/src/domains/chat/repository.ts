import { v4 as uuidv4 } from 'uuid'
import { 
  ChatRepository, 
  Conversation, 
  Message, 
  MessageRole, 
  RetrievalResult, 
  VectorSearchOptions 
} from '@workspace/common/domains'

/**
 * In-memory implementation of the ChatRepository for development and testing.
 * In a production environment, this would be replaced with a database-backed implementation.
 */
export class InMemoryChatRepository implements ChatRepository {
  private conversations: Map<string, Conversation> = new Map()
  private documents: Map<string, { content: string, metadata?: Record<string, any> }> = new Map()

  // Conversation management
  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null
  }

  async listConversations(limit?: number): Promise<Conversation[]> {
    const conversations = Array.from(this.conversations.values())
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return limit ? conversations.slice(0, limit) : conversations
  }

  async createConversation(title: string): Promise<Conversation> {
    const now = new Date().toISOString()
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: now,
      updatedAt: now
    }

    this.conversations.set(conversation.id, conversation)
    return conversation
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = await this.getConversation(id)
    if (!conversation) {
      throw new Error(`Conversation with ID ${id} not found`)
    }

    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.conversations.set(id, updatedConversation)
    return updatedConversation
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id)
  }

  // Message management
  async addMessage(
    conversationId: string, 
    message: Omit<Message, 'id' | 'createdAt'>
  ): Promise<Message> {
    const conversation = await this.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`)
    }

    const newMessage: Message = {
      id: uuidv4(),
      role: message.role,
      content: message.content,
      createdAt: new Date().toISOString()
    }

    conversation.messages.push(newMessage)
    conversation.updatedAt = newMessage.createdAt
    this.conversations.set(conversationId, conversation)

    return newMessage
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`)
    }

    return conversation.messages
  }

  // Vector search for RAG - simplified implementation for demo purposes
  // In a real-world scenario, this would use a vector database like Qdrant, Pinecone, etc.
  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    // Default options
    const limit = options?.limit || 5
    const threshold = options?.threshold || 0.7
    
    // This is a simplified mock implementation
    // In reality, you would:
    // 1. Convert the query to an embedding using an embedding model
    // 2. Perform vector similarity search using a vector database
    // 3. Return the most similar documents based on the cosine similarity
    
    // For now, we'll do a simple keyword-based search
    const results: RetrievalResult[] = []
    
    for (const [id, doc] of this.documents.entries()) {
      // Very naive relevance scoring - just check if query terms appear in the document
      // In a real implementation, you would use vector similarity
      const queryTerms = query.toLowerCase().split(/\s+/)
      const docContent = doc.content.toLowerCase()
      
      // Count how many query terms appear in the document
      let matchCount = 0
      for (const term of queryTerms) {
        if (docContent.includes(term)) {
          matchCount++
        }
      }
      
      // Calculate a naive similarity score
      const score = queryTerms.length > 0 ? matchCount / queryTerms.length : 0
      
      // Only include documents that meet the threshold
      if (score >= threshold) {
        results.push({
          id,
          content: doc.content,
          metadata: doc.metadata,
          score
        })
      }
    }
    
    // Sort by score (descending) and limit results
    results.sort((a, b) => (b.score || 0) - (a.score || 0))
    return results.slice(0, limit)
  }

  // Embedding management
  async addDocument(content: string, metadata?: Record<string, any>): Promise<string> {
    const id = uuidv4()
    this.documents.set(id, { content, metadata })
    return id
  }
}