// Environment variables for the API
export const env = {
  // Server configuration
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Qdrant configuration
  QDRANT_URL: process.env.QDRANT_URL || 'http://localhost:6333',

  // Ollama configuration
  OLLAMA_API_URL: process.env.OLLAMA_API_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',

  // Embedding model configuration
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'llama3',
  EMBEDDING_DIMENSION: parseInt(process.env.EMBEDDING_DIMENSION || '384', 10),
}
