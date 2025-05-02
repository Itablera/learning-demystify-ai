import { describe, it, expect, beforeEach } from 'vitest'
import { RetrievalResult } from '@workspace/domains'
import { MockChatRepository } from './mock-chat-repository'
import { MockVectorStore } from './mock-vector-store'
import { MockAI } from './mock-ai'
import {
  addMessageAndRetrieveContext,
  generateChatResponse,
  streamChatResponse,
  addDocument,
} from '../rag'

describe('RAG Use Cases', () => {
  // Setup mocks
  let chatRepository: MockChatRepository
  let vectorStore: MockVectorStore
  let ai: MockAI

  // Test data
  const conversationId = '123e4567-e89b-12d3-a456-426614174000'
  const conversationTitle = 'AI Concepts'
  const userMessage = 'Hello, can you help me with AI concepts?'
  const systemMessage = 'AI is a field of computer science.'
  const assistantResponse = 'Yes, I can help you understand AI concepts.'

  const retrievalResults: RetrievalResult[] = [
    {
      id: 'result-1',
      content: systemMessage,
      score: 0.95,
    },
  ]

  // Set up fresh mocks before each test
  beforeEach(() => {
    chatRepository = new MockChatRepository()
    vectorStore = new MockVectorStore()
    ai = new MockAI()

    // Setup conversation
    const now = new Date().toISOString()
    chatRepository.setConversation({
      id: conversationId,
      title: conversationTitle,
      messages: [],
      createdAt: now,
      updatedAt: now,
    })

    // Setup vector store mock results
    vectorStore.setMockResults(retrievalResults)

    // Setup AI mock response
    ai.setMockResponse(assistantResponse)
    ai.setMockStreamResponse(['Yes, ', 'I can ', 'help you ', 'understand AI concepts.'])
  })

  describe('addMessageAndRetrieveContext', () => {
    it('should add user message and retrieve context', async () => {
      const result = await addMessageAndRetrieveContext(
        chatRepository,
        vectorStore,
        conversationId,
        userMessage
      )

      // Check we have the user message added
      expect(result.messages.length).toBeGreaterThanOrEqual(1)
      expect(result.messages[0]?.role).toBe('user')
      expect(result.messages[0]?.content).toBe(userMessage)

      // Check system message was added with context
      expect(result.messages.length).toBeGreaterThanOrEqual(2)
      expect(result.messages[1]?.role).toBe('system')
      expect(result.messages[1]?.content).toBe(systemMessage)

      // Check retrieval results
      expect(result.retrievalResults).toEqual(retrievalResults)
    })

    it('should skip system message when no retrieval results', async () => {
      // Empty retrieval results
      vectorStore.setMockResults([])

      const result = await addMessageAndRetrieveContext(
        chatRepository,
        vectorStore,
        conversationId,
        userMessage
      )

      // Should only have user message
      expect(result.messages.length).toBe(1)
      expect(result.messages[0]?.role).toBe('user')
      expect(result.messages[0]?.content).toBe(userMessage)

      // Empty retrieval results
      expect(result.retrievalResults).toEqual([])
    })

    it('should throw error when conversation not found', async () => {
      await expect(
        addMessageAndRetrieveContext(chatRepository, vectorStore, 'non-existent-id', userMessage)
      ).rejects.toThrow('Conversation with ID non-existent-id not found')
    })
  })

  describe('generateChatResponse', () => {
    it('should generate a chat response with RAG', async () => {
      const result = await generateChatResponse(
        chatRepository,
        vectorStore,
        ai,
        conversationId,
        userMessage
      )

      // Get the messages to verify
      const messages = await chatRepository.getMessages(conversationId)

      // Should have user, system (context), and assistant messages
      expect(messages.length).toBeGreaterThanOrEqual(3)
      expect(messages[0]?.role).toBe('user')
      expect(messages[1]?.role).toBe('system')
      expect(messages[2]?.role).toBe('assistant')
      expect(messages[2]?.content).toBe(assistantResponse)

      // The returned message should be the assistant's message
      expect(result.assistantMessage).toEqual(messages[2])
    })
  })

  describe('streamChatResponse', () => {
    it('should stream a chat response with RAG', async () => {
      const generator = streamChatResponse(
        chatRepository,
        vectorStore,
        ai,
        conversationId,
        userMessage
      )

      const chunks: string[] = []
      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      // Verify the chunks
      expect(chunks).toEqual(['Yes, ', 'I can ', 'help you ', 'understand AI concepts.'])

      // Verify correct messages were added
      const messages = await chatRepository.getMessages(conversationId)
      expect(messages.length).toBeGreaterThanOrEqual(2) // user and system, but no assistant (streaming doesn't add it)
      expect(messages[0]?.role).toBe('user')
      expect(messages[1]?.role).toBe('system')
    })
  })

  describe('addDocument', () => {
    it('should add a document to the vector store with metadata', async () => {
      const content = 'AI is a field of computer science.'
      const metadata = { source: 'Wikipedia', topic: 'AI' }

      const documentId = await addDocument(vectorStore, content, metadata)

      // Verify document was added
      expect(documentId).toBeTruthy()
      const documents = vectorStore.getDocuments()
      expect(documents.size).toBe(1)

      const doc = documents.get(documentId)
      expect(doc).toBeDefined()
      expect(doc?.content).toBe(content)
      expect(doc?.metadata).toEqual(metadata)
    })

    it('should add a document without metadata', async () => {
      const content = 'Machine learning is a subset of AI.'

      const documentId = await addDocument(vectorStore, content)

      // Verify document was added without metadata
      const documents = vectorStore.getDocuments()
      const doc = documents.get(documentId)
      expect(doc?.content).toBe(content)
      expect(doc?.metadata).toBeUndefined()
    })
  })
})
