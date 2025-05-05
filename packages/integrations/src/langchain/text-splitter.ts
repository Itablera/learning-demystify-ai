import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { TextChunkingOptions } from '@workspace/domains'
import { TextSplitter } from '../text-splitter'

/**
 * LangChain implementation of the TextSplitter interface
 * Uses RecursiveCharacterTextSplitter for intelligent document chunking
 */
export class LangChainTextSplitter implements TextSplitter {
  async splitText(text: string, options?: TextChunkingOptions): Promise<string[]> {
    const chunkSize = options?.chunkSize || 1000
    const chunkOverlap = options?.chunkOverlap || 200
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap
    })
    
    return splitter.splitText(text)
  }
}