import { AIService, VectorStore } from '@workspace/integrations'

export interface ChatDependencies {
  aiService: AIService
}

export interface RAGChatDependencies extends ChatDependencies {
  vectorStore: VectorStore
}

export async function Chat(dependencies: ChatDependencies, query: string) {
  const { aiService } = dependencies

  // 1. Use the AI service to generate a response
  const response = await aiService.generateResponse(query)

  // 2. Return the generated response
  return response
}

export async function RAGChat(dependencies: RAGChatDependencies, query: string) {
  const { vectorStore, aiService } = dependencies

  // 1. Retrieve relevant documents from the vector store
  const retrievedDocs = await vectorStore.vectorSearch(query)

  // 2. Use the retrieved documents to generate a response
  const response = await aiService.generateResponse(query, retrievedDocs)

  // 3. Return the generated response
  return response
}

export async function RAGChatStream(dependencies: RAGChatDependencies, query: string) {
  const { vectorStore, aiService } = dependencies

  // 1. Retrieve relevant documents from the vector store
  const retrievedDocs = await vectorStore.vectorSearch(query)

  // 2. Use the retrieved documents to generate a response
  const responseStream = await aiService.generateResponseStream(query, retrievedDocs)

  // 3. Return the generated response stream
  return responseStream
}
