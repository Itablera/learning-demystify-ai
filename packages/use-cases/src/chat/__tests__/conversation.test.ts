// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/chat/__tests__/conversation.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Conversation } from '@workspace/domains'
import { MockChatRepository } from './mock-chat-repository'
import {
  createConversation,
  getConversation,
  listConversations,
  deleteConversation,
} from '../conversation'

describe('Conversation Use Cases', () => {
  // Setup mock
  let chatRepository: MockChatRepository

  // Test data
  const conversationId = '123e4567-e89b-12d3-a456-426614174000'
  const conversationTitle = 'Test Conversation'

  // Set up fresh mock before each test
  beforeEach(() => {
    chatRepository = new MockChatRepository()

    // Setup pre-existing conversation for some tests
    const now = new Date().toISOString()
    const preExistingConversation: Conversation = {
      id: conversationId,
      title: conversationTitle,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    chatRepository.setConversation(preExistingConversation)
  })

  describe('createConversation', () => {
    it('should create a new conversation with provided title', async () => {
      const newTitle = 'New Conversation'
      const result = await createConversation(chatRepository, newTitle)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.title).toBe(newTitle)
      expect(result.messages).toEqual([])
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()

      // Check if conversation was actually stored in the repository
      const savedConversation = await chatRepository.getConversation(result.id)
      expect(savedConversation).toEqual(result)
    })
  })

  describe('getConversation', () => {
    it('should return a conversation when it exists', async () => {
      const result = await getConversation(chatRepository, conversationId)

      expect(result).toBeDefined()
      expect(result?.id).toBe(conversationId)
      expect(result?.title).toBe(conversationTitle)
    })

    it('should return null when conversation does not exist', async () => {
      const result = await getConversation(chatRepository, 'non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('listConversations', () => {
    it('should list all conversations when no limit provided', async () => {
      // Add another conversation
      await createConversation(chatRepository, 'Second Conversation')

      const result = await listConversations(chatRepository)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })

    it('should limit the number of conversations returned', async () => {
      // Add two more conversations
      await createConversation(chatRepository, 'Second Conversation')
      await createConversation(chatRepository, 'Third Conversation')

      const result = await listConversations(chatRepository, 2)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })

    it('should return empty array when no conversations exist', async () => {
      // Create a new empty repository
      chatRepository = new MockChatRepository()

      const result = await listConversations(chatRepository)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('deleteConversation', () => {
    it('should delete an existing conversation', async () => {
      // Verify conversation exists first
      expect(await chatRepository.getConversation(conversationId)).toBeDefined()

      // Delete it
      await deleteConversation(chatRepository, conversationId)

      // Verify it's gone
      expect(await chatRepository.getConversation(conversationId)).toBeNull()
    })

    it('should not throw when deleting a non-existent conversation', async () => {
      // Should not throw
      await expect(deleteConversation(chatRepository, 'non-existent-id')).resolves.not.toThrow()
    })
  })
})
