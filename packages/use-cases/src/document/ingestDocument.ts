import { Document, DocumentRepository, TextChunkingOptions } from '@workspace/domains'
import { Embeddings, TextSplitter, VectorStore } from '@workspace/integrations'

/**
 * Dependencies for the ingestDocument use-case
 */
interface IngestDocumentDependencies {
  documentRepository: DocumentRepository
  vectorStore: VectorStore
  textSplitter: TextSplitter
  embeddings: Embeddings
}

/**
 * Ingest a document into the knowledge base for RAG
 * This process:
 * 1. Creates a document record
 * 2. Splits the document into chunks
 * 3. For each chunk, adds it to the vector store
 * 4. Stores document chunks in the document repository
 */
export const ingestDocument = async (
  content: string,
  metadata: Record<string, unknown> = {},
  chunkingOptions: TextChunkingOptions,
  { documentRepository, vectorStore, textSplitter, embeddings }: IngestDocumentDependencies
): Promise<Document> => {
  // Create document record
  const document = await documentRepository.createDocument(content, metadata)

  // Split document into chunks
  const textChunks = await textSplitter.splitText(content, chunkingOptions)

  // Process each chunk
  const chunkPromises = textChunks.map(async chunkContent => {
    // Add to vector store with document reference
    const chunkId = await vectorStore.addDocument(chunkContent, {
      ...metadata,
      documentId: document.id,
    })

    // Return chunk data for document repository
    return {
      content: chunkContent,
      metadata: {
        ...metadata,
        vectorChunkId: chunkId,
      },
    }
  })

  // Store all chunks in document repository
  const chunks = await Promise.all(chunkPromises)
  await documentRepository.createDocumentChunks(document.id, chunks)

  return document
}
