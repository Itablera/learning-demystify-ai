import { RetrievalResult } from '@workspace/domains'
import { AIService } from '../ai-service'
import { ChatOllama } from '@langchain/ollama'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables'
import config from '@workspace/env'

export class OllamaAIService implements AIService {
  private model: string
  private baseUrl: string
  private modelInstance: ChatOllama

  // Prompt templates
  private contextPromptTemplate = PromptTemplate.fromTemplate(`
    Answer the question based on the following context:
    
    Context:
    {context}
    
    Question: {query}
  `)

  private noContextPromptTemplate = PromptTemplate.fromTemplate(`
    Answer the following question to the best of your ability:
    
    Question: {query}
  `)

  constructor(model: string = config.ollama.model, baseUrl: string = config.ollama.apiUrl) {
    this.model = model
    this.baseUrl = baseUrl

    // Initialize the Ollama model instance
    this.modelInstance = new ChatOllama({
      model: this.model,
      baseUrl: this.baseUrl,
    })
  }

  private formatContext(context: RetrievalResult[]): string {
    if (!context.length) return ''

    return context
      .map(item => `[${item.id}] (score: ${item.score.toFixed(2)}):\n${item.content}`)
      .join('\n\n')
  }

  async generateResponse(query: string, context?: RetrievalResult[]): Promise<string> {
    // Choose the appropriate prompt template based on context availability
    const hasContext = context && context.length > 0

    // Set up the pipeline
    let chain: RunnableSequence

    if (hasContext) {
      chain = RunnableSequence.from([
        {
          query: new RunnablePassthrough(),
          context: () => this.formatContext(context),
        },
        this.contextPromptTemplate,
        this.modelInstance,
        new StringOutputParser(),
      ])
    } else {
      chain = RunnableSequence.from([
        {
          query: new RunnablePassthrough(),
        },
        this.noContextPromptTemplate,
        this.modelInstance,
        new StringOutputParser(),
      ])
    }

    // Execute the chain
    return await chain.invoke(query)
  }

  async *generateResponseStream(query: string, context?: RetrievalResult[]): AsyncIterable<string> {
    // Choose the appropriate prompt template based on context availability
    const hasContext = context && context.length > 0

    // Set up the pipeline
    let chain: RunnableSequence

    if (hasContext) {
      chain = RunnableSequence.from([
        {
          query: new RunnablePassthrough(),
          context: () => this.formatContext(context),
        },
        this.contextPromptTemplate,
        this.modelInstance,
        new StringOutputParser(),
      ])
    } else {
      chain = RunnableSequence.from([
        {
          query: new RunnablePassthrough(),
        },
        this.noContextPromptTemplate,
        this.modelInstance,
        new StringOutputParser(),
      ])
    }

    // Execute the chain with streaming
    const stream = await chain.stream(query)

    // Yield each chunk from the stream
    for await (const chunk of stream) {
      yield chunk
    }
  }
}
