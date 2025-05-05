import { DocumentChunk, DocumentRepository } from '@workspace/domains'
import { Embeddings } from '@workspace/integrations'

interface SearchDocumentsDependencies {
  documentRepository: DocumentRepository
}

/**
 * Search for documents in the knowledge base
 * Uses the vector similarity search functionality from the document repository
 */
export const searchDocuments = async (
  query: string,
  limit: number = 5,
  threshold: number = 0.7,
  { documentRepository }: SearchDocumentsDependencies
): Promise<DocumentChunk[]> => {
  // Perform similarity search
  return documentRepository.similaritySearch(query, limit, threshold)
}