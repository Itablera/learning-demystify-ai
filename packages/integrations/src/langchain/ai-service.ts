import { Message, RetrievalResult } from '@workspace/domains'
import { AI } from '../ai'
import { ChatOllama } from '@langchain/ollama'
import { OllamaEmbeddings } from '@langchain/ollama'
import { StringOutputParser } from '@langchain/core/output_parsers'
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  AIMessagePromptTemplate,
} from '@langchain/core/prompts'

/**
 * LangChain implementation of the AI service interface
 * Uses Ollama for local LLM inference and embeddings
 */
export class LangChainAI implements AI {
  private llm: ChatOllama
  private embeddings: OllamaEmbeddings
  private baseSystemPrompt: string

  constructor(
    modelName: string = 'llama3',
    embeddingModel: string = 'nomic-embed-text',
    baseSystemPrompt: string = 'You are a helpful AI assistant.'
  ) {
    this.llm = new ChatOllama({
      model: modelName,
      temperature: 0.7,
    })

    this.embeddings = new OllamaEmbeddings({
      model: embeddingModel,
      toplP: 0.9,
    })

    this.baseSystemPrompt = baseSystemPrompt
  }

  async generateCompletion(messages: Message[], context?: RetrievalResult[]): Promise<string> {
    const promptMessages = this.buildPromptMessages(messages, context)
    const result = await promptMessages.pipe(this.llm).pipe(new StringOutputParser()).invoke()
    return result
  }

  async *streamCompletion(
    messages: Message[],
    context?: RetrievalResult[]
  ): AsyncGenerator<string> {
    const promptMessages = this.buildPromptMessages(messages, context)
    const stream = await promptMessages.pipe(this.llm).pipe(new StringOutputParser()).stream()

    for await (const chunk of stream) {
      yield chunk
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text)
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts)
  }

  private buildPromptMessages(messages: Message[], context?: RetrievalResult[]) {
    let systemContent = this.baseSystemPrompt

    // Add retrieval context if available
    if (context && context.length > 0) {
      const contextText = context
        .map(
          item =>
            `Content: "${item.content}"\n${item.metadata ? `Source: ${JSON.stringify(item.metadata)}\n` : ''}`
        )
        .join('\n\n')

      systemContent += `\n\nUse the following information to answer the user's question. If the information doesn't contain the answer, just say so.\n\n${contextText}`
    }

    // Create prompt template
    const promptMessages = []
    promptMessages.push(SystemMessagePromptTemplate.fromTemplate(systemContent))

    // Add conversation history
    for (const message of messages) {
      if (message.role === 'user') {
        promptMessages.push(HumanMessagePromptTemplate.fromTemplate(message.content))
      } else if (message.role === 'assistant') {
        promptMessages.push(AIMessagePromptTemplate.fromTemplate(message.content))
      } else if (message.role === 'system') {
        // For system messages in the conversation, we append them to our system prompt
        promptMessages.push(SystemMessagePromptTemplate.fromTemplate(message.content))
      }
    }

    return ChatPromptTemplate.fromMessages(promptMessages)
  }
}
