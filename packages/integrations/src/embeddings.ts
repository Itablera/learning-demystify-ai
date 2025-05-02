/**
 * Service for generating embeddings from text
 * This is a domain service for creating vector representations of text
 */
export interface Embeddings {
  /**
   * Convert text to a vector embedding
   */
  getEmbedding(text: string): Promise<number[]>

  /**
   * Convert multiple texts to vector embeddings (optional batch processing)
   */
  embedBatch?(texts: string[]): Promise<number[][]>
}
