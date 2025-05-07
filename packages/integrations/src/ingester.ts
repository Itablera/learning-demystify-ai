/**
 * Service for retrieving relevant information from a knowledge base
 * Core component of RAG (Retrieval Augmented Generation)
 */
export interface Ingester {
  /**
   * Ingest a document into the system
   * @param content Document content
   * @param metadata Optional metadata
   *
   * @returns The ID of the ingested document
   */
  ingest(content: string, metadata?: Record<string, unknown>): Promise<string>

  /**
   * Ingest multiple documents into the system
   * @param documents Array of document content and optional metadata
   *
   * @returns Array of IDs of the ingested documents
   */
  ingestMany(
    documents: Array<{ content: string; metadata?: Record<string, unknown> }>
  ): Promise<string[]>

  /**
   * Ingest chunks
   * @param chunks Array of document chunks
   * @param metadata Optional metadata
   *
   * @returns The IDs of the ingested chunks
   */
  ingestChunks(chunks: Array<string>, metadata?: Record<string, unknown>): Promise<string[]>
}
