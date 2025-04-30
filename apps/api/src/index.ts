import 'dotenv/config'
import Fastify from 'fastify'
import { config } from './config/index.js'
import { registerPlugins } from './plugins/index.js'
import { registerRoutes } from './routes/index.js'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import dotenv from 'dotenv'

dotenv.config()

const fastify = Fastify({
  logger: config.logger,
}).withTypeProvider<ZodTypeProvider>()
export type RoutesProvider = typeof fastify

// Add schema validator and serializer
fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

/**
 * Run the server!
 */
const start = async () => {
  try {
    // Register all plugins
    await registerPlugins(fastify)

    // Register all routes
    await registerRoutes(fastify)

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

start()
