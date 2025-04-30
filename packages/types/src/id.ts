import { z } from 'zod'

/**
 * Helper to create branded ID types
 * @returns A Zod schema for the ID type
 */
const createIdSchema = <T extends string>() => {
  return z.string().uuid().brand<T>()
}

// Define all branded ID types
export const ChatIdSchema = createIdSchema<'UserId'>()
export type ChatId = z.infer<typeof ChatIdSchema>
