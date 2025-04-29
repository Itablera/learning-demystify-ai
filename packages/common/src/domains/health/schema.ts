import { z } from 'zod'

export const HealthSchema = z.object({
  status: z.enum(['ok', 'error']),
})
export type Health = z.infer<typeof HealthSchema>