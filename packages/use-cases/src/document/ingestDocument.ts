import { Document, DocumentChunk, DocumentRepository, TextChunkingOptions } from '@workspace/domains'
import { Embeddings, TextSplitter } from '@workspace/integrations'

interface IngestDocumentDependencies {
  documentRepository: DocumentRepository
  textSplitter: TextSplitter
  embeddings: Embeddings
}

/**
 * Ingest a document into the knowledge base for RAG
 * This process:
 * 1. Creates a document record
 * 2. Splits the document into chunks
 * 3. Generates embeddings for each chunk
 * 4. Stores chunks with embeddings
 */
export const ingestDocument = async (
  content: string,
  metadata: Record<string, unknown> = {},
  chunkingOptions?: TextChunkingOptions,
  { documentRepository, textSplitter, embeddings }: IngestDocumentDependencies
): Promise<Document> => {
  // Create document record
  const document = await documentRepository.createDocument(content, metadata)

  // Split document into chunks
  const textChunks = await textSplitter.splitText(content, chunkingOptions)

  // Create document chunks with embeddings
  const chunkPromises = textChunks.map(async (chunkContent) => {
    // Generate embedding for this chunk
    const embedding = await embeddings.getEmbedding(chunkContent)
    
    return {
      content: chunkContent,
      metadata,
      embedding
    }
  })

  // Process all chunks
  const chunks = await Promise.all(chunkPromises)
  await documentRepository.createDocumentChunks(document.id, chunks)

  return document
}