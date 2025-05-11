import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/**
 * Environment configuration module
 * Centralizes all environment variable access across the application
 */

/**
 * Server configuration
 */
export const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  logger: process.env.LOGGER === 'true',
}

/**
 * Ollama configuration
 */
export const ollamaConfig = {
  apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3',
}

/**
 * Embeddings configuration
 */
export const embeddingsConfig = {
  model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
  dimension: process.env.EMBEDDING_DIMENSION ? parseInt(process.env.EMBEDDING_DIMENSION, 10) : 384,
}

/**
 * Vector database configuration
 */
export const vectorDbConfig = {
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  collectionName: process.env.QDRANT_COLLECTION || 'documents',
}

/**
 * Combined configuration object
 */
export const config = {
  server: serverConfig,
  ollama: ollamaConfig,
  embeddings: embeddingsConfig,
  vectorDb: vectorDbConfig,
}

export default config
