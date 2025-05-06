import { z } from 'zod'
import { DataResponseSchema } from '../http/schema'
import { DocumentChunk, DocumentSchema, TextChunkingOptionsSchema } from '@workspace/domains'

/**
 * Search Documents Request Schema
 */
export const SearchDocumentsRequestSchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().default(5),
  threshold: z.number().min(0).max(1).default(0.7),
})

export type SearchDocumentsRequest = z.infer<typeof SearchDocumentsRequestSchema>

/**
 * Search Documents Response Schema
 */
export const SearchDocumentsResponseSchema = DataResponseSchema(
  z.array(
    z.object({
      id: z.string(),
      documentId: z.string(),
      content: z.string(),
      metadata: z.record(z.string(), z.any()).optional(),
      score: z.number().optional(),
    })
  )
)

export type SearchDocumentsResponse = z.infer<typeof SearchDocumentsResponseSchema>

/**
 * Ingest Document Request Schema
 */
export const IngestDocumentRequestSchema = z.object({
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  chunkingOptions: TextChunkingOptionsSchema.optional(),
})

export type IngestDocumentRequest = z.infer<typeof IngestDocumentRequestSchema>

/**
 * Ingest Document Response Schema
 */
export const IngestDocumentResponseSchema = DataResponseSchema(DocumentSchema)

export type IngestDocumentResponse = z.infer<typeof IngestDocumentResponseSchema>
