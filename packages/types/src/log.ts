import z from 'zod'

export const LogEntrySchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.date(),
})
export type LogEntry = z.infer<typeof LogEntrySchema>

export const LogSchema = z.array(LogEntrySchema).nullable().optional()
export type Log = z.infer<typeof LogSchema>
