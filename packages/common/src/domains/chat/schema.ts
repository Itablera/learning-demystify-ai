import { z } from 'zod'
import { ChatActor } from '@/types'

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  actor: z.nativeEnum(ChatActor),
  timestamp: z.date()
})
export type Message = z.infer<typeof MessageSchema>

export const ChatSchema = z.object({
  id: z.string(),
  name: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date()
})
export type Chat = z.infer<typeof ChatSchema>