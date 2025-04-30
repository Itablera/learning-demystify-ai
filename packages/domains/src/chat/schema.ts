import { z } from 'zod'

// Message roles in a chat conversation
export const MessageRoleEnum = z.enum(['user', 'assistant', 'system'])
export type MessageRole = z.infer<typeof MessageRoleEnum>

// Base message schema
export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleEnum,
  content: z.string(),
  createdAt: z.string().datetime(),
})
export type Message = z.infer<typeof MessageSchema>

// Conversation schema to track chat history
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Conversation = z.infer<typeof ConversationSchema>

// Retrieval result for RAG
export const RetrievalResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  score: z.number().default(0),
})
export type RetrievalResult = z.infer<typeof RetrievalResultSchema>

// Options for vector search
export const VectorSearchOptionsSchema = z.object({
  limit: z.number().default(5),
  threshold: z.number().min(0).max(1).default(0.7),
})
export type VectorSearchOptions = z.infer<typeof VectorSearchOptionsSchema>
