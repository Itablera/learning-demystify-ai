import { ChatOllama } from '@langchain/ollama'
import {
  SystemMessage,
  HumanMessage,
  AIMessage
} from '@langchain/core/messages'
import { Message } from '@workspace/common/domains'
import { ChatActor } from '@workspace/common/types'

/**
 * Service to interact with LangChain for AI-powered features
 */
export class LangChainService {
  private model: ChatOllama

  constructor() {
    this.model = new ChatOllama({
      model: 'deepseek-r1',
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    })
  }

  /**
   * Generate an AI response based on user input and chat history
   */
  async generateChatResponse(userMessage: string, history: Message[]): Promise<string> {
    // Convert our domain messages to LangChain message format
    const messages = this.convertToChatMessages(history)
    
    // Add the new user message
    messages.push(new HumanMessage(userMessage))
    
    // Call the language model
    const response = await this.model.call(messages)
    
    return response.content.toString()
  }

  /**
   * Convert our domain message format to LangChain message format
   */
  private convertToChatMessages(messages: Message[]) {
    return messages.map(message => {
      switch (message.actor) {
        case ChatActor.SYSTEM:
          return new SystemMessage(message.content)
        case ChatActor.USER:
          return new HumanMessage(message.content)
        case ChatActor.ASSISTANT:
          return new AIMessage(message.content)
        default:
          throw new Error(`Unknown actor type: ${message.actor}`)
      }
    })
  }
}