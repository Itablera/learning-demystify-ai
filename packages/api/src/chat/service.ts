import { Message, RetrievalResult } from '@workspace/domains'

/**
 * Interface for AI service adapters that can generate chat completions
 */

export interface AIService {
  /**
   * Generate a chat completion from a list of messages
   * @param messages The chat messages to use for generation
   * @param retrievalResults Optional retrieval results to include as context
   * @returns A string containing the generated text
   */
  generateCompletion(messages: Message[], retrievalResults?: RetrievalResult[]): Promise<string>

  /**
   * Generate a chat completion that streams the response
   * @param messages The chat messages to use for generation
   * @param retrievalResults Optional retrieval results to include as context
   * @returns An async generator that yields chunks of text
   */
  streamCompletion(
    messages: Message[],
    retrievalResults?: RetrievalResult[]
  ): AsyncGenerator<string, void, unknown>

  /**
   * Simple one-shot chat for testing Ollama server connection
   * @param message The message to send to the model
   * @returns A promise that resolves to the model's response
   */
  simpleChat(message: string): Promise<string>
}
