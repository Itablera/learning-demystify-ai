import { z } from 'zod'

// Document schema for RAG store
export const DocumentSchema = z.object({
  id: z.string(),
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
})
export type Document = z.infer<typeof DocumentSchema>

// Chunking options for text splitting
export const TextChunkingOptionsSchema = z.object({
  chunkSize: z.number().int().positive().default(1000),
  chunkOverlap: z.number().int().nonnegative().default(200),
})
export type TextChunkingOptions = z.infer<typeof TextChunkingOptionsSchema>

// Schema for document chunks (after text splitting)
export const DocumentChunkSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  embedding: z.array(z.number()).optional(),
})
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>
