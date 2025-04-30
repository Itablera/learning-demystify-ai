import { z } from 'zod'
import {
  MessageRoleEnum,
  MessageSchema,
  ConversationSchema,
  RetrievalResultSchema,
} from '@workspace/domains'

// Request schemas
export const CreateConversationRequestSchema = z.object({
  title: z.string().min(1),
})
export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>

export const AddMessageRequestSchema = z.object({
  content: z.string().min(1),
  role: MessageRoleEnum.default('user'),
})
export type AddMessageRequest = z.infer<typeof AddMessageRequestSchema>

export const ChatCompletionRequestSchema = z.object({
  message: z.string().min(1),
})
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>

export const AddDocumentRequestSchema = z.object({
  content: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type AddDocumentRequest = z.infer<typeof AddDocumentRequestSchema>

// Response schemas
export const ConversationResponseSchema = z.object({
  success: z.boolean(),
  data: ConversationSchema,
})
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>

export const ConversationsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ConversationSchema),
})
export type ConversationsListResponse = z.infer<typeof ConversationsListResponseSchema>

export const MessageResponseSchema = z.object({
  success: z.boolean(),
  data: MessageSchema,
})
export type MessageResponse = z.infer<typeof MessageResponseSchema>

export const MessagesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MessageSchema),
})
export type MessagesListResponse = z.infer<typeof MessagesListResponseSchema>

export const ChatCompletionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    messageId: z.string(),
    retrievalResults: z.array(RetrievalResultSchema).optional(),
  }),
})
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>

export const AddDocumentResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
  }),
})
export type AddDocumentResponse = z.infer<typeof AddDocumentResponseSchema>

// Stream message chunk for streaming responses
export const StreamChunkSchema = z.object({
  id: z.string(),
  content: z.string(),
  done: z.boolean(),
})
export type StreamChunk = z.infer<typeof StreamChunkSchema>

// Common params schemas
export const IdParamsSchema = z.object({
  id: z.string(),
})
export type IdParams = z.infer<typeof IdParamsSchema>
