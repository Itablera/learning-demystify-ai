import { DocumentRepository } from '@workspace/domains'
import { Embeddings } from '@workspace/integrations'
import { InMemoryDocumentRepository } from './documentRepository'

// In-memory repository instance (singleton)
let documentRepositoryInstance: DocumentRepository | null = null

/**
 * Get the document repository instance
 * Creates an in-memory repository if one doesn't exist
 */
export function getDocumentRepository(embeddings: Embeddings): DocumentRepository {
  if (!documentRepositoryInstance) {
    documentRepositoryInstance = new InMemoryDocumentRepository(embeddings)
  }
  return documentRepositoryInstance
}

export * from './documentRepository'
