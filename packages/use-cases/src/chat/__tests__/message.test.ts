// filepath: /Users/perlinde/repositories/learning-demystify-ai/packages/use-cases/src/chat/__tests__/message.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Conversation, MessageRole } from '@workspace/domains'
import { MockChatRepository } from './mock-chat-repository'
import { addMessage, getMessages } from '../message'

describe('Message Use Cases', () => {
  // Setup mock
  let chatRepository: MockChatRepository

  // Test data
  const conversationId = '123e4567-e89b-12d3-a456-426614174000'
  const conversationTitle = 'Test Conversation'
  const userContent = 'Hello, this is a test message.'
  const assistantContent = 'This is a response to your message.'

  // Set up fresh mock before each test
  beforeEach(() => {
    chatRepository = new MockChatRepository()

    // Setup pre-existing conversation
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

  describe('addMessage', () => {
    it('should add a user message to a conversation', async () => {
      const result = await addMessage(
        chatRepository,
        conversationId,
        'user' as MessageRole,
        userContent
      )

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.role).toBe('user')
      expect(result.content).toBe(userContent)
      expect(result.createdAt).toBeDefined()

      // Verify the message was actually added to the conversation
      const messages = await chatRepository.getMessages(conversationId)
      expect(messages.length).toBe(1)
      expect(messages[0]).toEqual(result)
    })

    it('should add an assistant message to a conversation', async () => {
      const result = await addMessage(
        chatRepository,
        conversationId,
        'assistant' as MessageRole,
        assistantContent
      )

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.role).toBe('assistant')
      expect(result.content).toBe(assistantContent)

      // Verify the message was actually added to the conversation
      const messages = await chatRepository.getMessages(conversationId)
      expect(messages.length).toBe(1)
      expect(messages[0]).toEqual(result)
    })

    it('should add a system message to a conversation', async () => {
      const systemContent = 'This is a system message with instructions.'

      const result = await addMessage(
        chatRepository,
        conversationId,
        'system' as MessageRole,
        systemContent
      )

      expect(result.role).toBe('system')
      expect(result.content).toBe(systemContent)
    })

    it('should throw error when conversation does not exist', async () => {
      await expect(
        addMessage(chatRepository, 'non-existent-id', 'user' as MessageRole, userContent)
      ).rejects.toThrow('Conversation with ID non-existent-id not found')
    })
  })

  describe('getMessages', () => {
    it('should return all messages for a conversation', async () => {
      // Add a user message and an assistant message
      await addMessage(chatRepository, conversationId, 'user' as MessageRole, userContent)
      await addMessage(chatRepository, conversationId, 'assistant' as MessageRole, assistantContent)

      const result = await getMessages(chatRepository, conversationId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0]?.role).toBe('user')
      expect(result[0]?.content).toBe(userContent)
      expect(result[1]?.role).toBe('assistant')
      expect(result[1]?.content).toBe(assistantContent)
    })

    it('should return empty array for a conversation with no messages', async () => {
      const result = await getMessages(chatRepository, conversationId)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should throw error when conversation does not exist', async () => {
      await expect(getMessages(chatRepository, 'non-existent-id')).rejects.toThrow(
        'Conversation with ID non-existent-id not found'
      )
    })
  })
})
