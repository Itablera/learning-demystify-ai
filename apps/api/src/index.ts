import Fastify from 'fastify'
import { registerRoutes } from './routes'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import config from '@workspace/env'
import { registerPlugins } from './plugins'

// Create Fastify server
const fastify = Fastify({
  logger: config.server.logger,
}).withTypeProvider<ZodTypeProvider>()
export type RoutesProvider = typeof fastify

// Add schema validator and serializer
fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

// Setup server
async function setupServer() {
  // Register all plugins
  await registerPlugins(fastify)

  // Register all routes
  await registerRoutes(fastify)

  // Handle 404 errors
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'Route not found' })
  })

  // Start the server
  try {
    await fastify.listen({
      port: config.server.port,
      host: config.server.host,
    })
    fastify.log.info(`Server listening on ${config.server.host}:${config.server.port}`)
    fastify.log.info(
      `Documentation available at http://${config.server.host}:${config.server.port}/documentation`
    )
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Initialize server
setupServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
