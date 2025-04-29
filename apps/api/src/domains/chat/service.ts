import { Message, RetrievalResult } from '@workspace/common/domains'

/**
 * Interface for AI service adapters that can generate chat completions
 */
export interface AIServiceAdapter {
  /**
   * Generate a chat completion from a list of messages
   * @param messages The chat messages to use for generation
   * @param retrievalResults Optional retrieval results to include as context
   * @returns A string containing the generated text
   */
  generateCompletion(
    messages: Message[], 
    retrievalResults?: RetrievalResult[]
  ): Promise<string>
  
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
}

/**
 * Mock AI service adapter for development and testing
 */
export class MockAIServiceAdapter implements AIServiceAdapter {
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
      response += `Based on the retrieved information: ${retrievalResults.map(r => r.content).join(' ')}`;
    } else {
      response += 'I don\'t have any specific information about that.';
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