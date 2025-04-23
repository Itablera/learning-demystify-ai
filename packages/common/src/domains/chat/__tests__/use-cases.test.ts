import { describe, it, expect, beforeEach } from 'vitest'
import { ChatUseCases } from '../use-cases'
import { MockChatRepository } from './mock-repository'
import { ChatActor } from '@workspace/common/types'

describe('ChatUseCases', () => {
  let repository: MockChatRepository
  let useCases: ChatUseCases

  beforeEach(() => {
    repository = new MockChatRepository()
    useCases = new ChatUseCases(repository)
  })

  describe('createChat', () => {
    it('should create a new chat with the given name', async () => {
      const name = 'Test Chat'
      const chat = await useCases.createChat(name)

      expect(chat.id).toBeDefined()
      expect(chat.name).toBe(name)
      expect(chat.messages).toHaveLength(0)
      expect(chat.createdAt).toBeInstanceOf(Date)
      expect(chat.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('getChat', () => {
    it('should return null for non-existent chat', async () => {
      const result = await useCases.getChat('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return the chat when it exists', async () => {
      const chat = await useCases.createChat('Test Chat')
      const result = await useCases.getChat(chat.id)
      
      expect(result).not.toBeNull()
      expect(result?.id).toBe(chat.id)
      expect(result?.name).toBe(chat.name)
    })
  })

  describe('message operations', () => {
    it('should add a user message to a chat', async () => {
      const chat = await useCases.createChat('Test Chat')
      const content = 'Hello, AI assistant!'
      
      const updatedChat = await useCases.addUserMessage(chat.id, content)
      
      expect(updatedChat.messages).toHaveLength(1)
      expect(updatedChat.messages[0]?.content).toBe(content)
      expect(updatedChat.messages[0]?.actor).toBe(ChatActor.USER)
    })

    it('should add an assistant message to a chat', async () => {
      const chat = await useCases.createChat('Test Chat')
      const content = 'I am an AI assistant. How can I help you today?'
      
      const updatedChat = await useCases.addAssistantMessage(chat.id, content)
      
      expect(updatedChat.messages).toHaveLength(1)
      expect(updatedChat.messages[0]?.content).toBe(content)
      expect(updatedChat.messages[0]?.actor).toBe(ChatActor.ASSISTANT)
    })

    it('should add a system message to a chat', async () => {
      const chat = await useCases.createChat('Test Chat')
      const content = 'You are a helpful AI assistant.'
      
      const updatedChat = await useCases.addSystemMessage(chat.id, content)
      
      expect(updatedChat.messages).toHaveLength(1)
      expect(updatedChat.messages[0]?.content).toBe(content)
      expect(updatedChat.messages[0]?.actor).toBe(ChatActor.SYSTEM)
    })
  })

  describe('createChatWithSystemPrompt', () => {
    it('should create a chat with an initial system message', async () => {
      const name = 'AI Assistant Chat'
      const systemPrompt = 'You are a helpful AI assistant that specializes in JavaScript.'
      
      const chat = await useCases.createChatWithSystemPrompt(name, systemPrompt)
      
      expect(chat.name).toBe(name)
      expect(chat.messages).toHaveLength(1)
      expect(chat.messages[0]?.actor).toBe(ChatActor.SYSTEM)
      expect(chat.messages[0]?.content).toBe(systemPrompt)
    })
  })

  describe('getChatHistory', () => {
    it('should return all messages in a chat', async () => {
      const chat = await useCases.createChat('Conversation')
      
      await useCases.addSystemMessage(chat.id, 'You are an AI assistant.')
      await useCases.addUserMessage(chat.id, 'Hello!')
      await useCases.addAssistantMessage(chat.id, 'Hi there! How can I help you?')
      
      const messages = await useCases.getChatHistory(chat.id)
      
      expect(messages).toHaveLength(3)
      expect(messages[0]?.actor).toBe(ChatActor.SYSTEM)
      expect(messages[1]?.actor).toBe(ChatActor.USER)
      expect(messages[2]?.actor).toBe(ChatActor.ASSISTANT)
    })
  })

  describe('renameChat', () => {
    it('should rename an existing chat', async () => {
      const chat = await useCases.createChat('Original Name')
      const newName = 'Updated Name'
      
      const updatedChat = await useCases.renameChat(chat.id, newName)
      
      expect(updatedChat.name).toBe(newName)
      expect(updatedChat.id).toBe(chat.id)
    })
  })

  describe('deleteChat', () => {
    it('should delete an existing chat', async () => {
      const chat = await useCases.createChat('Chat to Delete')
      
      const result = await useCases.deleteChat(chat.id)
      expect(result).toBe(true)
      
      const deletedChat = await useCases.getChat(chat.id)
      expect(deletedChat).toBeNull()
    })
  })
})