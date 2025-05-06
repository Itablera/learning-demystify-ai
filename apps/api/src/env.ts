// Environment variables for the API
import { serverConfig, vectorDbConfig, ollamaConfig, embeddingsConfig } from '@workspace/env'

export const env = {
  // Server configuration
  PORT: String(serverConfig.port),
  NODE_ENV: serverConfig.nodeEnv,

  // Qdrant configuration
  QDRANT_URL: vectorDbConfig.qdrantUrl,

  // Ollama configuration
  OLLAMA_API_URL: ollamaConfig.apiUrl,
  OLLAMA_MODEL: ollamaConfig.model,

  // Embedding model configuration
  EMBEDDING_MODEL: embeddingsConfig.model,
  EMBEDDING_DIMENSION: embeddingsConfig.dimension,
}
