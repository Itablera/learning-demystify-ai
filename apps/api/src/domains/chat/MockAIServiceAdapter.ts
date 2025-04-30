import { Message, RetrievalResult } from '@workspace/domains'
import { AIServiceAdapter } from './service'

/**
 * Mock AI service adapter for development and testing
 */

export class MockAIServiceAdapter implements AIServiceAdapter {
  /**
   * Simple method to test the connection with a one-shot chat
   * @param message The message to send to the model
   * @returns A promise that resolves to the model's response
   */
  async simpleChat(message: string): Promise<string> {
    return `Mock response to: "${message}"`
  }

  /**
   * Generate a full completion response
   */
  async generateCompletion(
    messages: Message[],
    retrievalResults?: RetrievalResult[]
  ): Promise<string> {
    // In a real implementation, this would call an LLM API
    const userMessage = messages.findLast(m => m.role === 'user')?.content || ''

    let response = `I received your message: "${userMessage}". `

    if (retrievalResults && retrievalResults.length > 0) {
      response += `Based on the retrieved information: ${retrievalResults.map(r => r.content).join(' ')}`
    } else {
      response += "I don't have any specific information about that."
    }

    return response
  }

  /**
   * Stream a completion response
   */
  async *streamCompletion(
    messages: Message[],
    retrievalResults?: RetrievalResult[]
  ): AsyncGenerator<string, void, unknown> {
    // Generate the full response
    const fullResponse = await this.generateCompletion(messages, retrievalResults)

    // Split into words and stream one by one with a delay
    const words = fullResponse.split(' ')

    for (const word of words) {
      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 100))
      yield word + ' '
    }
  }
}
