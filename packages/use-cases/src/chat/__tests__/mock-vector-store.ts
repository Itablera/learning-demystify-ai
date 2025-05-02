import { RetrievalResult, VectorSearchOptions } from '@workspace/domains'
import { VectorStore } from '@workspace/integrations'
import { randomUUID } from 'crypto'

/**
 * Mock implementation of VectorStore for testing
 */
export class MockVectorStore implements VectorStore {
  private documents: Map<string, { content: string; metadata?: Record<string, unknown> }> =
    new Map()
  private mockResults: RetrievalResult[] = []

  async vectorSearch(query: string, options?: VectorSearchOptions): Promise<RetrievalResult[]> {
    return this.mockResults
  }

  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    const id = randomUUID()
    this.documents.set(id, { content, metadata })
    return id
  }

  // Test helper methods
  setMockResults(results: RetrievalResult[]): void {
    this.mockResults = results
  }

  getDocuments(): Map<string, { content: string; metadata?: Record<string, unknown> }> {
    return this.documents
  }
}
