import { Message, RetrievalResult } from '@workspace/domains'
import { AI } from '@workspace/integrations'

/**
 * Mock implementation of AI service for testing
 */
export class MockAI implements AI {
  private mockResponse: string = ''
  private mockStreamResponse: string[] = []

  async generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string> {
    return this.mockResponse
  }

  async *streamCompletion(
    messages: Message[],
    context?: RetrievalResult[]
  ): AsyncGenerator<string> {
    for (const chunk of this.mockStreamResponse) {
      yield chunk
    }
  }

  // Test helper methods
  setMockResponse(response: string): void {
    this.mockResponse = response
  }

  setMockStreamResponse(chunks: string[]): void {
    this.mockStreamResponse = chunks
  }
}
