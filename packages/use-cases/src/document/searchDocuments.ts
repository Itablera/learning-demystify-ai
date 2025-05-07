import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { VectorStore } from '@workspace/integrations'

/**
 * Dependencies required for document search
 */
interface SearchDocumentsDependencies {
  vectorStore: VectorStore
}

/**
 * Search for documents in the knowledge base using vector similarity
 */
export const searchDocuments = async (
  query: string,
  options: VectorSearchOptions,
  { vectorStore }: SearchDocumentsDependencies
): Promise<RetrievalResult[]> => {
  // Perform vector search through the vector store integration
  return vectorStore.vectorSearch(query, options)
}
