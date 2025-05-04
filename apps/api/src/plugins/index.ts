import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastifySensible from '@fastify/sensible'
import fastifyCors from '@fastify/cors'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export async function registerPlugins(fastify: FastifyInstance): Promise<void> {
  // Register CORS middleware to handle cross-origin requests
  await fastify.register(fastifyCors, {
    origin: ['http://localhost:5180'], // Allow frontend origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Allow cookies in cross-origin requests
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  })

  // Register @fastify/sensible for enhanced HTTP errors and utilities
  await fastify.register(fastifySensible)

  fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Test swagger',
        description: 'Testing the Fastify swagger API',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'user', description: 'User related end-points' },
        { name: 'code', description: 'Code related end-points' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
    },
    transform: jsonSchemaTransform,

    // You can also create transform with custom skiplist of endpoints that should not be included in the specification:
    //
    // transform: createJsonSchemaTransform({
    //   skipList: [ '/documentation/static/*' ]
    // })
  })

  fastify.register(fastifySwaggerUI, {
    routePrefix: '/documentation',
  })

  // Here you can register other plugins as needed
  // e.g., JWT authentication, rate limiting, etc.
}
