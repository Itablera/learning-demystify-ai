import { z } from 'zod'

/**
 * Helper to create branded ID types
 * @param name The name of the entity
 * @returns A Zod schema for the ID type
 */
const createIdSchema = <T extends string>(name: string) => {
  return z.string().uuid().brand<T>()
}

// Define all branded ID types
export const ChatIdSchema = createIdSchema<'UserId'>('UserId')
export type ChatId = z.infer<typeof ChatIdSchema>
