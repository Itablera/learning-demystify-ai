import { ChatSchema } from '@workspace/common/domains'
import { z } from 'zod'

/**
 * URL parameters schemas
 */
export const ParamsSchema = {
  id: z.object({
    id: z.string().min(1)
  })
}

export const PageSchema = z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10)
})
export type Page = z.infer<typeof PageSchema>

/**
 * Query string schemas
 */
export const QuerySchema = {
  pagination: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10')
  }).transform(data => ({
    page: parseInt(data.page),
    limit: parseInt(data.limit)
  }))
}

/**
 * Request body schemas
 */
export const BodySchema = {
  createChat: z.object({
    name: z.string().min(1),
    systemPrompt: z.string().optional()
  }),
  
  renameChat: z.object({
    name: z.string().min(1)
  }),
  
  sendMessage: z.object({
    message: z.string().min(1)
  })
}

/**
 * Type definitions derived from Zod schemas
 */
export type ChatIdParams = z.infer<typeof ParamsSchema.id>
export type PaginationQuery = z.infer<typeof QuerySchema.pagination>
export type CreateChatBody = z.infer<typeof BodySchema.createChat>
export type RenameChatBody = z.infer<typeof BodySchema.renameChat>
export type SendMessageBody = z.infer<typeof BodySchema.sendMessage>


export const ChatsResponseSchema = z.object({
  data: z.array(ChatSchema),
  total: z.number()
}).merge(PageSchema)
export type ChatsResponse = z.infer<typeof ChatsResponseSchema>