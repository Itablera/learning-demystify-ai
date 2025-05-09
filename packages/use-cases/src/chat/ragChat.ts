import { AIService, VectorStore } from '@workspace/integrations'

/**
 * Contains all use cases for a RAG based chat. Ollama will be used in the end
 */
export interface ChatDependencies {
  aiService: AIService
  vectorStore: VectorStore
}

export async function StreamingRAGChat(dependencies: ChatDependencies, query: string) {
  const { vectorStore, aiService } = dependencies

  // 1. Retrieve relevant documents from the vector store
  const retrievedDocs = await vectorStore.vectorSearch(query)

  // 2. Use the retrieved documents to generate a response
  const response = await aiService.generateResponse(query, retrievedDocs)

  // 3. Return the generated response
  return response
}
