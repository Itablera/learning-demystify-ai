import { RetrievalResult } from '@workspace/domains'

/**
 * Interfaces and types for the AI service.
 */
export interface ChatBot {
  generateResponse: (query: string, context?: RetrievalResult[]) => Promise<string>
  generateResponseStream: (query: string, context?: RetrievalResult[]) => AsyncIterable<string>
}
