import { TextChunkingOptions } from '../../domains/src/document/schema'

/**
 * Service for splitting documents into chunks
 * Used in RAG preprocessing for more effective retrieval
 */
export interface TextSplitter {
  /**
   * Split text into smaller chunks for more effective retrieval
   * @param text The text content to split
   * @param options Options for text chunking
   * @returns Array of text chunks
   */
  splitText(text: string, options?: TextChunkingOptions): Promise<string[]>
}