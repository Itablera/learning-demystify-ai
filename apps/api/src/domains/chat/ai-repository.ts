import { AIRepository, Message, RetrievalResult } from '@workspace/domains'
import fetch from 'node-fetch'

export class OllamaAIRepository implements AIRepository {
  private model: string
  private baseUrl: string

  constructor(model: string = 'llama3', baseUrl: string = 'http://localhost:11434') {
    this.model = model
    this.baseUrl = baseUrl
  }

  // Simple test method to say hi
  async sayHi(): Promise<string> {
    return 'Hi there! This is a simple response from the AI service.'
  }

  // Simple chat without context
  async simpleChat(message: string): Promise<string> {
    return this.generateCompletion([
      { id: '1', role: 'user', content: message, createdAt: new Date().toISOString() },
    ])
  }

  // Generate a completion based on messages and optional retrieval results
  async generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string> {
    try {
      const prompt = this.buildPrompt(messages, context)

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} ${errorText}`)
      }

      const data = (await response.json()) as { response: string }
      return data.response
    } catch (error) {
      console.error('Error generating completion:', error)
      return `Error generating response: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // Stream a completion based on messages and optional retrieval results
  async *streamCompletion(
    messages: Message[],
    context?: RetrievalResult[]
  ): AsyncGenerator<string> {
    try {
      const prompt = this.buildPrompt(messages, context)

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true })

        // Process each complete line
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const data = JSON.parse(line)
            if (data.response) {
              yield data.response
            }
          } catch (e) {
            console.warn('Error parsing JSON from stream:', line)
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer)
          if (data.response) {
            yield data.response
          }
        } catch (e) {
          console.warn('Error parsing JSON from final buffer:', buffer)
        }
      }
    } catch (error) {
      console.error('Error streaming completion:', error)
      yield `Error generating response: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // Helper to build a prompt that includes context and conversation history
  private buildPrompt(messages: Message[], context?: RetrievalResult[]): string {
    let prompt = ''

    // Add context if available
    if (context && context.length > 0) {
      prompt += 'Context information:\n\n'
      context.forEach(item => {
        prompt += `${item.content}\n\n`
      })
      prompt += '---\n\n'
    }

    // Add conversation history formatted in a way the LLM understands
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'USER' : 'ASSISTANT'
      prompt += `${role}: ${msg.content}\n`
    })

    // If the last message wasn't from the assistant, add the assistant prompt
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role !== 'assistant') {
      prompt += 'ASSISTANT: '
    }

    return prompt
  }
}
