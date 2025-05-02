import { AIService, Message, RetrievalResult } from '@workspace/domains'
import { ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { env } from '@/env'

/**
 * Ollama AI service that uses LangChain to interact with Ollama
 */
export class OllamaAIService implements AIService {
  private model: ChatOllama
  private retrievalPromptTemplate: PromptTemplate<{ context: string; question: string }>
  private standardPromptTemplate: PromptTemplate<{ question: string }>

  /**
   * Create a new Ollama service
   * @param modelName The name of the Ollama model to use (e.g., 'llama3')
   * @param baseUrl The base URL of the Ollama API
   */
  constructor(
    modelName: string = env.OLLAMA_MODEL || 'llama3',
    baseUrl: string = env.OLLAMA_API_URL || 'http://localhost:11434'
  ) {
    // Initialize the Ollama model with specified options
    this.model = new ChatOllama({
      model: modelName,
      baseUrl: baseUrl,
      temperature: 0.7,
    })

    // Create prompt template for RAG queries (with context)
    this.retrievalPromptTemplate = PromptTemplate.fromTemplate(`
      Answer the following question based on the provided context.
      
      Context:
      {context}
      
      Question:
      {question}
      
      Answer:
    `)

    // Create prompt template for standard queries (without context)
    this.standardPromptTemplate = PromptTemplate.fromTemplate(`
      Answer the following question:
      
      Question:
      {question}
      
      Answer:
    `)
  }

  /**
   * Convert Message[] from domain model to LangChain format
   */
  private convertMessagesToLangChainFormat(
    messages: Message[]
  ): { role: string; content: string }[] {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'human' : msg.role === 'assistant' ? 'ai' : 'system',
      content: msg.content,
    }))
  }

  /**
   * Format retrieval results into a single context string
   */
  private formatRetrievalContext(retrievalResults: RetrievalResult[]): string {
    return retrievalResults.map((result, index) => `[${index + 1}] ${result.content}`).join('\n\n')
  }

  /**
   * Get the most recent user message
   */
  private getLatestUserMessage(messages: Message[]): string {
    return messages.findLast(m => m.role === 'user')?.content || ''
  }

  /**
   * Simple method to test the Ollama connection with a one-shot chat
   * @param message The message to send to the model
   * @returns A promise that resolves to the model's response
   */
  async simpleChat(message: string): Promise<string> {
    try {
      // Simple one-shot query to test Ollama connection
      const chain = RunnableSequence.from([
        this.standardPromptTemplate,
        this.model,
        new StringOutputParser(),
      ])

      const response = await chain.invoke({
        question: message,
      })

      return response
    } catch (error) {
      if (error instanceof Error) {
        return `Error connecting to Ollama: ${error.message}`
      }
      return 'Unknown error connecting to Ollama'
    }
  }

  /**
   * Say hi
   */
  async sayHi(): Promise<string> {
    try {
      const response = await this.model.invoke('Hi!')
      return response.text
    } catch (error) {
      if (error instanceof Error) {
        return `Error connecting to Ollama: ${error.message}`
      }
      return 'Unknown error connecting to Ollama'
    }
  }

  /**
   * Generate a full completion response
   */
  async generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string> {
    const question = this.getLatestUserMessage(messages)
    const chatHistory = this.convertMessagesToLangChainFormat(
      messages.slice(0, -1) // Exclude the latest message as we'll use it explicitly
    )

    // Set up our generation chain
    let chain: RunnableSequence

    if (context && context.length > 0) {
      // RAG approach with retrieval results as context
      const contextString = this.formatRetrievalContext(context)

      chain = RunnableSequence.from([
        this.retrievalPromptTemplate,
        this.model,
        new StringOutputParser(),
      ])

      return chain.invoke({
        context: contextString,
        question,
      })
    } else {
      // Standard approach without retrieval
      chain = RunnableSequence.from([
        this.standardPromptTemplate,
        this.model,
        new StringOutputParser(),
      ])

      return chain.invoke({
        question,
      })
    }
  }

  /**
   * Stream a completion response
   */
  async *streamCompletion(
    messages: Message[],
    context?: RetrievalResult[]
  ): AsyncGenerator<string> {
    const question = this.getLatestUserMessage(messages)
    const chatHistory = this.convertMessagesToLangChainFormat(
      messages.slice(0, -1) // Exclude the latest message as we'll use it explicitly
    )

    // Set up our streaming chain
    let chain: RunnableSequence
    let streamPromise: Promise<AsyncIterable<string>>

    if (context && context.length > 0) {
      // RAG approach with retrieval results as context
      const contextString = this.formatRetrievalContext(context)

      chain = RunnableSequence.from([
        this.retrievalPromptTemplate,
        this.model,
        new StringOutputParser(),
      ])

      streamPromise = chain.stream({
        context: contextString,
        question,
      })
    } else {
      // Standard approach without retrieval
      chain = RunnableSequence.from([
        this.standardPromptTemplate,
        this.model,
        new StringOutputParser(),
      ])

      streamPromise = chain.stream({
        question,
      })
    }

    // Process stream with timeout handling
    try {
      const stream = (await Promise.race([
        streamPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Initial stream connection timeout')), 10000)
        ),
      ])) as AsyncIterable<string>

      // Create a more efficient processing loop with buffer
      const iterator = stream[Symbol.asyncIterator]()
      let result: IteratorResult<string, void>

      // Process chunks with individual timeouts
      while (true) {
        try {
          result = (await Promise.race([
            iterator.next(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Chunk processing timeout')), 5000)
            ),
          ])) as IteratorResult<string, void>

          if (result.done) break
          yield result.value
        } catch (error) {
          // If a timeout occurs, yield a special message and continue
          if (error instanceof Error && error.message.includes('timeout')) {
            console.warn('Stream chunk timed out, continuing with next chunk')
            continue
          }
          throw error
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      yield `Error in stream processing: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
