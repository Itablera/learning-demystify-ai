import { z } from 'zod'
import { TextChunkingOptionsSchema } from '@workspace/domains'

/**
 * Schema for document ingestion request
 */
export const IngestDocumentRequestSchema = z.object({
  content: z.string().min(1, 'Document content cannot be empty'),
  metadata: z.record(z.string(), z.any()).optional(),
  chunkingOptions: TextChunkingOptionsSchema.optional(),
})
export type IngestDocumentRequest = z.infer<typeof IngestDocumentRequestSchema>

/**
 * Schema for document search request
 */
export const SearchDocumentsRequestSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
  limit: z.number().int().positive().default(5).optional(),
  threshold: z.number().min(0).max(1).default(0.7).optional(),
})
export type SearchDocumentsRequest = z.infer<typeof SearchDocumentsRequestSchema>
