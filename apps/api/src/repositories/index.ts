import { DocumentRepository } from '@workspace/domains'
import { InMemoryDocumentRepository } from './documentRepository'

// In-memory repository instance (singleton)
let documentRepositoryInstance: DocumentRepository | null = null

/**
 * Get the document repository instance
 * Creates an in-memory repository if one doesn't exist
 */
export function getDocumentRepository(): DocumentRepository {
  if (!documentRepositoryInstance) {
    documentRepositoryInstance = new InMemoryDocumentRepository()
  }
  return documentRepositoryInstance
}

export * from './documentRepository'
